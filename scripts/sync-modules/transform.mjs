/**
 * transform.js — чистые функции трансформации данных.
 *
 * Все функции не имеют побочных эффектов, не зависят от Prisma/сети.
 * Импортируется из sync-all.mjs и из тестов.
 *
 * @module sync-modules/transform
 */

import { CDN_HOSTS } from "../wb-utils.mjs";

/** Geo CDN — единственный хост с CORS-заголовками */
const GEO_CDN_HOST = "kgd-basket-cdn-01bl.geobasket.ru";
import { wbToCategory } from "../wb-categories.js";

/**
 * Выбирает CDN-хост для артикула WB (по vol, для равномерного распределения).
 * Если CDN_HOSTS пуст — fallback на стандартный basket-01.
 * @param {number} article
 * @returns {string}
 */
export function pickCdnHost(article) {
  const vol = Math.floor(article / 100000);
  if (!CDN_HOSTS || CDN_HOSTS.length === 0) return "https://basket-01.wbbasket.ru";
  return CDN_HOSTS[vol % CDN_HOSTS.length];
}

/**
 * Безопасно преобразует number|bigint|null|undefined в BigInt.
 * @param {number|bigint|null|undefined} v
 * @returns {bigint|null}
 */
export function toBigInt(v) {
  if (v == null) return null;
  return BigInt(v);
}

/**
 * @param {number} article — nmID товара WB
 * @returns {{ vol: number, part: number }}
 */
export function getVolPart(article) {
  return {
    vol: Math.floor(article / 100000),
    part: Math.floor(article / 1000),
  };
}

/**
 * Генерирует URL изображения на CDN Wildberries.
 * @param {number} article
 * @param {number} [index=1]
 * @param {string} [size="big"]
 * @returns {string}
 */
export function cdnImageUrl(article, index = 1, size = "big") {
  const { vol, part } = getVolPart(article);
  return `https://${GEO_CDN_HOST}/vol${vol}/part${part}/${article}/images/${size}/${index}.webp`;
}

/**
 * Генерирует массив URL всех фото товара на CDN.
 * @param {number} article
 * @param {number} photoCount
 * @param {number} [max=30]
 * @returns {string[]}
 */
export function cdnImageUrls(article, photoCount, max = 30) {
  const urls = [];
  for (let i = 1; i <= photoCount && i <= max; i++) {
    urls.push(cdnImageUrl(article, i));
  }
  return urls;
}

// ============================================================
// WB data extraction (из Content API card)
// ============================================================

/**
 * Извлекает значение характеристики из Content API карточки.
 *
 * Поддерживает два формата:
 *   - Новый: [{ options: [{name, value}, ...], group_name: "..." }]
 *   - Старый: [{ name, value }, ...] (card.json)
 *
 * @param {object} card
 * @param {string} charName
 * @returns {string|null}
 */
export function extractCharByName(card, charName) {
  const groups = card.characteristics || [];
  for (const group of groups) {
    // Новый формат Content API: group.options[]
    if (group.options && Array.isArray(group.options)) {
      for (const opt of group.options) {
        if (opt.name === charName || opt.name?.toLowerCase() === charName.toLowerCase()) {
          const vals = Array.isArray(opt.value) ? opt.value : [opt.value];
          return vals.filter(Boolean).join(", ") || null;
        }
      }
    }
    // Старый формат (card.json / fallback)
    if (group.name === charName || group.name?.toLowerCase() === charName.toLowerCase()) {
      const vals = Array.isArray(group.value) ? group.value : [group.value];
      return vals.filter(Boolean).join(", ") || null;
    }
  }
  return null;
}

/**
 * Извлекает название цвета из WB card.
 * @param {object} card
 * @returns {string|null}
 */
export function extractColorName(card) {
  const colors = card.colors || [];
  if (colors.length > 0) {
    return colors.map((c) => c.name).filter(Boolean).join(", ");
  }
  return extractCharByName(card, "Цвет") || extractCharByName(card, "Цвет товара") || null;
}

/**
 * Извлекает состав из WB card.
 * @param {object} card
 * @returns {string|null}
 */
export function extractComposition(card) {
  const comps = card.compositions || [];
  if (comps.length > 0) {
    return comps.map((c) => c.name).filter(Boolean).join("; ");
  }
  return extractCharByName(card, "Состав") || null;
}

/**
 * Извлекает описание из WB card.
 * @param {object} card
 * @returns {string}
 */
export function extractDescription(card) {
  if (card.description) return card.description;
  return extractCharByName(card, "Описание") || extractCharByName(card, "Полное описание") || "";
}

/**
 * Извлекает количество фото из WB card.
 * @param {object} card
 * @returns {number}
 */
export function extractPhotoCount(card) {
  const media = card.media || {};
  if (media.photo_count) return media.photo_count;
  const photos = card.photos || [];
  if (photos.length > 0) return photos.length;
  return 1;
}

/**
 * Извлекает реальные URL фото из WB card (media.photo[]).
 * WB Content API возвращает готовые URL — они 100% рабочие.
 *
 * @param {object} card — card.json из Content API
 * @param {string} [size="big"] — размер: big, c516x688, c246x328
 * @returns {string[]|null} — массив URL или null если нет фото
 */
/**
 * Заменяет хост WB CDN на Geo CDN (с CORS-заголовками).
 *
 * WB Content API возвращает URL вида:
 *   https://basket-15.wbbasket.ru/vol.../big/1.webp
 *
 * Заменяем на:
 *   https://kgd-basket-cdn-01bl.geobasket.ru/vol.../big/1.webp
 *
 * @param {string|null} url — исходный URL
 * @returns {string|null} — URL с Geo CDN или as-is если не распознан
 */
export function toGeoUrl(url) {
  if (!url) return null;
  return url.replace(/https:\/\/basket-\d+\.wbbasket\.ru/, `https://${GEO_CDN_HOST}`);
}

export function extractImageUrls(card, size = "big") {
  if (!card) return null;
  const media = card.media;
  if (!media) return null;

  // Новый формат: media.photo[] = [{ big: "url", c516x688: "url", ... }]
  if (Array.isArray(media.photo)) {
    const urls = media.photo
      .map((p) => (p && p[size]) ? p[size] : null)
      .filter(Boolean);
    if (urls.length > 0) return urls;
  }

  // Старый формат: photos[] = [{ url: "..." }]
  if (Array.isArray(card.photos)) {
    const urls = card.photos
      .map((p) => p?.url || null)
      .filter(Boolean);
    if (urls.length > 0) return urls;
  }

  return null;
}

// ============================================================
// WB category resolution
// ============================================================

/** Маппинг "Модель сумки" (характеристика WB) → категория Moranti */
export const MODEL_CATEGORY_MAP = {
  "кроссбоди": "crossbody",
  "кросс-боди": "crossbody",
  "кросс": "crossbody",
  "багет": "baguette",
  "седло": "saddle",
  "тоут": "tote",
  "шоппер": "tote",
  "шопер": "tote",
  "мешок": "tote",
  "через плечо": "na-plecho",
  "на плечо": "na-plecho",
  "трансформер": "backpack",
  "рюкзак": "backpack",
  "деловая": "crossbody",
  "такс": "baguette",
  "саквояж": "baguette",
  "модная": "crossbody",
};

/**
 * Извлекает модель сумки из характеристики "Модель сумки" WB Content API.
 * @param {object} card
 * @returns {string|null}
 */
export function resolveModelFromCard(card) {
  const raw = extractCharByName(card, "Модель сумки") || "";
  if (!raw) return null;
  const lower = raw.toLowerCase();
  for (const [keyword, cat] of Object.entries(MODEL_CATEGORY_MAP)) {
    if (lower.includes(keyword)) return cat;
  }
  return null;
}

/**
 * Нормализует категорию из WB Content API card.
 * Приоритет: 1) "Модель сумки" 2) subjectID/subjectName.
 *
 * @param {object} card
 * @returns {string}
 */
export function resolveCategory(card) {
  const fromModel = resolveModelFromCard(card);
  if (fromModel) return fromModel;

  const subjId = card.subjectID || card.subject_id || null;
  const subjName = card.subjectName || card.subject_name || null;
  return wbToCategory(subjId, subjName, subjId);
}

// ============================================================
// Ozon data extraction
// ============================================================

/**
 * Извлекает цвет из Ozon info/attributes.
 * @param {object} [info]
 * @param {object} [attrs]
 * @returns {string|null}
 */
export function ozonExtractColor(info, attrs) {
  if (attrs?.attributes) {
    for (const a of attrs.attributes) {
      if (a.attribute_name === "Цвет" || a.attribute_name === "Цвет товара") {
        const vals = Array.isArray(a.value) ? a.value : [a.value];
        return vals.filter(Boolean).join(", ");
      }
    }
  }
  if (info?.color_image) {
    if (Array.isArray(info.color_image)) {
      return info.color_image.filter(Boolean).join(", ") || null;
    }
    if (typeof info.color_image === "string") return info.color_image;
  }
  return null;
}

/**
 * Извлекает состав из Ozon атрибутов.
 * @param {object} [attrs]
 * @returns {string|null}
 */
export function ozonExtractComposition(attrs) {
  if (!attrs?.attributes) return null;
  for (const a of attrs.attributes) {
    if (a.attribute_name === "Состав" || a.attribute_name === "Материал") {
      const vals = Array.isArray(a.value) ? a.value : [a.value];
      return vals.filter(Boolean).join(", ");
    }
  }
  return null;
}

/**
 * Извлекает описание из Ozon атрибутов.
 * @param {object} [attrs]
 * @returns {string}
 */
export function ozonExtractDescription(attrs) {
  if (attrs?.description) return attrs.description;
  return "";
}

/**
 * Извлекает характеристики из Ozon атрибутов.
 * @param {object} [attrs]
 * @returns {Array<{ name: string, value: string }>}
 */
export function ozonExtractCharacteristics(attrs) {
  if (!attrs?.attributes) return [];
  return attrs.attributes.map((a) => ({
    name: a.attribute_name,
    value: Array.isArray(a.value) ? a.value.join(", ") : String(a.value || ""),
  }));
}

/**
 * Извлекает категорию Moranti из Ozon данных.
 * Сначала парсит название/категорию товара, затем атрибут 20259, затем 9048.
 *
 * @param {object} [info]
 * @param {object} [attrs]
 * @returns {string|null}
 */
export function ozonExtractCategory(info, attrs) {
  const text = [
    info?.category,
    info?.name,
    info?.offer_id,
  ].filter(Boolean).join(" ").toLowerCase();

  if (text) {
    if (text.includes("шоппер") || text.includes("шопер") || text.includes("shopp")) return "tote";
    if (text.includes("рюкзак") || text.includes("backpack") || text.includes("rucksack")) return "backpack";
    // "седл" ДО "через плечо" — Sedlo содержит оба слова, седло важнее
    if (text.includes("седл") || text.includes("седло") || text.includes("saddle") || text.includes("sedlo")) return "saddle";
    if (text.includes("багет") || text.includes("baguette")) return "baguette";
    if (text.includes("через плечо") || text.includes("na plecho") || text.includes("na-plecho")) return "na-plecho";
    if (text.includes("тоут") || text.includes("toute") || text.includes("tout ")) return "tote";
  }

  // Ozon attribute 20259 (назначение/тип сумки)
  if (attrs?.attributes) {
    const typeAttr = attrs.attributes.find(a => a.id === 20259);
    if (typeAttr?.values?.length) {
      const vals = typeAttr.values.map(v => String(v.value).toLowerCase());

      if (vals.some(v => v === "шоппер" || v === "шопер")) return "tote";
      if (vals.some(v => v.includes("рюкзак"))) return "backpack";
      if (vals.some(v => v.includes("седл"))) return "saddle";
      if (vals.some(v => v.includes("багет"))) return "baguette";
      if (vals.some(v => v.includes("на плечо") || v.includes("тоут"))) return "na-plecho";
      if (vals.some(v => v.includes("кросс-боди") || v.includes("кроссбоди"))) return "crossbody";
      if (vals.some(v => v.includes("клатч"))) return "crossbody";
    }

    // Атрибут 9048 (модель) — для товаров без 20259 (напр. Sedlo)
    const modelAttr = attrs.attributes.find(a => a.id === 9048);
    if (modelAttr?.values?.length) {
      const modelVals = modelAttr.values.map(v => String(v.value).toLowerCase());
      if (modelVals.some(v => v.includes("sedlo") || v.includes("седл") || v.includes("saddle"))) return "saddle";
    }
  }

  // Слабые сигналы из названия
  if (text) {
    if (text.includes("кросс") || text.includes("crossbody") || text.includes("клатч") || text.includes("clutch")) return "crossbody";
    if (text.includes("плеч") || text.includes("наплеч")) return "na-plecho";
  }

  return null;
}

// ============================================================
// Utilities
// ============================================================

/**
 * Генерирует slug из строки: BalensaTaup → balensa-taup.
 * @param {string} s
 * @returns {string|null}
 */
export function makeSlug(s) {
  if (!s) return null;
  return s
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[/]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
