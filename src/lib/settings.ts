/* =============================================
   Moranti — Settings read/write helpers
   Файл: data/settings.json (через JsonRepository)
   ============================================= */

import { JsonRepository } from "@/lib/json-repository";

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

const defaults = (): SiteSettings => ({
  hero: {
    title: "Moranti",
    tagline: "Сумки, которые сочетают эстетику, удобство и качество натуральных материалов.",
    subtitle: "Натуральная кожа итальянского производства. Минималистичные формы, ручная работа.",
    image: "",
  },
  featuredIds: [],
  catalogOrder: [],
  wbApiKey: "",
  yandexMetrikaId: "",
  contacts: {
    phone: "",
    email: "",
    address: "",
  },
  social: {
    instagram: "",
    vk: "",
    telegram: "",
    whatsapp: "",
  },
  marketplaces: {
    wildberries: "",
    ozon: "",
    yandexMarket: "",
  },
  seo: {
    defaultTitle: "Moranti",
    defaultDescription: "",
  },
  updatedAt: new Date().toISOString(),
});

const repo = new JsonRepository<SiteSettings>("settings.json", defaults);

/* ——— Public API ——— */

export function readSettings(): SiteSettings {
  return repo.read();
}

export function writeSettings(data: Partial<SiteSettings>): SiteSettings {
  const current = repo.read();
  const merged = { ...current, ...data, updatedAt: new Date().toISOString() };
  repo.write(merged);
  return merged;
}

export function invalidateSettingsCache(): void {
  repo.invalidate();
}
