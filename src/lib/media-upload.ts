/* =============================================
   Moranti — Media upload helper
   Общая логика загрузки файла в Vercel Blob:
   валидация типа/размера, генерация имени, put().
   Используется /api/admin/upload (в контексте формы)
   и /api/admin/media (медиа-хранилище).
   ============================================= */

import { put } from "@vercel/blob";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_SIZE } from "@/lib/schemas";
import { logger } from "@/lib/logger";

export interface UploadResult {
  url: string;
  filename: string;
}

/** Ошибка загрузки с HTTP-статусом для ответа клиенту. */
export class UploadError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "UploadError";
  }
}

export async function uploadFile(file: File, prefix: string): Promise<UploadResult> {
  if (!ALLOWED_UPLOAD_TYPES.includes(file.type as (typeof ALLOWED_UPLOAD_TYPES)[number])) {
    throw new UploadError(
      `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, AVIF`,
      400,
    );
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    throw new UploadError(
      `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max: ${MAX_UPLOAD_SIZE / 1024 / 1024} MB`,
      400,
    );
  }

  // Расширение из имени файла, санитайзим: только [a-z0-9] до 5 символов
  // (исключаем path-сегменты/спецсимволы в ключе blob)
  const rawExt = file.name.split(".").pop()?.toLowerCase() || "";
  const ext = /^[a-z0-9]{1,5}$/.test(rawExt) ? rawExt : "jpg";
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 6);
  const filename = `${prefix}${timestamp}-${random}.${ext}`;

  // addRandomSuffix: официальная рекомендация SDK — исключает конфликты путей;
  // contentType передаём явно из File.type (SDK берёт из расширения по умолчанию).
  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
  });

  logger.info("Upload success", { url: blob.url, filename, size: file.size });
  return { url: blob.url, filename };
}