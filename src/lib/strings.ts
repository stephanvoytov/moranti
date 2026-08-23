/* =============================================
   Moranti — Site strings (client-safe)
   Чистая функция t() + тип. Без server-imports,
   чтобы можно было импортировать в "use client".
   ============================================= */

export interface SiteStrings {
  [key: string]: string;
}

/** Получить строку по ключу с fallback */
export function t(
  strings: SiteStrings | undefined,
  key: string,
  fallback: string,
): string {
  if (!strings) return fallback;
  return strings[key] || fallback;
}
