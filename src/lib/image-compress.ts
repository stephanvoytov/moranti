/* =============================================
   Moranti — Client-side image compression
   Сжимает фото в браузере перед загрузкой:
   canvas → WebP (quality 0.82), max 1600px.
   Фото с камеры (2-4 МБ PNG/JPEG) превращаются
   в ~150-400 КБ WebP — страницы грузятся быстрее.
   ============================================= */

export interface CompressOptions {
  /** Максимальная ширина, px */
  maxWidth?: number;
  /** Максимальная высота, px */
  maxHeight?: number;
  /** Качество WebP/JPEG: 0..1 */
  quality?: number;
  /** Целевой формат */
  format?: "image/webp" | "image/jpeg";
}

const DEFAULTS: Required<CompressOptions> = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.82,
  format: "image/webp",
};

/** Файлы меньше этого размера не трогаем (нет смысла терять качество) */
const SKIP_IF_SMALLER_THAN = 250 * 1024; // 250 КБ

/**
 * Сжимает изображение. Если файл уже маленький или не картинка — возвращает как есть.
 * Работает только в браузере (использует canvas).
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {},
): Promise<File> {
  const opts = { ...DEFAULTS, ...options };

  if (!file.type.startsWith("image/")) return file;
  if (file.size < SKIP_IF_SMALLER_THAN) return file;

  try {
    const bitmap = await createImageBitmap(file);

    const scale = Math.min(
      1,
      opts.maxWidth / bitmap.width,
      opts.maxHeight / bitmap.height,
    );
    const targetW = Math.max(1, Math.round(bitmap.width * scale));
    const targetH = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, opts.format, opts.quality);
    });
    if (!blob) return file;

    // Если сжатие не дало выигрыша — оставляем оригинал
    if (blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    const ext = opts.format === "image/webp" ? "webp" : "jpg";
    return new File([blob], `${baseName}.${ext}`, { type: opts.format });
  } catch {
    // createImageBitmap/canvas недоступны — загружаем оригинал
    return file;
  }
}