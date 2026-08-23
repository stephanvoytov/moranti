/* =============================================
   Moranti — Zod Schemas
   Валидация входных данных для всех API-роутов.
   ============================================= */

import { z } from "zod";

/* ─── Категории товаров ─── */

export const VALID_CATEGORIES = [
  "crossbody",
  "na-plecho",
  "baguette",
  "tote",
  "saddle",
  "backpack",
] as const;

export type Category = (typeof VALID_CATEGORIES)[number];

/* ─── Login ─── */

export const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

/* ─── Product ─── */

export const marketplaceLinkSchema = z.object({
  name: z.enum(["Wildberries", "Ozon"]),
  url: z.string().url(),
  icon: z.string(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Price must be > 0"),
  originalPrice: z.number().positive().optional(),
  currency: z.literal("₽").optional().default("₽"),
  category: z.enum(VALID_CATEGORIES, {
    message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`,
  }),
  description: z.string().optional().default(""),
  image: z.string().optional().default(""),
  images: z.array(z.string()).optional().default([]),
  marketplaces: z.array(marketplaceLinkSchema).optional().default([]),
  wbArticle: z.number().int().positive().optional().nullable(),
  ozonArticle: z.number().int().positive().optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  reviewsCount: z.number().int().nonnegative().optional().nullable(),
  salesCount: z.number().int().nonnegative().optional().nullable(),
  slug: z.string().optional(),
  sku: z.string().optional(),
  modelId: z.string().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  price: z.number().positive("Price must be > 0").optional(),
  originalPrice: z.number().positive().optional(),
  currency: z.literal("₽").optional(),
  category: z.enum(VALID_CATEGORIES, {
    message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`,
  }).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  wbArticle: z.number().int().positive().optional().nullable(),
  ozonArticle: z.number().int().positive().optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  reviewsCount: z.number().int().nonnegative().optional().nullable(),
  sku: z.string().optional().nullable(),
  composition: z.string().optional(),
  colorName: z.string().optional(),
  modelId: z.string().optional().nullable(),
  inStock: z.boolean().optional(),
  archivedAt: z.string().datetime().optional().nullable(),
});

/* ─── Settings ─── */

export const heroSchema = z.object({
  title: z.string().default(""),
  tagline: z.string().default(""),
  subtitle: z.string().default(""),
  image: z.string().default(""),
  imageMobile: z.string().default(""),
});

export const socialSchema = z.object({
  vk: z.string().default(""),
  telegram: z.string().default(""),
  whatsapp: z.string().default(""),
});

export const settingsSchema = z.object({
  hero: heroSchema.optional(),
  featuredIds: z.array(z.string()).optional(),
  catalogOrder: z.array(z.string()).optional(),
  wbApiKey: z.string().optional(),
  wbArticles: z.array(z.number()).optional(),
  yandexMetrikaId: z.string().optional(),
  social: socialSchema.optional(),
  updatedAt: z.string().optional(),
}).passthrough(); // разрешаем дополнительные поля (совместимость)

/* ─── Question («Задать вопрос») ─── */

export const questionSchema = z.object({
  /** Имя посетителя — необязательно */
  name: z.string().trim().max(80, "Имя слишком длинное").optional(),
  email: z.string().email("Некорректный email"),
  question: z.string().trim().min(10, "Вопрос слишком короткий").max(2000, "Вопрос слишком длинный"),
  /** Slug товара (необязательно — форма есть и в навбаре) */
  productSlug: z.string().max(120).optional(),
  /** Honeypot: люди это поле не видят и не заполняют */
  website: z.string().max(0).optional(),
  /** Согласие на рассылку (галка в форме) */
  subscribe: z.boolean().optional().default(false),
});

export type QuestionInput = z.infer<typeof questionSchema>;

/* ─── Subscribe (double opt-in) ─── */

export const subscribeSchema = z.object({
  email: z.string().email("Некорректный email"),
  /** Honeypot: люди это поле не видят и не заполняют */
  website: z.string().max(0).optional(),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;

/* ─── Products list query ─── */

export const productsQuerySchema = z.object({
  search: z.string().optional(),
  category: z.enum(VALID_CATEGORIES).optional(),
  archived: z.enum(["true", "false"]).optional(),
  marketplace: z.enum(["wb", "ozon", "both"]).optional(),
  sortBy: z.enum(["wbStock", "ozonStock", "price", "name", "createdAt", "updatedAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(200).optional().default(20),
});

/* ─── Upload file ─── */

export const ALLOWED_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

// 4 МБ: безопасно для лимита тела запроса классического serverless Vercel (4.5 МБ).
// На Fluid Compute лимит выше, но единый порог исключает 413 до route handler.
export const MAX_UPLOAD_SIZE = 4 * 1024 * 1024; // 4 MB
