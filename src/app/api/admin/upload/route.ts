import { NextResponse } from "next/server";
import { getSession } from "@/lib/admin-auth";
import { csrfGuard } from "@/lib/csrf";
import { enforceRateLimit } from "@/lib/rate-limit";
import { uploadFile, UploadError } from "@/lib/media-upload";
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

    const { url, filename } = await uploadFile(file, "images/products/");
    return NextResponse.json({ url, filename });
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
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