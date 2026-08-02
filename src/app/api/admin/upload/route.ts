import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSession } from "@/lib/admin-auth";
import { csrfGuard } from "@/lib/csrf";
import { enforceRateLimit } from "@/lib/rate-limit";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_SIZE } from "@/lib/schemas";
import { logger } from "@/lib/logger";

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

    if (!ALLOWED_UPLOAD_TYPES.includes(file.type as typeof ALLOWED_UPLOAD_TYPES[number])) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, AVIF` },
        { status: 400 },
      );
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max: ${MAX_UPLOAD_SIZE / 1024 / 1024} MB` },
        { status: 400 },
      );
    }

    // Расширение из имени файла, санитайзим: только [a-z0-9] до 5 символов
    // (исключаем path-сегменты/спецсимволы в ключе blob)
    const rawExt = file.name.split(".").pop()?.toLowerCase() || "";
    const ext = /^[a-z0-9]{1,5}$/.test(rawExt) ? rawExt : "jpg";
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 6);
    const filename = `images/products/${timestamp}-${random}.${ext}`;

    // addRandomSuffix: официальная рекомендация SDK — исключает конфликты путей;
    // contentType передаём явно из File.type (SDK берёт из расширения по умолчанию).
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });

    logger.info("Upload success", { url: blob.url, filename, size: file.size });
    return NextResponse.json({ url: blob.url, filename });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Upload failed", { error: message, stack: err instanceof Error ? err.stack : undefined });
    if (message.includes("BLOB_READ_WRITE_TOKEN")) {
      return NextResponse.json(
        { error: "Upload failed", detail: "Missing Vercel Blob token. Please configure BLOB_READ_WRITE_TOKEN in .env.local" },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Upload failed", detail: message }, { status: 500 });
  }
}
