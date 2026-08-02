import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { getSession } from "@/lib/admin-auth";
import { csrfGuard } from "@/lib/csrf";
import { enforceRateLimit } from "@/lib/rate-limit";
import { uploadFile, UploadError } from "@/lib/media-upload";
import { logger } from "@/lib/logger";

/* ——— GET: список файлов медиа-хранилища ——— */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim().toLowerCase() || "";
  const cursor = url.searchParams.get("cursor") || undefined;
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 50, 1), 200);

  try {
    // При поиске тянем больше (blob не умеет фильтровать по имени — фильтруем сами)
    const { blobs, cursor: nextCursor, hasMore } = await list({
      limit: q ? 1000 : limit,
      cursor,
    });

    let items = blobs.map((b) => ({
      url: b.url,
      pathname: b.pathname,
      size: b.size,
      uploadedAt: b.uploadedAt.toISOString(),
    }));

    if (q) {
      items = items.filter((b) => b.pathname.toLowerCase().includes(q));
    }

    return NextResponse.json({
      items,
      cursor: q ? null : nextCursor,
      hasMore: q ? false : hasMore,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Media list failed", { error: message });
    return NextResponse.json({ error: "Failed to list media", detail: message }, { status: 500 });
  }
}

/* —————————————————————————————————: загрузка в медиа-хранилище ——— */
export async function POST(request: Request) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rl = enforceRateLimit(request, { max: 20, windowMs: 60_000 });
  if (rl) return rl;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const { url, filename } = await uploadFile(file, "media/");
    return NextResponse.json({ url, filename });
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Media upload failed", { error: message, stack: err instanceof Error ? err.stack : undefined });
    return NextResponse.json({ error: "Upload failed", detail: message }, { status: 500 });
  }
}