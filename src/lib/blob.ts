/* =============================================
   Moranti — Blob URL helper
   Vercel Blob (*.public.blob.vercel-storage.com)
   блокируется российскими провайдерами. Чтобы
   картинки открывались без VPN, отдаём их через
   свой домен: /api/blob/{store}/{path} — роут
   проксирует запрос на blob (Vercel→Vercel).
   ============================================= */

const BLOB_HOST_RE = /^https:\/\/([a-z0-9]+)\.public\.blob\.vercel-storage\.com\/(.+)$/i;

/**
 * Переписывает blob-URL в прокси-URL своего домена.
 * Не-blob URL (локальные /images/..., внешние CDN) возвращает как есть.
 */
export function blobUrl(url: string): string {
  const m = url.match(BLOB_HOST_RE);
  if (!m) return url;
  return `/api/blob/${m[1]}/${m[2]}`;
}

/** Проверка: является ли URL blob-адресом Vercel */
export function isBlobUrl(url: string): boolean {
  return BLOB_HOST_RE.test(url);
}