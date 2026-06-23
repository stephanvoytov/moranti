/**
 * infer-category.mjs — Определяет категорию товара по характеристикам WB
 *
 * Использует:
 * 1. Название товара (ключевые слова)
 * 2. Характеристики (Особенности сумки, Назначение ремня)
 * 3. Размеры (высота/ширина)
 * 4. root из search API
 *
 * Категории: crossbody | na-plecho | tote | backpack | baguette | saddle
 */

import { readFileSync } from "fs";

export function inferCategory(product) {
  const name = (product.name || product.imtName || "").toLowerCase();
  const rawChars = product.characteristics || [];
  const root = product.root;

  // Характеристики могут быть плоскими [{ name, value }]
  // или grouped_options [{ group_name, options: [{ name, value }] }]
  const chars = [];
  for (const c of rawChars) {
    if (c.options && Array.isArray(c.options)) {
      // grouped_options — разворачиваем
      for (const opt of c.options) {
        chars.push(opt);
      }
    } else if (c.name) {
      // плоский
      chars.push(c);
    }
  }

  function getChar(namePattern) {
    for (const c of chars) {
      if (c.name && c.name.toLowerCase().includes(namePattern)) return (c.value || "").toLowerCase();
    }
    return "";
  }

  const features  = getChar("особенност");  // "Особенности сумки"
  const strap     = getChar("назначение");   // "Назначение ремня сумки"
  const height    = parseFloat(getChar("высота предмета"));
  const width     = parseFloat(getChar("ширина предмета"));
  const clasp     = getChar("застежк");      // "Вид застежки"

  // ------------------------------------------------------------------
  // 1. Явные ключевые слова в названии (самый надёжный)
  // ------------------------------------------------------------------
  if (/рюкзак|backpack/i.test(name)) return "backpack";
  if (/багет|baguette/i.test(name))  return "baguette";
  if (/седл|saddle|такса/i.test(name)) return "saddle";
  if (/тоут|шоп(?:ер|пер|пп)|tote/i.test(name)) return "tote";
  if (/через плечо/i.test(name))     return "na-plecho";
  if (/кросс[б-]?оди|crossbody|cross-body/i.test(name)) return "crossbody";

  // ------------------------------------------------------------------
  // 2. Ключевые слова в "Особенности сумки"
  // ------------------------------------------------------------------
  if (features) {
    if (/рюкзак|backpack/i.test(features))        return "backpack";
    if (/багет|baguette/i.test(features))          return "baguette";
    if (/седл|saddle|такса/i.test(features))       return "saddle";
    if (/шоп(?:ер|пер)|tote/i.test(features))      return "tote";
    if (/кроссбоди|crossbody|клатч/i.test(features)) return "crossbody";
  }

  // ------------------------------------------------------------------
  // 3. Fallback на основе root (перед size — root точнее габаритов)
  // ------------------------------------------------------------------
  const rootMap = {
     107552947: "tote",        // большие сумки и рюкзаки (уточняем ниже)
    151647669: "na-plecho",   // через плечо
    203403742: "crossbody",   // средние через плечо
    203406688: "crossbody",   // маленькие клатчи
    229090903: "baguette",    // багет
    229103887: "crossbody",   // каркасная маленькая
    309204328: "crossbody",   // средние объёмные
    382509233: "baguette",    // маленькие багет
    440884678: "crossbody",   // маленькие замшевые
    554753518: "crossbody",   // такса (сёдла отловлены выше в шаге 1-2)
    608120169: "crossbody",   // вечерние кроссбоди
    608138357: "crossbody",   // мягкие клатчи
    608159463: "tote",        // большие дорожные
    608167729: "tote",        // шопперы
    1578724105: "crossbody",  // средние через плечо
    1579462421: "na-plecho",  // через плечо маленькие
  };

  if (root && rootMap[root]) {
    // Уточнение: root 107552947 содержит и рюкзаки, и большие сумки.
    // Рюкзаки отличаются наличием "на спину" в назначении ремня.
    if (root === 107552947 && strap && /на спину/i.test(strap)) return "backpack";
    return rootMap[root];
  }

  // ------------------------------------------------------------------
  // 4. Размеры — габаритные признаки
  // ------------------------------------------------------------------
  if (height && width) {
    // Большие сумки (шопперы/тоуты/дорожные)
    if (height >= 25 || width >= 38) return "tote";
    // Очень маленькие
    if (height <= 15) return "crossbody";
    // Средние с застёжкой клапан/магнит → типичные кроссбоди
    if (clasp && /клапан|магнит/i.test(clasp) && height <= 22) return "crossbody";
  }

  // ------------------------------------------------------------------
  // 5. "Назначение ремня сумки" + размеры для na-plecho vs crossbody
  // ------------------------------------------------------------------
  if (strap) {
    const hasCrossbody = /кроссбоди|crossbody/i.test(strap);
    const hasThroughPlecho = /через плечо/i.test(strap);
    const hasOnPlecho = /на плечо/i.test(strap);
    const hasOnHand = /на руку|в руку|на руке/i.test(strap);

    // Только "через плечо" без вариантов → crossbody
    if (hasThroughPlecho && !hasOnHand && !hasOnPlecho && !hasCrossbody) return "crossbody";
    // "через плечо" + другие варианты
    if (hasThroughPlecho && (hasOnPlecho || hasOnHand)) {
      // Маленькие — crossbody, большие — na-plecho
      if (height && height < 20) return "crossbody";
      return "na-plecho";
    }
    // "кроссбоди" как основной вариант
    if (hasCrossbody && !hasOnPlecho) return "crossbody";
    // "на плечо" как основной вариант → na-plecho
    if (hasOnPlecho && !hasCrossbody && !hasThroughPlecho && !hasOnHand) return "na-plecho";
  }

  // ------------------------------------------------------------------
  // 6. "Особенности сумки" — широкие признаки
  // ------------------------------------------------------------------
  if (features) {
    if (/вместительная|трансформер|дорожная|объёмная|объемная|большая/i.test(features) && height && height >= 20) return "tote";
  }

  // ------------------------------------------------------------------
  // 7. Последний fallback
  // ------------------------------------------------------------------
  return "crossbody";
}

// ====================================================================
// CLI
// ====================================================================
function main() {
  const data = JSON.parse(readFileSync("data/wb-scrape-result.json", "utf-8"));

  const counts = {};
  const details = [];

  for (const p of data.products) {
    const cat = inferCategory(p);
    counts[cat] = (counts[cat] || 0) + 1;
    const name = (p.name || "").substring(0, 45);
    const chars = p.characteristics || [];
    const features = chars.find(c => c.name && c.name.includes("Особенности сумки"))?.value || "";
    const strapVal = chars.find(c => c.name && c.name.includes("Назначение ремня"))?.value || "";
    const h = chars.find(c => c.name && c.name.includes("Высота предмета"))?.value || "";
    const w = chars.find(c => c.name && c.name.includes("Ширина предмета"))?.value || "";
    details.push({ article: p.article, cat, name, features, strap: strapVal, height: h, width: w });
  }

  console.log("=== Распределение категорий ===");
  for (const [cat, count] of Object.entries(counts).sort()) {
    console.log(`  ${cat}: ${count}`);
  }

  console.log("\n=== По article ===");
  for (const d of details) {
    console.log(
      `${String(d.article).padEnd(12)} ${d.cat.padEnd(12)} "${d.name}" ` +
      `h=${d.height.padEnd(6)} w=${d.width.padEnd(6)} [${d.features.substring(0, 35)}]`
    );
  }
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"));
if (isMain) main();
