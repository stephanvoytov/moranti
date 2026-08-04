/**
 * migrate-slugs.mjs — миграция URL-слагов товаров.
 *
 * Заменяет внутренние слаги из SKU/артикула (balensa-gr, sopp0145-30…)
 * на SEO-слаги из названия + цвета: "Сумка тоут из замши" + "серый, графит"
 * → sumka-tout-iz-zamshi-seryj-grafit.
 *
 * Побочный эффект: пишет data/slug-redirects.json (старый → новый) —
 * его подхватывает next.config.ts для 301-редиректов /catalog/:old → /catalog/:new.
 *
 * Использование:
 *   node scripts/migrate-slugs.mjs           # preview (ничего не пишет)
 *   node scripts/migrate-slugs.mjs --apply   # применить + записать redirects
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { buildUrlSlug } from "./sync-modules/transform.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REDIRECTS_FILE = path.join(__dirname, "..", "data", "slug-redirects.json");

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL || "",
    // Медленный канал до VPS-БД — таймауты щедрее дефолтных
    connectionTimeoutMillis: 20_000,
    query_timeout: 60_000,
  }),
});

/**
 * Гарантирует уникальность slug среди товаров БД (считаем всех, кроме
 * текущего; параллельно накапливаем уже занятые в этом прогоне).
 * @param {Array} products — все товары (id, slug)
 * @param {string} base
 * @param {string} excludeId
 * @param {Set<string>} usedInRun — занятые слаги в текущем прогоне
 * @returns {string}
 */
function uniqueSlug(products, base, excludeId, usedInRun) {
  let candidate = base;
  let n = 2;
  for (;;) {
    const conflict = products.some(
      (p) => p.slug === candidate && p.id !== excludeId
    );
    if (!conflict && !usedInRun.has(candidate)) return candidate;
    candidate = `${base}-${n}`;
    n++;
  }
}

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(apply ? "=== ПРИМЕНЕНИЕ ===" : "=== PREVIEW ===");
  console.log("");

  const products = await prisma.product.findMany({
    where: { archivedAt: null },
    select: { id: true, slug: true, name: true, colorName: true },
    orderBy: { name: "asc" },
  });

  console.log(`Товаров активных: ${products.length}\n`);

  // Сначала собираем ВСЕ новые слаги (с уникализацией), потом применяем.
  // Это даёт детерминированный результат preview == apply.
  const plans = [];
  const usedInRun = new Set();

  for (const p of products) {
    const base = buildUrlSlug(p.name || "", p.colorName || "");
    if (!base) continue;
    const next = uniqueSlug(products, base, p.id, usedInRun);
    usedInRun.add(next);
    if (next !== p.slug) {
      plans.push({ id: p.id, old: p.slug, next, name: p.name });
    }
  }

  // Сортировка по старому слагу для читаемого вывода
  plans.sort((a, b) => a.old.localeCompare(b.old));

  if (plans.length === 0) {
    console.log("Слаги уже в новом формате — ничего менять не нужно.");
    if (apply) {
      fs.writeFileSync(REDIRECTS_FILE, JSON.stringify({}, null, 2), "utf8");
      console.log(`\n${REDIRECTS_FILE} — очищен (пустая карта редиректов).`);
    }
    return;
  }

  console.log(`--- Товаров с изменением slug: ${plans.length} ---\n`);
  for (const { old: o, next, name } of plans) {
    console.log(`  ${o.padEnd(36)} → ${next.padEnd(44)}  ${(name || "").slice(0, 50)}`);
  }

  if (!apply) {
    console.log(`\nДля применения: node scripts/migrate-slugs.mjs --apply`);
    return;
  }

  // Применяем по одному: slug уникален в БД, конфликтов нет (уникализация выше)
  for (const { id, next } of plans) {
    await prisma.product.update({ where: { id }, data: { slug: next } });
  }

  // Карта редиректов для next.config.ts (301 старые → новые)
  const redirects = {};
  for (const { old: o, next } of plans) {
    redirects[o] = next;
  }
  fs.writeFileSync(REDIRECTS_FILE, JSON.stringify(redirects, null, 2), "utf8");

  console.log(`\nОбновлено: ${plans.length}`);
  console.log(`Редиректы записаны: ${REDIRECTS_FILE} (${Object.keys(redirects).length} шт.)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma["$disconnect"]());
