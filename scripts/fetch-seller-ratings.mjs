/**
 * fetch-seller-ratings.mjs — собирает рейтинги ПРОДАВЦА Moranti
 * с Wildberries и Ozon и пишет взвешенное среднее в settings.storeRating.
 *
 * Источники:
 *  - WB:     https://www.wildberries.ru/seller/312222 (patchright, текст страницы)
 *  - Ozon:   composer-api /seller/4205030/ → widget sellerTransparency
 *
 * Запуск: ENV_FILE=... node scripts/fetch-seller-ratings.mjs
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({ path: process.env.ENV_FILE || ".env.local" });

const WB_SELLER_URL = "https://www.wildberries.ru/seller/312222";
const OZON_SELLER_PATH = "/seller/4205030/";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL || "" }),
});

/** "1 783 оценки" / "4,7" → числа */
function toNumber(text) {
  const digits = String(text ?? "").replace(/[\s\u00a0]/g, "").replace(",", ".");
  const n = parseFloat(digits);
  return Number.isFinite(n) ? n : null;
}

/* ─── WB: страница продавца через patchright ─── */

async function fetchWbSeller() {
  const { chromium } = await import("patchright");
  const browser = await chromium.launch({
    headless: process.env.OZON_HEADLESS !== "0",
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--disable-gpu",
      "--mute-audio",
      "--no-first-run",
      "--no-default-browser-check",
    ],
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      locale: "ru-RU",
    });
    const page = await context.newPage();
    await page.goto(WB_SELLER_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(5000); // дождаться гидрации шапки продавца
    // Блок продавца: «Моранти\n4,7\n1 783 оценки\n…»
    const text = await page.evaluate(() => document.body.innerText);
    const m = text.match(/([\d.,]+)\s*\n\s*([\d\u00a0 ]+)\s*(?:оцен|отзыв)/);
    if (!m) {
      console.error("[WB] не нашли рейтинг на странице продавца");
      console.error("[WB] первые 600 символов:", JSON.stringify(text.slice(0, 600)));
      return null;
    }
    const ratingValue = toNumber(m[1]);
    const reviewCount = toNumber(m[2]);
    console.log(`[WB] рейтинг ${ratingValue}, оценок ${reviewCount}`);
    return ratingValue && reviewCount ? { ratingValue, reviewCount } : null;
  } finally {
    await browser.close();
  }
}

/* ─── Ozon: composer-api через существующий ozon-browser ─── */

async function fetchOzonSeller() {
  const { fetchJson, isEnabled, shutdown } = await import(
    "./sync-modules/ozon-browser.mjs"
  );
  if (!isEnabled()) return null;
  try {
    const page = await fetchJson(OZON_SELLER_PATH);
    const ws = page?.widgetStates || {};
    const stKey = Object.keys(ws).find((k) => k.startsWith("sellerTransparency"));
    if (!stKey) {
      console.error("[Ozon] нет widgetStates.sellerTransparency");
      return null;
    }
    const st = JSON.parse(ws[stKey]);
    let ratingValue = null;
    let reviewCount = null;
    for (const badge of st.badges ?? []) {
      if (badge.leftIcon === "ic_m_star_filled") {
        ratingValue = toNumber(badge.text);
      } else if (badge.leftIcon === "ic_m_speech_bubble_filled") {
        reviewCount = toNumber(badge.text);
      }
    }
    console.log(`[Ozon] рейтинг ${ratingValue}, отзывов ${reviewCount}`);
    return ratingValue && reviewCount ? { ratingValue, reviewCount } : null;
  } catch (err) {
    console.error(`[Ozon] ошибка: ${err.message}`);
    return null;
  } finally {
    await shutdown();
  }
}

/* ─── Main ─── */

// Оверрайды для ручного запуска: --wb=4.7 --wb-count=1783
const argv = process.argv.slice(2);
const argVal = (name) => {
  const p = argv.find((a) => a.startsWith(`--${name}=`));
  return p ? toNumber(p.split("=")[1]) : null;
};

const wbArg = argVal("wb");
const wbCountArg = argVal("wb-count");
const wb =
  wbArg && wbCountArg
    ? { ratingValue: wbArg, reviewCount: wbCountArg }
    : await fetchWbSeller();
const ozon = await fetchOzonSeller();

if (!wb && !ozon) {
  console.error("Нет данных ни с WB, ни с Ozon — settings.storeRating не изменён");
  await prisma.$disconnect();
  process.exit(1);
}

// Взвешенное среднее по числу оценок; округление вниз до 0.1
const parts = [wb, ozon].filter(Boolean);
const totalReviews = parts.reduce((s, x) => s + x.reviewCount, 0);
const weighted =
  parts.reduce((s, x) => s + x.ratingValue * x.reviewCount, 0) / totalReviews;
const ratingValue = Math.floor(weighted * 10) / 10;

console.log(
  `\nИтого магазин: ${ratingValue} из 5 по ${totalReviews} оценкам ` +
    `(WB ${wb ? `${wb.ratingValue}×${wb.reviewCount}` : "—"}, Ozon ${ozon ? `${ozon.ratingValue}×${ozon.reviewCount}` : "—"})`,
);

const row = await prisma.settings.findUnique({ where: { id: "singleton" } });
if (!row) {
  console.error('settings row "singleton" не найдена — сначала открой админку');
  await prisma.$disconnect();
  process.exit(1);
}
const data = { ...(row.data ?? {}) };
data.storeRating = {
  ratingValue,
  reviewCount: totalReviews,
  wb: wb ?? undefined,
  ozon: ozon ?? undefined,
  updatedAt: new Date().toISOString(),
};
await prisma.settings.update({ where: { id: "singleton" }, data: { data } });
console.log("settings.storeRating обновлён ✓");

await prisma.$disconnect();
