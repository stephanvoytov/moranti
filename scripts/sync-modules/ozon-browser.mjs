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
const API = "https://www.ozon.ru/api/composer-api.bx/page/json/v2?url=";
const CHALLENGE_WAIT_MS = 12000; // время на проход JS-челленджа Variti
const NAV_TIMEOUT_MS = 90000;

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
    headless: true,
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
    userAgent: USER_AGENT,
    locale: "ru-RU",
    ...(proxyCfg ? { proxy: proxyCfg } : {}),
  });

  challenged = false;
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
    if (!browser || !browser.isConnected()) await launch();

    // Проходим Variti один раз: загружаем главную, ждём выполнения JS-челленджа.
    // Страница остаётся открытой — все fetch() идут с неё, наследуя сессию.
    mainPage = await context.newPage();
    log("passing Variti anti-bot challenge…");
    let navStatus = "—";
    try {
      const resp = await mainPage.goto(HOME, {
        waitUntil: "domcontentloaded",
        timeout: NAV_TIMEOUT_MS,
      });
      navStatus = resp?.status() ?? "no-response";
    } catch (err) {
      navStatus = `ERR: ${String(err?.message).slice(0, 80)}`;
    }
    log(`homepage status: ${navStatus}`);
    await mainPage.waitForTimeout(CHALLENGE_WAIT_MS);

    const title = await mainPage.title();
    // Заглушки вместо реальной страницы = челлендж не пройден. Реальный title
    // главной Ozon: «OZON маркетплейс — миллионы товаров...». Всё остальное —
    // антибот-заглушка или страница ошибки браузера: распознаём и фатально падаем,
    // чтобы не гонять ~13s перезапусков на каждый SKU впустую.
    if (/antibot|ограничен|доступ|соединени|no internet|offline/i.test(title)) {
      challengeBroken = true; // фатально: дальше ретраить бессмысленно (по ~13s на попытку)
      throw new Error(`Variti challenge не пройден (title: ${title})`);
    }

    challenged = true;
    log("challenge passed:", title.slice(0, 40));
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
