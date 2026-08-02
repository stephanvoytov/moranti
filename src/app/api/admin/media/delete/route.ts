import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { getSession } from "@/lib/admin-auth";
import { csrfGuard } from "@/lib/csrf";
import { findMediaUsage } from "@/lib/media-usage";
import { logger } from "@/lib/logger";

/* ——— DELETE: удаление файла из медиа-хранилища ———
   Сначала проверяем, не используется ли URL в настройках/товарах/моделях.
   Если используется — 409 с перечнем мест, чтобы не сломать витрину. */
export async function DELETE(request: Request) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const url = new URL(request.url).searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  try {
    const usages = await findMediaUsage(url);
    if (usages.length > 0) {
      return NextResponse.json({ error: "File is in use", usages }, { status: 409 });
    }

    await del(url);
    logger.info("Media deleted", { url });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Media delete failed", { error: message, url });
    return NextResponse.json({ error: "Delete failed", detail: message }, { status: 500 });
  }
}