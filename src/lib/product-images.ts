/* =============================================
   Moranti — Product Image URL Generator
   Единственное место где задаётся размер фото.
   Все URL генерируются из article + count.
   ============================================= */

/** Размер фото на WB CDN */
export const WB_IMAGE_SIZE = "big";

/**
 * Единый хост CDN Wildberries.
 *
 * ВАЖНО: используем один хост, а не массив с ротацией — разные баскет-хосты
 * могут иметь разный набор фото. Единый хост гарантирует загрузку всех фото.
 * Для скрипта синхронизации (wb-utils.mjs) своя ротация — там это не критично.
 */
const CDN_HOST = "kgd-basket-cdn-01bl.geobasket.ru";

/**
 * Вычисляет vol/part для CDN-пути по артикулу WB.
 */
function getVolPart(article: number): { vol: number; part: number } {
  const vol = article <= 143 ? 1 : Math.floor(article / 100000);
  const part = Math.floor(article / 1000);
  return { vol, part };
}

/**
 * URL одного фото товара на WB CDN.
 *
 * @param article — артикул WB
 * @param index — номер фото (1-based)
 * @param size — размер (c246x328, c516x688, big)
 */
export function cdnImageUrl(
  article: number,
  index = 1,
  size = WB_IMAGE_SIZE,
): string {
  const { vol, part } = getVolPart(article);
  return `https://${CDN_HOST}/vol${vol}/part${part}/${article}/images/${size}/${index}.webp`;
}

/**
 * Генерирует главное фото + массив всех фото для товара.
 *
 * Если article не задан — возвращает undefined (используется fallback).
 */
/**
 * Миниатюра для переключателя цветов — размер tm (tiny).
 */
export function swatchUrl(article: number): string {
  return cdnImageUrl(article, 1, "tm");
}

export function generateProductImages(
  article: number | null | undefined,
  photoCount: number,
): { image: string; images: string[] } | undefined {
  if (!article || article <= 0) return undefined;

  const images: string[] = [];
  for (let i = 1; i <= photoCount; i++) {
    images.push(cdnImageUrl(article, i));
  }

  return {
    image: images[0] || "",
    images,
  };
}

interface ImageSourceFields {
  /** Остаток на Wildberries (null = товара нет на WB) */
  wbStock?: number | null;
  /** Артикул WB для fallback-генерации CDN URL */
  wbArticle?: number | null;
  /** Главное фото, сохранённое в БД (приоритетно WB) */
  image?: string | null;
  /** Все фото, сохранённые в БД (приоритетно WB) */
  images?: string[] | null;
  /** Главное фото с Ozon (для админки / fallback) */
  ozonImage?: string | null;
  /** Все фото с Ozon */
  ozonImages?: string[] | null;
  /** Количество фото (для fallback-генерации) */
  photoCount?: number;
}

/**
 * Выбирает фото для витрины (главное + галерея).
 *
 * Правило: если товар не в наличии на Wildberries (`wbStock ?? 0 <= 0`) и есть
 * фото с Ozon — берём Ozon-фото (покупатель видит актуальную карточку с Ozon).
 * Иначе — сохранённые в БД фото (WB-приоритет), затем fallback-генерация из
 * артикула WB. Единое правило для mapProduct и публичной витрины.
 */
export function selectProductImages(p: ImageSourceFields): { image: string; images: string[] } {
  const wbInStock = (p.wbStock ?? 0) > 0;
  const ozonList = p.ozonImages?.length
    ? p.ozonImages
    : p.ozonImage
      ? [p.ozonImage]
      : null;

  if (!wbInStock && ozonList) {
    return { image: ozonList[0], images: ozonList };
  }

  if (p.images?.length) {
    return { image: p.image || p.images[0] || "", images: p.images };
  }

  const computed = generateProductImages(p.wbArticle ?? null, p.photoCount ?? 1);
  return { image: computed?.image || "", images: computed?.images || [] };
}

/**
 * Выбирает одиночную миниатюру (превью в админке, свотчи).
 * Такое же правило, что и selectProductImages, но для одного фото.
 */
export function pickDisplayImage(p: {
  wbStock?: number | null;
  image?: string | null;
  ozonImage?: string | null;
}): string | null {
  const wbInStock = (p.wbStock ?? 0) > 0;
  if (!wbInStock && p.ozonImage) return p.ozonImage;
  return p.image || p.ozonImage || null;
}
