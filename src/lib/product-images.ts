/* =============================================
   Moranti — Product Image URL Generator
   Единственное место где задаётся размер фото.
   Все URL генерируются из article + count.
   ============================================= */

/** Размер фото на WB CDN */
export const WB_IMAGE_SIZE = "big";

/** CDN-хосты WB с детерминированным выбором по vol. */
export const CDN_HOSTS = [
  "https://kgd-basket-cdn-01bl.geobasket.ru",
  "https://basket-01.wbbasket.ru",
  "https://basket-02.wbbasket.ru",
  "https://basket-05.wbbasket.ru",
  "https://basket-08.wbbasket.ru",
  "https://basket-10.wbbasket.ru",
  "https://basket-12.wbbasket.ru",
  "https://basket-15.wbbasket.ru",
];

/**
 * Выбирает CDN-хост для артикула WB (детерминированно, по vol).
 */
export function pickCdnHost(article: number): string {
  const vol = Math.floor(article / 100000);
  if (!CDN_HOSTS || CDN_HOSTS.length === 0) return "https://basket-01.wbbasket.ru";
  return CDN_HOSTS[vol % CDN_HOSTS.length];
}

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
  const host = pickCdnHost(article);
  return `${host}/vol${vol}/part${part}/${article}/images/${size}/${index}.webp`;
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
