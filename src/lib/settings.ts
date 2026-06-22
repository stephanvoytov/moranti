/* =============================================
   Moranti — Settings
   Источник: Супрабаза (Prisma)
   ============================================= */

import prisma, { prismaQuery } from "@/lib/prisma";

export interface SiteSettings {
  hero: { title: string; tagline: string; subtitle: string; image: string };
  featuredIds: string[];
  catalogOrder: string[];
  wbApiKey: string;
  yandexMetrikaId: string;
  categoryImages: Record<string, string>;
  contacts: { phone: string; email: string; address: string };
  social: { instagram: string; vk: string; telegram: string; whatsapp: string };
  marketplaces: { wildberries: string; ozon: string; yandexMarket: string };
  seo: { defaultTitle: string; defaultDescription: string };
  updatedAt: string;
}

const DEFAULTS: SiteSettings = {
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

export function defaultSettings(): SiteSettings {
  return { ...DEFAULTS, updatedAt: new Date().toISOString() };
}

export async function readSettings(): Promise<SiteSettings> {
  const row = await prismaQuery(() =>
    prisma.settings.findUnique({ where: { id: "singleton" } }),
  );

  if (!row) return defaultSettings();

  return { ...DEFAULTS, ...(row.data as unknown as SiteSettings) };
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
      create: { id: "singleton", data: merged as any },
      update: { data: merged as any },
    }),
  );

  return merged;
}
