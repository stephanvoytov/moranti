/* =============================================
   POST /api/admin/upload
   Загрузка изображения на сервер
   Protected: requires valid admin session
   ============================================= */

import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
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

    // Validate type
    if (!ALLOWED_UPLOAD_TYPES.includes(file.type as typeof ALLOWED_UPLOAD_TYPES[number])) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, AVIF` },
        { status: 400 },
      );
    }

    // Validate size
    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max: 10 MB` },
        { status: 400 },
      );
    }

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 6);
    const filename = `${timestamp}-${random}.${ext}`;

    // Save file
    const dir = path.join(process.cwd(), "public", "images", "products");
    await mkdir(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);

    const url = `/images/products/${filename}`;

    return NextResponse.json({ url, filename });
  } catch (err) {
    logger.error("Upload failed", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
