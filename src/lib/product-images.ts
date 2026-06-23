/* =============================================
   Moranti — Product Image URL Generator
   Единственное место где задаётся размер фото.
   Все URL генерируются из article + count.
   ============================================= */

/** Размер фото на WB CDN */
export const WB_IMAGE_SIZE = "c516x688";

/** Основной хост CDN */
const CDN_HOST = "kgd-basket-cdn-01bl.geobasket.ru";

/**
 * Вычисляет vol/part для CDN-пути по артикулу WB.
 */
function getVolPart(article: number): { vol: number; part: number } {
  const s = String(article);
  const vol = s <= "143" ? 1 : Math.floor(article / 100000);
  const part = Math.floor(Number(s.slice(0, -3)) / 10) * 10;
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
