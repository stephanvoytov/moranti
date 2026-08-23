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

export interface SiteSettings {
  hero: { title: string; tagline: string; subtitle: string; image: string; imageMobile: string };
  featuredIds: string[];
  catalogOrder: string[];
  wbApiKey: string;
  ozonClientId: string;
  ozonApiKey: string;
  yandexMetrikaId: string;
  /** Email владельца — куда приходят вопросы из формы «Задать вопрос» */
  contactEmail: string;
  categoryImages: Record<string, string>;
  social: { vk: string; telegram: string; whatsapp: string };
  marketplaces: { wildberries: string; ozon: string };
  updatedAt: string;
}

const DEFAULTS: SiteSettings = {
  hero: {
    title: "Moranti",
    tagline: "Сумки из натуральной итальянской кожи. Минимум пафоса — максимум качества. Из Италии.",
    subtitle: "Кожаные сумки на каждый день",
    image: "",
    imageMobile: "",
  },
  featuredIds: [],
  catalogOrder: [],
  wbApiKey: "",
  ozonClientId: "",
  ozonApiKey: "",
  yandexMetrikaId: "",
  contactEmail: "",
  categoryImages: {},
  social: { vk: "", telegram: "", whatsapp: "" },
  marketplaces: { wildberries: MARKETPLACE_URLS.wbSeller, ozon: MARKETPLACE_URLS.ozonSeller },
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

function mapPayloadSettings(doc: Record<string, any>, base: SiteSettings): SiteSettings {
  const social: SiteSettings["social"] = { vk: "", telegram: "", whatsapp: "" };
  for (const s of doc.social || []) {
    const platform = String(s.platform || "").toLowerCase();
    if (platform in social && s.url) {
      (social as any)[platform] = s.url;
    }
  }

  return {
    ...base,
    hero: {
      ...base.hero,
      title: doc.heroTitle || base.hero.title,
      tagline: doc.heroSubtitle || base.hero.tagline,
      subtitle: doc.heroSubtitle || base.hero.subtitle,
      image: doc.heroImage || base.hero.image,
      imageMobile: doc.heroImage || base.hero.imageMobile,
    },
    social,
    wbApiKey: doc.wbApiKey || base.wbApiKey,
    ozonClientId: doc.ozonClientId || base.ozonClientId,
    ozonApiKey: doc.ozonApiKey || base.ozonApiKey,
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
        if (res.docs.length) return mapPayloadSettings(res.docs[0] as any, fallback);
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
