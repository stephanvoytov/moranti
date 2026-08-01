/* =============================================
   Moranti — форматирование для админки
   ============================================= */

/** «29 900 ₽» или «—» для null/undefined */
export function formatPrice(n?: number | null): string {
  return n != null ? n.toLocaleString("ru-RU") + " ₽" : "—";
}
