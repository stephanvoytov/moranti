/* =============================================
   Moranti — Settings
   Источник: Супрабаза (Prisma)
   ============================================= */

import { readFileSync, existsSync } from "fs";
import path from "path";
import type { Prisma } from "@prisma/client";
import prisma, { prismaQuery } from "@/lib/prisma";
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
  categoryImages: Record<string, string>;
  social: { instagram: string; vk: string; telegram: string; whatsapp: string };
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
  categoryImages: {},
  social: { instagram: "", vk: "", telegram: "", whatsapp: "" },
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

export async function readSettings(): Promise<SiteSettings> {
  return cacheGet("site-settings", async () => {
    try {
      const row = await prismaQuery(() =>
        prisma.settings.findUnique({ where: { id: "singleton" } }),
      );

      if (!row) return defaultSettings();

      return { ...DEFAULTS, ...(row.data as unknown as SiteSettings) };
    } catch (err) {
      logger.warn("DB unavailable, fallback to settings.json", {
        error: (err as Error)?.message,
      });
      const fallback = readSettingsFallback();
      if (fallback) return fallback;
      return defaultSettings();
    }
    // Настройки меняются из админки; TTL 30с — чтобы изменения (hero, категории)
    // распространялись быстро между serverless-инстансами. writeSettings
    // инвалидирует ключ после записи.
  }, 30_000, 600_000);
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

  await prismaQuery(() =>
    prisma.settings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", data: merged as unknown as Prisma.InputJsonValue },
      update: { data: merged as unknown as Prisma.InputJsonValue },
    }),
  );

  invalidateCache("site-settings");
  return merged;
}
