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
  composition: z.string().optional(),
  colorName: z.string().optional(),
  modelId: z.string().optional().nullable(),
});

/* ─── Settings ─── */

export const heroSchema = z.object({
  title: z.string().default(""),
  tagline: z.string().default(""),
  subtitle: z.string().default(""),
  image: z.string().default(""),
});

export const seoSchema = z.object({
  defaultTitle: z.string().default(""),
  defaultDescription: z.string().default(""),
  defaultKeywords: z.string().default(""),
});

export const socialSchema = z.object({
  instagram: z.string().default(""),
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
  seo: seoSchema.optional(),
  updatedAt: z.string().optional(),
}).passthrough(); // разрешаем дополнительные поля (совместимость)

/* ─── Prices ─── */

export const pricesQuerySchema = z.object({
  articles: z.string().min(1, "articles parameter is required"),
  refresh: z.string().optional(),
});

/* ─── Products list query ─── */

export const productsQuerySchema = z.object({
  search: z.string().optional(),
  category: z.enum(VALID_CATEGORIES).optional(),
  archived: z.enum(["true", "false"]).optional(),
  marketplace: z.enum(["wb", "ozon", "both"]).optional(),
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

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10 MB
