/**
 * ozon-browser.mjs — управление headless Chromium для Ozon.
 *
 * Адаптировано из eduard256/ozon-mcp-server (MIT).
 * https://github.com/eduard256/ozon-mcp-server
 *
 * Один Chromium на запуск. Проходит Variti challenge один раз на главной
 * странице. Все запросы — через mainPage.evaluate(fetch) к внутреннему
 * composer-api Ozon, откуда приходят структурированные данные (widgetStates).
 *
 * Браузер: **patchright** (недетектируемый форк Playwright) — обычный
 * Playwright/stealth-скрипты Variti блокирует (HTTP 403 "Antibot Challenge"),
 * patchright успешно проходит (проверено на Ozon, июль 2026).
 *
 * На Vercel — автоматически отключается (Chromium там недоступен).
 * На GitHub Actions — Chromium устанавливается через `npx patchright install chromium`.
 *
 * Использование:
 *   import { fetchJson, isEnabled, shutdown } from "./ozon-browser.mjs";
 *   const page = await fetchJson("/product/123/");
 *   const prices = parsePrices(page); // из ozon-price.mjs
 *   await shutdown();
 */

const HOME = "https://www.ozon.ru/";
const HOME_ORIGIN = "https://www.ozon.ru";
const API = "https://www.ozon.ru/api/composer-api.bx/page/json/v2?url=";
const CHALLENGE_WAIT_MS = 12000; // время на проход JS-челленджа Variti
const NAV_TIMEOUT_MS = 90000;
// Сколько раз пробуем пройти челлендж за один запуск. Первая попытка может
// упасть на разовом сбое прокси (ERR_EMPTY_RESPONSE) — перезапуск браузера
// обычно лечит, но каждая попытка стоит ~13s, поэтому больше двух не надо.
const MAX_CHALLENGE_ATTEMPTS = 2;

const LAUNCH_ARGS = [
  "--disable-blink-features=AutomationControlled",
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--mute-audio",
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-extensions",
  "--disable-background-networking",
];

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Headless-режим по умолчанию. В CI (GitHub Actions) Variti блокирует headless —
// включается headful через xvfb: OZON_HEADLESS=0 + xvfb-run.
// UA тоже можно переопределить (OZON_UA), иначе — родной для Chromium.
function isHeadless() {
  return process.env.OZON_HEADLESS !== "0" && process.env.OZON_HEADLESS !== "false";
}

// Прокси (например, свой VPS с tinyproxy) — IP дата-центра GitHub Actions
// Variti блокирует, домашний/VPS IP проходит. Задаётся env-переменными:
//   OZON_PROXY_SERVER=http://host:port  (обязательный для прокси)
//   OZON_PROXY_USER=login               (basic auth, опционально)
//   OZON_PROXY_PASS=password            (basic auth, опционально)
function getProxyConfig() {
  const server = process.env.OZON_PROXY_SERVER;
  if (!server) return null;
  const cfg = { server };
  if (process.env.OZON_PROXY_USER) {
    cfg.username = process.env.OZON_PROXY_USER;
    cfg.password = process.env.OZON_PROXY_PASS ?? "";
  }
  return cfg;
}

let browser = null;
let context = null;
let mainPage = null;
let initPromise = null;
let challenged = false;
// Флаг фатального сбоя Variti: если челлендж однажды провален, дальнейшие
// попытки бессмысленны (каждая стоит ~13s на перезапуск). Дальше — быстрый отказ.
let challengeBroken = false;

function log(...args) {
  console.error("[OzonBrowser]", ...args);
}

/**
 * Можно ли запускать Chromium?
 * На Vercel — нет (ни бинарников, ни --no-sandbox).
 * При production-сборке Next.js — тоже нет.
 */
function isBrowserAvailable() {
  if (process.env.VERCEL === "1") {
    log("VERCEL=1 → браузер отключён");
    return false;
  }
  if (process.env.NEXT_PHASE === "phase-production-build") {
    log("NEXT_PHASE=build → браузер отключён");
    return false;
  }
  return true;
}

async function launch() {
  log("launching Chromium (patchright)…");
  const proxy = getProxyConfig();
  if (proxy) log(`using proxy: ${proxy.server} (user: ${proxy.username ?? "—"})`);
  // patchright — недетектируемый форк Playwright, проходит Variti.
  // Обычный playwright здесь НЕ работает (Variti блокирует headless).
  const { chromium } = await import("patchright");

  browser = await chromium.launch({
    headless: isHeadless(),
    args: LAUNCH_ARGS,
  });

  browser.on("disconnected", () => {
    log("browser disconnected — будет перезапущен при следующем запросе");
    // Безопасно закрываем остатки (child-процесс Chromium), ошибки игнорируем
    const dead = browser;
    browser = null;
    context = null;
    mainPage = null;
    challenged = false;
    dead?.close().catch(() => {});
  });

  const proxyCfg = getProxyConfig();
  context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ...(process.env.OZON_UA ? { userAgent: process.env.OZON_UA } : { userAgent: USER_AGENT }),
    locale: "ru-RU",
    ...(proxyCfg ? { proxy: proxyCfg } : {}),
  });

  challenged = false;
}

// Заглушки вместо реальной страницы = челлендж не пройден. Реальный title
// главной Ozon: «OZON маркетплейс — миллионы товаров...». Сюда же попадает
// страница ошибки Chromium («Loading https://www.ozon.ru/», ERR_EMPTY_RESPONSE):
// её title начинается с "Loading", а fetch из неё падает с "Failed to fetch".
const BAD_TITLE = /antibot|ограничен|доступ|соединени|no internet|offline|^loading\b|^error\b/i;

/**
 * Открывает главную Ozon и проверяет, что челлендж Variti реально пройден.
 *
 * Проверок три, и все обязательны:
 *  1. origin страницы — именно ozon.ru. Страница ошибки Chromium живёт на
 *     внутреннем URL, и fetch(composer-api) из неё падает "Failed to fetch"
 *     (именно так фаза цен потратила 353с в прогоне 2026-11-09, обновив 0 цен);
 *  2. title не похож на антибот-заглушку;
 *  3. smoke-запрос к composer-api из страницы реально доходит до Ozon.
 *
 * Бросает Error с причиной — вызывающий код решает, ретраить или сдаваться.
 */
async function passChallenge() {
  if (!browser || !browser.isConnected()) await launch();

  mainPage = await context.newPage();
  log("passing Variti anti-bot challenge…");

  let status = null;
  let navError = null;
  try {
    const resp = await mainPage.goto(HOME, {
      waitUntil: "domcontentloaded",
      timeout: NAV_TIMEOUT_MS,
    });
    status = resp?.status() ?? null;
  } catch (err) {
    navError = String(err?.message ?? err);
  }
  log(
    `homepage status: ${
      navError ? `ERR: ${navError.slice(0, 80)}` : status ?? "no-response"
    }`
  );
  await mainPage.waitForTimeout(CHALLENGE_WAIT_MS);

  // 1) origin: у страницы ошибки он не ozon.ru → fetch к composer-api бесполезен.
  //    HTTP-статус первого захода не проверяем: Ozon отдаёт 403 на заглушку
  //    Variti, а после JS-челленджа страница становится рабочей (реальный title,
  //    origin ozon.ru, API отвечает 200) — проверено 10.11.2026.
  const url = mainPage.url();
  let origin = "";
  try {
    origin = new URL(url).origin;
  } catch {
    origin = "";
  }
  if (origin !== HOME_ORIGIN) {
    throw new Error(
      `страница не на ozon.ru (url: ${url.slice(0, 80)}, nav: ${navError ?? status})`
    );
  }

  // 2) title: антибот-заглушка / страница ошибки
  const title = await mainPage.title();
  if (BAD_TITLE.test(title)) {
    throw new Error(`челлендж не пройден (title: ${title.slice(0, 60)})`);
  }

  // 3) smoke: fetch из страницы должен реально получить данные Ozon.
  //    status 0 — сетевой сбой (прокси/браузер), 403 — IP заблокирован Variti
  //    (в ответе incidentId). В обоих случаях скрапинг не заработает — падаем
  //    сразу, а не 50 SKU по ~5с.
  const smoke = await mainPage.evaluate(async (u) => {
    try {
      const r = await fetch(u, { headers: { accept: "application/json" } });
      return { status: r.status };
    } catch (e) {
      return { status: 0, error: String(e?.message ?? e) };
    }
  }, API + encodeURIComponent("/"));
  if (!smoke.status || smoke.status === 403) {
    throw new Error(
      `composer-api недоступен (HTTP ${smoke.status || "0"}${smoke.error ? `: ${smoke.error}` : ""}) — прокси или IP заблокированы`
    );
  }

  challenged = true;
  log(`challenge passed: ${title.slice(0, 40)} (composer-api HTTP ${smoke.status})`);
}

async function ensureContext() {
  if (!isBrowserAvailable()) {
    throw new Error("patchright/Chromium недоступен (Vercel или production build)");
  }

  if (challengeBroken) {
    throw new Error("Variti challenge не пройден ранее — пропуск фазы");
  }

  if (context && challenged) return context;
  if (initPromise) {
    await initPromise;
    return context;
  }

  initPromise = (async () => {
    let lastError = null;
    for (let attempt = 1; attempt <= MAX_CHALLENGE_ATTEMPTS; attempt++) {
      try {
        await passChallenge();
        return;
      } catch (err) {
        lastError = err;
        log(`challenge attempt ${attempt}/${MAX_CHALLENGE_ATTEMPTS}: ${err.message}`);
        // Полный сброс (браузер + контекст): следующая попытка стартует с нуля.
        await shutdown();
      }
    }
    // Фатально: дальнейшие SKU стоили бы ~13s перезапусков каждый.
    challengeBroken = true;
    throw new Error(
      `Variti challenge не пройден: ${lastError?.message ?? "неизвестная ошибка"}`
    );
  })();

  try {
    await initPromise;
  } finally {
    initPromise = null;
  }

  return context;
}

const DEAD =
  /Target page, context or browser has been closed|Session closed|Connection closed|browser has been closed/i;

/**
 * Выполняет запрос к composer-api Ozon через headless-страницу.
 *
 * @param {string} path — путь страницы Ozon, напр. "/product/123/" или "/search/?text=..."
 * @param {object} [opts]
 * @param {number} [opts.retries=1] — кол-во повторов при 403/307 или падении браузера
 * @returns {Promise<object>} — распарсенный JSON composer-api
 */
export async function fetchJson(path, { retries = 1 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      await ensureContext();

      const body = await mainPage.evaluate(
        async (url) => {
          const r = await fetch(url, {
            headers: { accept: "application/json" },
          });
          return { status: r.status, text: await r.text() };
        },
        API + encodeURIComponent(path)
      );

      if (body.status !== 200) {
        if ((body.status === 403 || body.status === 307) && attempt < retries) {
          log(`HTTP ${body.status} (attempt ${attempt + 1}) — перезапуск браузера`);
          await shutdown();
          continue;
        }
        throw new Error(`Ozon вернул HTTP ${body.status} для ${path}`);
      }

      return JSON.parse(body.text);
    } catch (err) {
      if (DEAD.test(String(err?.message)) && attempt < retries) {
        log(`browser disconnected (attempt ${attempt + 1}) — перезапуск`);
        await shutdown();
        continue;
      }
      throw err;
    }
  }
}

/**
 * Проверяет, доступен ли браузер в текущем окружении.
 * Полезно для вызывающего кода — чтобы принять решение до попытки.
 */
export function isEnabled() {
  return isBrowserAvailable();
}

/**
 * Принудительно закрывает браузер и сбрасывает состояние.
 * Всегда вызывай в конце, чтобы освободить RAM.
 */
export async function shutdown() {
  challenged = false;
  mainPage = null;
  try {
    await context?.close();
  } catch {
    /* ignore */
  }
  try {
    await browser?.close();
  } catch {
    /* ignore */
  }
  context = null;
  browser = null;
  log("browser closed");
}
