/**
 * model-naming.mjs — общие функции для именования моделей из SKU.
 *
 * Используется в:
 *   - sync-modules/models.mjs (при синхронизации)
 *   - rename-models.mjs (однократная миграция)
 */

export const CATEGORY_RU = {
  crossbody: "Кросс-боди",
  "na-plecho": "На плечо",
  tote: "Тоут",
  backpack: "Рюкзак",
  baguette: "Багет",
  saddle: "Седло",
};

const COLOR_WORDS = [
  "white", "black", "yellow", "blue", "green", "grey", "gray", "red",
  "navy", "pink", "brown", "beige", "cream", "gold", "silver", "orange",
  "choko", "chocolate", "choco", "shoko",
  "taup", "taupe",
  "molochnyj", "moloch", "molochnyi",
  "karamel", "caramel",
  "pesok", "cappuc", "cappuccino", "capuch", "limon",
  "bor", "new",
];

const COLOR_CODES = ["BL", "GR", "GN", "RD", "YW", "PK"];

/** Часть SKU до первого / или \ */
export function skuBase(sku) {
  return sku.split(/[/\\]/)[0];
}

/**
 * Находит лучший общий префикс среди SKU (по base-части).
 * Возвращает оригинальный кейс.
 */
export function findBestPrefix(skus) {
  if (!skus.length) return "";
  const bases = skus.filter(Boolean).map(s => skuBase(s));
  const n = bases.length;
  if (n === 0) return "";
  if (n === 1) return bases[0];

  const freq = new Map();
  for (const b of bases) {
    const lower = b.toLowerCase();
    for (let len = lower.length; len >= 3; len--) {
      const p = lower.slice(0, len);
      freq.set(p, (freq.get(p) || 0) + 1);
    }
  }

  const byCount = new Map();
  for (const [prefix, count] of freq) {
    if (count < 2) continue;
    const existing = byCount.get(count);
    if (!existing || prefix.length > existing.length) {
      byCount.set(count, prefix);
    }
  }

  const sorted = [...byCount.entries()].sort((a, b) => {
    if (b[0] !== a[0]) return b[0] - a[0];
    return b[1].length - a[1].length;
  });

  if (sorted.length > 0) {
    const bestLower = sorted[0][1];
    for (const b of bases) {
      if (b.toLowerCase().startsWith(bestLower)) {
        return b.slice(0, bestLower.length);
      }
    }
  }

  return "";
}

function stripSuffix(s) {
  let r = s;
  for (let i = 0; i < 5; i++) {
    let changed = false;

    for (const color of COLOR_WORDS) {
      const re = new RegExp(`[-_/]?${color}$`, "i");
      if (re.test(r)) { r = r.replace(re, ""); changed = true; break; }
    }
    if (changed) continue;

    for (const code of COLOR_CODES) {
      let re = new RegExp(`[-_/]${code}$`);
      if (re.test(r)) { r = r.replace(re, ""); changed = true; break; }
      re = new RegExp(`${code}$`);
      if (re.test(r) && r.length > 4) { r = r.replace(re, ""); changed = true; break; }
    }
    if (changed) continue;

    const matRe = /[-_/](zamsh|leather|кожа|замш|prjag|big|small)$/i;
    if (matRe.test(r)) { r = r.replace(matRe, ""); changed = true; continue; }

    break;
  }
  return r;
}

function stripSize(s) {
  return s
    .replace(/[-_/]\d+[-_/]\d+$/, "")
    .replace(/[-_/]\d+$/, "")
    .replace(/\d+$/, "")
    .replace(/[-_/]$/, "");
}

/** Очищает сырой префикс в читаемое название */
export function cleanPrefix(raw) {
  if (!raw || raw.length < 3) return "";
  let s = raw;

  for (let i = 0; i < 3; i++) {
    const prev = s;
    s = stripSuffix(s);
    s = stripSize(s);
    if (s === prev) break;
  }

  s = s.replace(/([a-zа-яё])([A-ZА-ЯЁ])/g, "$1 $2");
  s = s.charAt(0).toUpperCase() + s.slice(1);
  s = s.replace(/[^a-zA-Zа-яА-ЯЁё0-9\s-]/g, "").replace(/\s+/g, " ").trim();

  return s;
}

/**
 * Собирает название модели из названий товаров (fallback).
 * Формат: "Тоут из натуральной кожи" / "Кросс-боди из замши"
 */
export function deriveFromProducts(productNames, category) {
  const mats = new Set();
  for (const n of productNames) {
    if (!n) continue;
    const l = n.toLowerCase();
    if (l.includes("замш")) mats.add("замши");
    if (l.includes("кож")) mats.add("натуральной кожи");
  }
  const cat = CATEGORY_RU[category] || category;
  if (mats.size === 0) return cat;
  if (mats.size === 1) return `${cat} из ${[...mats][0]}`;
  return `${cat} (${[...mats].join(", ")})`;
}

/**
 * Главная функция: получает имя модели из SKU товаров.
 *
 * @param {string[]} skus — SKU товаров в модели
 * @param {string[]} productNames — названия товаров (для fallback)
 * @param {string} category — категория (crossbody, tote...)
 * @returns {string}
 */
export function deriveModelName(skus, productNames, category) {
  const rawPrefix = findBestPrefix(skus);

  if (rawPrefix && rawPrefix.length >= 3) {
    const name = cleanPrefix(rawPrefix);
    if (name && name.length >= 2) {
      return name;
    }
  }

  return deriveFromProducts(productNames, category);
}
