/* =============================================
   Moranti — Settings read/write helpers
   Файл: data/settings.json
   ============================================= */

import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

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

let _settings: SiteSettings | null = null;

function settingsPath(): string {
  return path.join(process.cwd(), "data", "settings.json");
}

function defaults(): SiteSettings {
  return {
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
  };
}

export function readSettings(): SiteSettings {
  if (_settings) return _settings;

  const fp = settingsPath();
  if (!existsSync(fp)) {
    _settings = defaults();
    return _settings;
  }

  const raw = readFileSync(fp, "utf-8");
  const parsed = JSON.parse(raw);

  // Merge with defaults to ensure new fields exist
  _settings = { ...defaults(), ...parsed, hero: { ...defaults().hero, ...parsed.hero } };
  return _settings!;
}

export function writeSettings(data: Partial<SiteSettings>): SiteSettings {
  const current = readSettings();
  const merged = { ...current, ...data, updatedAt: new Date().toISOString() };
  writeFileSync(settingsPath(), JSON.stringify(merged, null, 2), "utf-8");
  _settings = merged;
  return merged;
}
