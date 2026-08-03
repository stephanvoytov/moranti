/* =============================================
   Moranti — Blob proxy
   GET /api/blob/{store}/{path...}
   Проксирует запрос на *.public.blob.vercel-storage.com
   через свой домен — blob-домен блокируется
   российскими провайдерами, свой домен работает.
   Ответ кэшируется на год (blob-URL контент-адресные).
   ============================================= */

import { NextRequest, NextResponse } from "next/server";

// Только буквенно-цифровые store-id — защита от path traversal/мусора в upstream
const STORE_RE = /^[a-z0-9]+$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const [store, ...rest] = path;

  if (!store || !STORE_RE.test(store) || rest.length === 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  const upstream = `https://${store}.public.blob.vercel-storage.com/${rest.join("/")}`;

  try {
    // Таймаут 8с: если blob недоступен (сеть/блокировка) — не вешаем запрос
    const res = await fetch(upstream, {
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/octet-stream",
        // blob-URL уникальны (timestamp + random suffix) — кэш навсегда
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Blob-Proxy": "1",
      },
    });
  } catch {
    return new NextResponse("Upstream unavailable", { status: 502 });
  }
}