/**
 * Преобразует URL изображения WB в HD-версию (big).
 * Если URL не от WB, возвращает как есть.
 */
export function wbImageHd(url: string): string {
  return url.replace("/c516x688/", "/big/");
}
