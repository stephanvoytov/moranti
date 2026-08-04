/**
 * merge.js — слияние данных из WB и Ozon в финальную запись товара.
 *
 * @module sync-modules/merge
 */

import {
  extractPhotoCount,
  extractImageUrls,
  extractVideo,
  toGeoUrl,
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

import { generateName } from "../name-generator.js";

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
 * @param {object|null} ozonRating — IGNORED (Ozon content rating, не звёздный рейтинг)
 * @param {object|null} db — существующая запись из БД (DBProduct)
 * @returns {object} — только изменившиеся поля (MergedProductData)
 */
export function mergeProductSources(wbCard, wbPrices, wbRating, ozonInfo, ozonAttrs, ozonRating, db) {
  const data = {};

  // ─── Цены ───
  // WB API: price = current (со скидкой), discountedPrice = оригинал
  const wbPrice = wbPrices?.price ?? db?.wbPrice ?? null;
  const wbOrigPrice = wbPrices?.discountedPrice ?? db?.wbOriginalPrice ?? null;
  // ВАЖНО: цены Ozon берутся ТОЛЬКО из БД (db.ozonPrice), куда их пишет фаза
  // ozon-prices (реальные покупательские цены из headless-браузера, patchright).
  // ozonInfo.price/old_price из официального API — это цены продавца, они НЕ
  // используются: сайт показывает покупательские цены Ozon (решение от 07.2026).
  const ozonPriceVal = db?.ozonPrice ?? null;
  const ozonOrigPriceVal = db?.ozonOriginalPrice ?? null;

  if (wbPrice !== (db?.wbPrice ?? null)) data.wbPrice = wbPrice;
  if (wbOrigPrice !== (db?.wbOriginalPrice ?? null)) data.wbOriginalPrice = wbOrigPrice;
  if (ozonPriceVal !== (db?.ozonPrice ?? null)) data.ozonPrice = ozonPriceVal;
  if (ozonOrigPriceVal !== (db?.ozonOriginalPrice ?? null)) data.ozonOriginalPrice = ozonOrigPriceVal;

  // Display price = min across available
  const prices = [wbPrice, ozonPriceVal].filter((p) => p != null);
  const origPrices = [wbOrigPrice, ozonOrigPriceVal].filter((p) => p != null);
  if (prices.length > 0) { const np = Math.min(...prices); if (np !== db?.price) data.price = np; }
  if (origPrices.length > 0) { const np = Math.min(...origPrices); if (np !== db?.originalPrice) data.originalPrice = np; }

  // ─── Стоки (количество) ───
  if (wbPrices?.stock !== undefined) {
    if (wbPrices.stock !== (db?.wbStock ?? null)) data.wbStock = wbPrices.stock;
  }
  if (ozonInfo?.stocks?.stocks) {
    const qty = ozonInfo.stocks.stocks.reduce(
      (s, st) => s + Math.max(0, (st.present || 0) - (st.reserved || 0)), 0
    );
    if (qty !== (db?.ozonStock ?? null)) data.ozonStock = qty;
  }

  // ─── inStock из стоков ───
  const finalWb = data.wbStock !== undefined ? data.wbStock : (db?.wbStock ?? null);
  const finalOz = data.ozonStock !== undefined ? data.ozonStock : (db?.ozonStock ?? null);
  if (finalWb !== null || finalOz !== null) {
    let newInStock;
    if (finalWb !== null && finalOz !== null) {
      // Оба источника: в наличии если хоть где-то есть сток
      newInStock = finalWb > 0 || finalOz > 0;
    } else if (finalWb !== null) {
      // Только WB
      newInStock = finalWb > 0;
    } else {
      // Только Ozon
      newInStock = finalOz > 0;
    }
    if (newInStock !== db?.inStock) data.inStock = newInStock;
  }

  // ─── Фото ───
  if (wbCard) {
    const photoCount = extractPhotoCount(wbCard);
    const article = wbCard.nmID;
    if (photoCount !== db?.photoCount) data.photoCount = photoCount;

    // Приоритет: реальные URL из API, с заменой хоста на Geo CDN (CORS)
    const realUrls = extractImageUrls(wbCard, "big");
    let newImage, newImages;
    if (realUrls && realUrls.length > 0) {
      newImage = toGeoUrl(realUrls[0]);
      newImages = realUrls.map(toGeoUrl).filter(Boolean);
    } else {
      // Fallback: генерируем из article + photoCount
      newImage = cdnImageUrl(article, 1);
      newImages = cdnImageUrls(article, photoCount);
    }
    if (newImage !== db?.image) data.image = newImage;
    if (JSON.stringify(newImages) !== JSON.stringify(db?.images || [])) data.images = newImages;
  } else if (ozonInfo?.images?.length && !db?.wbArticle && !db?.ozonImage) {
    if (ozonInfo.images.length !== db?.photoCount) data.photoCount = ozonInfo.images.length;
    if (ozonInfo.images[0] !== db?.image) data.image = ozonInfo.images[0];
    if (JSON.stringify(ozonInfo.images) !== JSON.stringify(db?.images || [])) data.images = ozonInfo.images;
  }

  // ─── Видео (HLS с WB Content API) ───
  // Обновляется только из WB-карточки; Ozon-фаза (wbCard = null) не трогает.
  // Если в карточке видео больше нет — обнуляем (товар убрал видео на WB).
  if (wbCard) {
    const video = extractVideo(wbCard);
    if (video !== (db?.video ?? null)) data.video = video;
  }

  // ─── Ozon-фото (для админки, отдельно) ───
  if (ozonInfo?.images?.length) {
    const firstOzon = ozonInfo.images[0];
    if (firstOzon !== db?.ozonImage) data.ozonImage = firstOzon;
    const allOzon = ozonInfo.images;
    if (JSON.stringify(allOzon) !== JSON.stringify(db?.ozonImages || [])) data.ozonImages = allOzon;
  }

  // ─── Категория (приоритет WB, не перезаписывается Ozon) ───
  const wbCat = wbCard ? resolveCategory(wbCard) : null;
  const ozonCat = ozonInfo ? ozonExtractCategory(ozonInfo, ozonAttrs) : null;
  const newCat = wbCat
    || (db?.wbArticle && !wbCard ? (db?.category || ozonCat) : ozonCat)
    || db?.category
    || "crossbody";
  if (newCat !== db?.category) data.category = newCat;

  // ─── Состав и цвет (любой не null) ───
  const wbComp = wbCard ? extractComposition(wbCard) : null;
  const ozonComp = ozonInfo ? ozonExtractComposition(ozonAttrs) : null;
  const newComp = wbComp || ozonComp || db?.composition || null;
  if (newComp !== db?.composition) data.composition = newComp;

  const wbColor = wbCard ? extractColorName(wbCard) : null;
  const ozonColor = ozonInfo ? ozonExtractColor(ozonInfo, ozonAttrs) : null;
  const newColor = wbColor || ozonColor || db?.colorName || null;
  if (newColor !== db?.colorName) data.colorName = newColor;

  // ─── Рейтинг ───
  // Приоритет: свежий WB feedbackRating (звёздный 1-5). Если WB рейтинга нет —
  // звёздный рейтинг с витрины Ozon (db.ozonRating, пишет фаза ozon-prices из
  // webReviewProductScore.totalScore). Ozon content rating (0-100, качество
  // карточки) НЕ является звёздным рейтингом и не используется.
  const freshWbRating = wbRating?.rating ?? null;
  const wbRatingVal = freshWbRating ?? (db?.rating ?? null);
  const hasFreshWb = freshWbRating != null;
  const wbFeedbacks = wbRating?.feedbacks ?? null;
  // Количество отзывов Ozon: браузерный счётчик с витрины (db.ozonReviewsCount,
  // фаза ozon-prices) приоритетнее reviews_count из Seller API.
  const ozonReviewsCount =
    db?.ozonReviewsCount != null
      ? db.ozonReviewsCount
      : ozonInfo?.reviews_count != null
        ? Number(ozonInfo.reviews_count)
        : 0;
  const ozonRatingVal = db?.ozonRating ?? null;

  if (wbRatingVal != null) {
    // Свежий WB рейтинг — он главный; счётчик = WB отзывы + Ozon отзывы.
    // Без свежего WB-счётчика отзывов не пересчитываем (защита от удвоения).
    const totalRC =
      hasFreshWb && wbFeedbacks != null
        ? wbFeedbacks + ozonReviewsCount
        : (db?.reviewsCount ?? 0);
    if (wbRatingVal !== db?.rating) data.rating = Math.round(wbRatingVal * 10) / 10;
    if (totalRC !== (db?.reviewsCount ?? 0)) data.reviewsCount = totalRC;
  } else if (ozonRatingVal != null) {
    // Нет WB рейтинга — используем звёздный рейтинг с витрины Ozon
    if (ozonRatingVal !== db?.rating) data.rating = Math.round(ozonRatingVal * 10) / 10;
    const totalRC = ozonReviewsCount || (db?.reviewsCount ?? 0);
    if (totalRC !== (db?.reviewsCount ?? 0)) data.reviewsCount = totalRC;
  } else if (ozonReviewsCount > 0) {
    // Нет рейтинга, но есть Ozon отзывы — обновляем только счётчик
    if (ozonReviewsCount !== (db?.reviewsCount ?? 0)) data.reviewsCount = ozonReviewsCount;
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
    const sortOpts = (a, b) => (a.name || '').localeCompare(b.name || '');
    const merged = [];
    if (wbChars.length > 0) {
      merged.push({
        group_name: "Wildberries",
        options: wbChars.map((c) => ({
          name: c.name || String(c.id || ""),
          value: Array.isArray(c.value) ? c.value.join(", ") : String(c.value || ""),
        })).sort(sortOpts),
      });
    }
    if (ozonChars.length > 0) {
      merged.push({
        group_name: "Ozon",
        options: [...ozonChars].sort(sortOpts),
      });
    }
    // Сохраняем группы из db, которых нет в merged (например, Wildberries в Ozon-фазе)
    const dbChars = db?.characteristics || [];
    const mergedGroupNames = new Set(merged.map((g) => g.group_name));
    const otherDbGroups = dbChars
      .filter((g) => !mergedGroupNames.has(g.group_name))
      .map((g) => ({
        group_name: g.group_name,
        options: [...(g.options || [])].sort(sortOpts),
      }));
    const combined = [...merged, ...otherDbGroups];

    // Строим db-эквивалент для сравнения (сортированный)
    const dbEquivalent = combined.map((g) => {
      const dbGroup = dbChars.find((dbg) => dbg.group_name === g.group_name);
      return {
        group_name: g.group_name,
        options: [...(dbGroup?.options || [])].sort(sortOpts),
      };
    });
    if (JSON.stringify(combined) !== JSON.stringify(dbEquivalent)) {
      data.characteristics = combined;
    }
  }

  return data;
}
