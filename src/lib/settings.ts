/* =============================================
   Moranti — Settings
   Источник: Payload CMS (единственный источник правды)
   ============================================= */

import { readFileSync, existsSync } from "fs";
import path from "path";
import { getPayload } from "payload";
import config from "@payload-config";
import { cacheGet, invalidateCache } from "@/lib/data-cache";
import { logger } from "@/lib/logger";
import { MARKETPLACE_URLS } from "@/lib/marketplaces";

/** Рейтинг продавца с маркетплейсов (заполняет scripts/fetch-seller-ratings.mjs) */
export interface StoreSellerRating {
  ratingValue: number;
  reviewCount: number;
  wb?: { ratingValue: number; reviewCount: number };
  ozon?: { ratingValue: number; reviewCount: number };
  updatedAt: string;
}

export interface SiteSettings {
  wbApiKey: string;
  ozonClientId: string;
  ozonApiKey: string;
  yandexMetrikaId: string;
  /** Email владельца — куда приходят вопросы из формы «Задать вопрос» */
  contactEmail: string;
  social: { vk: string; telegram: string; whatsapp: string };
  marketplaces: { wildberries: string; ozon: string };
  /** Рейтинги продавца WB/Ozon + взвешенное среднее — для сниппетов */
  storeRating: StoreSellerRating | null;
  /** Порядок категорий в каталоге (по slug) */
  catalogOrder: string[];
  updatedAt: string;
}

const DEFAULTS: SiteSettings = {
  wbApiKey: "",
  ozonClientId: "",
  ozonApiKey: "",
  yandexMetrikaId: "",
  contactEmail: "",
  social: { vk: "", telegram: "", whatsapp: "" },
  marketplaces: { wildberries: MARKETPLACE_URLS.wbSeller, ozon: MARKETPLACE_URLS.ozonSeller },
  storeRating: null,
  catalogOrder: [],
  updatedAt: new Date().toISOString(),
};

export function defaultSettings(): SiteSettings {
  return { ...DEFAULTS, updatedAt: new Date().toISOString() };
}

function readSettingsFallback(): SiteSettings | null {
  try {
    const p = path.join(process.cwd(), "data", "settings.json");
    if (!existsSync(p)) return null;
    return JSON.parse(readFileSync(p, "utf-8")) as SiteSettings;
  } catch {
    return null;
  }
}

function mapPayloadSettings(doc: Record<string, unknown>, base: SiteSettings): SiteSettings {
  const social: SiteSettings["social"] = { vk: "", telegram: "", whatsapp: "" };
  const socialList = (doc.social as unknown[]) || [];
  for (const s of socialList) {
    const item = s as { platform?: unknown; url?: unknown };
    const platform = String(item.platform || "").toLowerCase();
    if (platform in social && item.url) {
      social[platform as keyof typeof social] = String(item.url);
    }
  }

  return {
    ...base,
    contactEmail: typeof doc.contactEmail === "string" ? doc.contactEmail : base.contactEmail,
    social,
    wbApiKey: typeof doc.wbApiKey === "string" ? doc.wbApiKey : base.wbApiKey,
    ozonClientId: typeof doc.ozonClientId === "string" ? doc.ozonClientId : base.ozonClientId,
    ozonApiKey: typeof doc.ozonApiKey === "string" ? doc.ozonApiKey : base.ozonApiKey,
    updatedAt: new Date().toISOString(),
  };
}

export async function readSettings(): Promise<SiteSettings> {
  return cacheGet(
    "site-settings",
    async () => {
      const fallback = readSettingsFallback() || defaultSettings();
      try {
        const payload = await getPayload({ config });
        const res = await payload.find({
          collection: "site-settings",
          limit: 1,
          depth: 0,
        });
        if (res.docs.length) return mapPayloadSettings(res.docs[0] as unknown as Record<string, unknown>, fallback);
        return fallback;
      } catch (err) {
        logger.warn("Payload unavailable, fallback to settings.json", {
          error: (err as Error)?.message,
        });
        return fallback;
      }
    },
    30_000,
    600_000,
  );
}

export async function writeSettings(
  data: Partial<SiteSettings>,
): Promise<SiteSettings> {
  const current = await readSettings();
  const merged: SiteSettings = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  };

    try {
      const payload = await getPayload({ config });
      const res = await payload.find({
        collection: "site-settings",
        limit: 1,
        depth: 0,
      });
    // Hero и social переехали: hero — в Страницу «home», social — в глобал
    // «Контент сайта» (src/lib/site-content.ts). Здесь остаются только ключи.
    if (res.docs.length) {
      await payload.update({
        collection: "site-settings",
        id: res.docs[0].id,
        data: {
          wbApiKey: merged.wbApiKey,
          ozonClientId: merged.ozonClientId,
          ozonApiKey: merged.ozonApiKey,
        },
      });
    } else {
      await payload.create({
        collection: "site-settings",
        data: {
          wbApiKey: merged.wbApiKey,
          ozonClientId: merged.ozonClientId,
          ozonApiKey: merged.ozonApiKey,
        },
      });
    }
  } catch (err) {
    logger.warn("Failed to write settings to Payload", {
      error: (err as Error)?.message,
    });
  }

  invalidateCache("site-settings");
  return merged;
}
