/**
 * merge.js — слияние данных из WB и Ozon в финальную запись товара.
 *
 * @module sync-modules/merge
 */

import {
  extractPhotoCount,
  extractImageUrls,
  cdnImageUrl,
  cdnImageUrls,
  resolveCategory,
  extractComposition,
  extractColorName,
  extractDescription,
  ozonExtractColor,
  ozonExtractComposition,
  ozonExtractCategory,
  ozonExtractDescription,
  ozonExtractCharacteristics,
} from "./transform.mjs";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { generateName } = require("../name-generator.js");

/**
 * Собирает финальные данные товара из WB и Ozon источников.
 *
 * Чистая функция: все входные данные — readonly object, возвращает новый объект.
 * Сравнивает с существующей записью БД (db) и возвращает только изменившиеся поля.
 *
 * Приоритет: WB (контент, фото) + min цена + weighted avg рейтинг.
 *
 * @param {object|null} wbCard — карточка из WB Content API
 * @param {object|null} wbPrices — { price, discountedPrice, stock } из search API
 * @param {object|null} wbRating — { rating, feedbacks } из WB
 * @param {object|null} ozonInfo — v3/product/info/list
 * @param {object|null} ozonAttrs — v4/product/info/attributes
 * @param {object|null} ozonRating — { rating } из Ozon rating API
 * @param {object|null} db — существующая запись из БД (DBProduct)
 * @returns {object} — только изменившиеся поля (MergedProductData)
 */
export function mergeProductSources(wbCard, wbPrices, wbRating, ozonInfo, ozonAttrs, ozonRating, db) {
  const data = {};

  // ─── Цены ───
  const wbPrice = wbPrices?.discountedPrice ?? db?.wbPrice ?? null;
  const wbOrigPrice = wbPrices?.price ?? db?.wbOriginalPrice ?? null;
  const ozonPriceVal = ozonInfo?.price != null ? Number(ozonInfo.price) : db?.ozonPrice ?? null;
  const ozonOrigPriceVal = ozonInfo?.old_price != null ? Number(ozonInfo.old_price) : db?.ozonOriginalPrice ?? null;

  if (wbPrice !== (db?.wbPrice ?? null)) data.wbPrice = wbPrice;
  if (wbOrigPrice !== (db?.wbOriginalPrice ?? null)) data.wbOriginalPrice = wbOrigPrice;
  if (ozonPriceVal !== (db?.ozonPrice ?? null)) data.ozonPrice = ozonPriceVal;
  if (ozonOrigPriceVal !== (db?.ozonOriginalPrice ?? null)) data.ozonOriginalPrice = ozonOrigPriceVal;

  // Display price = min across available
  const prices = [wbPrice, ozonPriceVal].filter((p) => p != null);
  const origPrices = [wbOrigPrice, ozonOrigPriceVal].filter((p) => p != null);
  if (prices.length > 0) data.price = Math.min(...prices);
  if (origPrices.length > 0) data.originalPrice = Math.min(...origPrices);

  // ─── Стоки (количество) — читаем, но НЕ меняем inStock ───
  if (wbPrices?.stock !== undefined) {
    if (wbPrices.stock !== (db?.wbStock ?? null)) data.wbStock = wbPrices.stock;
  }
  if (ozonInfo?.stocks?.stocks) {
    const qty = ozonInfo.stocks.stocks.reduce(
      (s, st) => s + Math.max(0, (st.present || 0) - (st.reserved || 0)), 0
    );
    if (qty !== (db?.ozonStock ?? null)) data.ozonStock = qty;
  }

  // ─── Фото ───
  if (wbCard) {
    const photoCount = extractPhotoCount(wbCard);
    const article = wbCard.nmID;
    data.photoCount = photoCount;

    // Приоритет: реальные URL из API (работают всегда)
    const realUrls = extractImageUrls(wbCard, "big");
    if (realUrls && realUrls.length > 0) {
      data.image = realUrls[0];
      data.images = realUrls;
    } else {
      // Fallback: генерируем из article + photoCount
      data.image = cdnImageUrl(article, 1);
      data.images = cdnImageUrls(article, photoCount);
    }
  } else if (ozonInfo?.images?.length && !db?.wbArticle && !db?.ozonImage) {
    data.photoCount = ozonInfo.images.length;
    data.image = ozonInfo.images[0];
    data.images = ozonInfo.images;
  }

  // ─── Ozon-фото (для админки, отдельно) ───
  if (ozonInfo?.images?.length) {
    const firstOzon = ozonInfo.images[0];
    if (firstOzon !== db?.ozonImage) data.ozonImage = firstOzon;
    const allOzon = ozonInfo.images;
    if (JSON.stringify(allOzon) !== JSON.stringify(db?.ozonImages || [])) data.ozonImages = allOzon;
  }

  // ─── Категория (приоритет WB) ───
  const wbCat = wbCard ? resolveCategory(wbCard) : null;
  const ozonCat = ozonInfo ? ozonExtractCategory(ozonInfo, ozonAttrs) : null;
  data.category = wbCat || ozonCat || db?.category || "crossbody";

  // ─── Состав и цвет (любой не null) ───
  const wbComp = wbCard ? extractComposition(wbCard) : null;
  const ozonComp = ozonInfo ? ozonExtractComposition(ozonAttrs) : null;
  data.composition = wbComp || ozonComp || db?.composition || null;

  const wbColor = wbCard ? extractColorName(wbCard) : null;
  const ozonColor = ozonInfo ? ozonExtractColor(ozonInfo, ozonAttrs) : null;
  data.colorName = wbColor || ozonColor || db?.colorName || null;

  // ─── Рейтинг (weighted avg) ───
  const wbRatingVal = wbRating?.rating ?? db?.rating ?? null;
  const wbFeedbacks = wbRating?.feedbacks ?? db?.reviewsCount ?? 0;
  const ozonRatingVal = ozonRating?.rating ?? null;
  const ozonReviewsCount = ozonInfo?.reviews_count != null ? Number(ozonInfo.reviews_count) : 0;

  if (wbRatingVal != null || ozonRatingVal != null) {
    let combRat, combRC;

    if (wbRatingVal != null && ozonRatingVal != null && wbFeedbacks > 0 && ozonReviewsCount > 0) {
      const total = wbFeedbacks + ozonReviewsCount;
      combRat = (wbRatingVal * wbFeedbacks + ozonRatingVal * ozonReviewsCount) / total;
      combRC = total;
    } else if (wbRatingVal != null) {
      combRat = wbRatingVal;
      combRC = wbFeedbacks;
    } else if (ozonRatingVal != null) {
      combRat = ozonRatingVal;
      combRC = ozonReviewsCount;
    }

    if (combRat != null) {
      combRat = Math.round(combRat * 10) / 10;
      if (combRat !== db?.rating) data.rating = combRat;
      if (combRC !== db?.reviewsCount) data.reviewsCount = combRC;
    }
  }

  // ─── Название ───
  if (wbCard && (db?.nameAutoGenerated !== false)) {
    const newName = generateName({
      category: data.category || db?.category,
      composition: data.composition || db?.composition || null,
      wbName: wbCard.title || wbCard.imt_name || null,
    });
    if (newName !== (db?.name || "")) {
      data.name = newName;
      data.nameAutoGenerated = true;
    }
  }

  // ─── Описание ───
  if (wbCard && (db?.descAutoGenerated !== false)) {
    const desc = extractDescription(wbCard) || ozonExtractDescription(ozonAttrs) || "";
    if (desc && desc !== (db?.description || "")) {
      data.description = desc;
      data.descAutoGenerated = true;
    }
  }

  // ─── Характеристики ───
  const wbChars = wbCard?.characteristics || [];
  const ozonChars = ozonExtractCharacteristics(ozonAttrs);
  if (wbChars.length > 0 || ozonChars.length > 0) {
    const merged = [];
    if (wbChars.length > 0) {
      merged.push({
        group_name: "Wildberries",
        options: wbChars.map((c) => ({
          name: c.name || String(c.id || ""),
          value: Array.isArray(c.value) ? c.value.join(", ") : String(c.value || ""),
        })),
      });
    }
    if (ozonChars.length > 0) {
      merged.push({ group_name: "Ozon", options: ozonChars });
    }
    data.characteristics = merged;
  }

  return data;
}
