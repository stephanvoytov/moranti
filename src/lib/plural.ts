/* =============================================
   Moranti — русская плюрализация
   ============================================= */

/** «1 товар, 2 товара, 5 товаров» — по правилам 1/2-4/5-9 */
export function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
