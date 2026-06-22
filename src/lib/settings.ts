/* =============================================
   Moranti — Settings
   Источник: Neon Postgres (через Prisma)
   Fallback: data/settings.json
   ============================================= */

import { readFileSync } from "fs";
import path from "path";
import prisma from "@/lib/prisma";

export interface SiteSettings {
  hero: {
    title: string;
    tagline: string;
    subtitle: string;
    image: string;
  };
  featuredIds: string[];
  catalogOrder: string[];
  wbApiKey: string;
  yandexMetrikaId: string;
  /** Фото категорий для главной: { slug → URL } */
  categoryImages: Record<string, string>;
  contacts: {
    phone: string;
    email: string;
    address: string;
  };
  social: {
    instagram: string;
    vk: string;
    telegram: string;
    whatsapp: string;
  };
  marketplaces: {
    wildberries: string;
    ozon: string;
    yandexMarket: string;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
  };
  updatedAt: string;
}

/* =============================================
   Defaults
   ============================================= */

export function defaultSettings(): SiteSettings {
  return {
    hero: {
      title: "Moranti",
      tagline: "Минимум пафоса — максимум качества.",
      subtitle: "Кожаные сумки на каждый день",
      image: "",
    },
    featuredIds: [],
    catalogOrder: [],
    wbApiKey: "",
    yandexMetrikaId: "",
    categoryImages: {},
    contacts: { phone: "", email: "", address: "" },
    social: { instagram: "", vk: "", telegram: "", whatsapp: "" },
    marketplaces: { wildberries: "", ozon: "", yandexMarket: "" },
    seo: { defaultTitle: "Moranti", defaultDescription: "" },
    updatedAt: new Date().toISOString(),
  };
}

/* =============================================
   Fallback: data/settings.json
   ============================================= */

function readJsonFallback(): SiteSettings | null {
  try {
    const filePath = path.join(process.cwd(), "data", "settings.json");
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

let fallbackCache: SiteSettings | null = null;

function getFallback(): SiteSettings {
  if (!fallbackCache) {
    fallbackCache = readJsonFallback() ?? defaultSettings();
  }
  return fallbackCache;
}

/* =============================================
   Read
   ============================================= */

export async function readSettings(): Promise<SiteSettings> {
  try {
    const row = await prisma.settings.findUnique({
      where: { id: "singleton" },
    });
    if (row?.data) {
      const data = row.data as unknown as SiteSettings;
      // Проверяем что данные не пустые
      if (data.hero && data.seo) return data;
    }
  } catch {
    // fallback
  }
  return getFallback();
}

/* =============================================
   Write
   ============================================= */

export async function writeSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
  // Читаем текущие (из БД или fallback)
  const current = await readSettings();
  const merged: SiteSettings = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  try {
    await prisma.settings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", data: merged as any },
      update: { data: merged as any },
    });
  } catch (err) {
    console.warn("[settings] Failed to write to DB:", err);
  }

  return merged;
}

export function invalidateSettingsCache(): void {
  fallbackCache = null;
}
