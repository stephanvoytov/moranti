/**
 * rebuild-redirects.mjs — пересборка data/slug-redirects.json без циклов и битых пар.
 *
 * Проблема, которую решает: старые SKU-пары (bag-pack-blue → …) пересекались
 * с парами из sitemap (sumka-…-belyj → sumka-…-belyj-3), создавая редирект-циклы
 * (belyj-2 → belyj → belyj-3 → belyj-2). Живые товары становились недоступны.
 *
 * Алгоритм:
 * 1. Из БД берём все активные товары (slug, name) — их слаги = «живые» страницы.
 * 2. Из старого sitemap (аргумент --sitemap) берём слаги, которые были в индексе.
 * 3. Для каждого старого слага:
 *    - если он совпадает с живым слагом → пропускаем (страница существует);
 *    - иначе сопоставляем с товаром по префиксу oldSlug (слаг имени без цвета);
 *      если кандидат ровно один → пара «старый → текущий слаг».
 * 4. SKU-пары (old без "sumka-") сохраняем только если old не живой и new живой.
 * 5. Склеиваем цепочки (a→b, b→c ⇒ a→c) и выкидываем циклы.
 *
 * Использование:
 *   node scripts/rebuild-redirects.mjs --sitemap <path-to-old-sitemap.xml>
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

const sitemapArg = process.argv.find((a) => a.startsWith("--sitemap="));
const sitemapPath = sitemapArg ? sitemapArg.split("=")[1] : null;
if (!sitemapPath) {
  console.error("Укажите --sitemap=<путь к старому sitemap.xml>");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL || "",
    connectionTimeoutMillis: 20_000,
    query_timeout: 60_000,
  }),
});

/** Слаг имени без цвета: "Сумка-тоут из замши, шоколадный" → "sumka-tout-iz-zamshi-shokoladnyj" */
function oldSlugOf(name) {
  const withoutColor = name.replace(/,\s*[^,]+$/, "").trim();
  return buildUrlSlug(withoutColor, "");
}

/** Полный старый слаг: base + полный список цветов (как было до добавления цвета в имя) */
function oldSlugFullOf(name, colorName) {
  const withoutColor = name.replace(/,\s*[^,]+$/, "").trim();
  const full = colorName ? `${withoutColor} ${colorName}` : withoutColor;
  return buildUrlSlug(full, "");
}

async function main() {
  const products = await prisma.product.findMany({
    where: { archivedAt: null },
    select: { slug: true, name: true, colorName: true },
    orderBy: { name: "asc" },
  });
  const activeSlugs = new Set(products.map((p) => p.slug));
  console.log(`Активных товаров в БД: ${products.length}`);

  // ─── 1. Старые слаги из sitemap ───
  const sitemapXml = fs.readFileSync(sitemapPath, "utf8");
  const oldSlugs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].replace(/^https:\/\/morantibags\.ru/, ""))
    .filter((u) => /^\/catalog\/[a-z0-9-]+$/.test(u))
    .map((u) => u.replace("/catalog/", ""));
  console.log(`Старых слагов из sitemap: ${oldSlugs.length}`);

  // ─── 2. Сопоставление старых слагов с товарами ───
  // Старый слаг = buildUrlSlug(имя без цвета + " " + colorName) [+ суффикс -N для дублей].
  // Сначала точный матч по полному слагу, затем по суффиксу, затем по порядку.
  const pairs = new Map(); // old → new
  let skippedLive = 0, unmatched = 0;

  // Группируем товары по oldSlugFull
  const byFull = new Map();
  for (const p of products) {
    const key = oldSlugFullOf(p.name, p.colorName);
    if (!byFull.has(key)) byFull.set(key, []);
    byFull.get(key).push(p);
  }

  for (const oldSlug of oldSlugs) {
    if (activeSlugs.has(oldSlug)) { skippedLive++; continue; }

    // Ищем группу: сначала точное совпадение full, затем самый длинный
    // full-префикс (oldSlug == full + "-..."), чтобы "…korichnevyj" не
    // перехватывал "…korichnevyj-gorkij-shokolad".
    let group = null;
    if (byFull.has(oldSlug)) {
      group = byFull.get(oldSlug);
    } else {
      let best = null;
      for (const [full, list] of byFull) {
        if (oldSlug.startsWith(`${full}-`) && (!best || full.length > best[0].length)) {
          best = [full, list];
        }
      }
      if (best) group = best[1];
    }
    if (!group) { unmatched++; continue; }

    if (group.length === 1) {
      const target = group[0].slug;
      if (target !== oldSlug) pairs.set(oldSlug, target);
      continue;
    }

    // Дубли: сопоставляем по суффиксу текущего слага
    const oldSuffix = oldSlug.match(/-(\d+)$/)?.[1] ?? null;
    const bySuffix = group.find((p) => {
      const s = p.slug.match(/-(\d+)$/)?.[1] ?? null;
      return s === oldSuffix;
    });
    if (bySuffix && bySuffix.slug !== oldSlug) {
      pairs.set(oldSlug, bySuffix.slug);
      continue;
    }
    // Суффикс не совпал — берём товар без суффикса (если старый слаг без суффикса)
    const noSuffix = group.find((p) => !/-(\d+)$/.test(p.slug));
    if (oldSuffix === null && noSuffix && noSuffix.slug !== oldSlug) {
      pairs.set(oldSlug, noSuffix.slug);
      continue;
    }
    // Последний шанс — по порядку: индекс среди старых слагов группы
    // (с префиксом full группы) == индекс товара в группе (по id).
    const groupFull = [...byFull.entries()].find(([f, l]) => l === group)?.[0];
    const groupOld = oldSlugs.filter(
      (s) => s === groupFull || s.startsWith(`${groupFull}-`)
    );
    const idx = groupOld.indexOf(oldSlug);
    if (idx >= 0 && idx < group.length) {
      const target = group[idx].slug;
      if (target !== oldSlug) pairs.set(oldSlug, target);
      continue;
    }
    unmatched++;
  }
  console.log(`Сопоставлено: ${pairs.size}, живой слаг (пропуск): ${skippedLive}, не найдено: ${unmatched}`);

  // ─── 3. SKU-пары из текущей карты (old без "sumka-") ───
  let skuKept = 0, skuDropped = 0;
  if (fs.existsSync(REDIRECTS_FILE)) {
    const current = JSON.parse(fs.readFileSync(REDIRECTS_FILE, "utf8").replace(/^\uFEFF/, ""));
    for (const [old, next] of Object.entries(current)) {
      if (old.startsWith("sumka-")) continue; // sitemap-пары пересобираем заново
      if (!activeSlugs.has(old) && activeSlugs.has(next)) {
        pairs.set(old, next);
        skuKept++;
      } else {
        skuDropped++;
      }
    }
  }
  console.log(`SKU-пар: сохранено ${skuKept}, отброшено ${skuDropped}`);

  // ─── 4. Склейка цепочек и удаление циклов ───
  // a→b, b→c ⇒ a→c (промежуточные пары остаются для прямых запросов)
  let merged = 0;
  for (const [old, next] of [...pairs]) {
    let target = next;
    const seen = new Set([old]);
    while (pairs.has(target) && !seen.has(target)) {
      seen.add(target);
      target = pairs.get(target);
      merged++;
    }
    if (seen.has(target)) {
      // цикл: удаляем все пары, участвующие в нём
      for (const s of seen) pairs.delete(s);
      console.log(`  цикл удалён: ${[...seen].join(" → ")}`);
    } else if (target !== next) {
      pairs.set(old, target);
    }
  }
  console.log(`Склеено цепочек: ${merged}`);

  // ─── 5. Финальные проверки ───
  let bad = 0;
  for (const [old, next] of pairs) {
    if (old === next) { pairs.delete(old); bad++; continue; }
    if (activeSlugs.has(old)) { pairs.delete(old); bad++; console.log(`  удалена (old живой): ${old}`); }
    if (!activeSlugs.has(next)) { pairs.delete(old); bad++; console.log(`  удалена (new не существует): ${old} → ${next}`); }
  }
  console.log(`Удалено битых: ${bad}`);

  // ─── 6. Запись ───
  const sorted = Object.fromEntries([...pairs.entries()].sort((a, b) => a[0].localeCompare(b[0])));
  fs.writeFileSync(REDIRECTS_FILE, JSON.stringify(sorted, null, 2), "utf8");
  console.log(`\nЗаписано: ${REDIRECTS_FILE} (всего ${Object.keys(sorted).length} пар)`);

  // ─── 7. Проверка проблемных слагов ───
  const problem = ["sumka-kross-bodi-iz-naturalnoj-kozhi-belyj-2", "sumka-kross-bodi-iz-naturalnoj-kozhi-belyj-3",
    "sumka-kross-bodi-iz-naturalnoj-kozhi-chernyj-2", "sumka-kross-bodi-iz-naturalnoj-kozhi-chernyj-3",
    "sumka-kross-bodi-iz-naturalnoj-kozhi-chernyj-4", "sumka-kross-bodi-iz-naturalnoj-kozhi-chernyj-5",
    "sumka-kross-bodi-iz-naturalnoj-kozhi-chernyj-6", "sumka-kross-bodi-iz-naturalnoj-kozhi-zelenyj",
    "sumka-kross-bodi-iz-naturalnoj-kozhi-zelenyj-2", "sumka-kross-bodi-iz-naturalnoj-kozhi-belyj"];
  const still = problem.filter((s) => pairs.has(s));
  console.log(`Проблемных слагов в карте: ${still.length} ${still.length ? "(" + still.join(", ") + ")" : "— чисто"}`);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });