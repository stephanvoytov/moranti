/* =============================================
   Moranti Categories — единственный источник правды
   ============================================= */

export const CATEGORIES = [
  { slug: "crossbody", name: "Кросс-боди", namePlural: "Кросс-боди", description: "Сумки через плечо" },
  { slug: "na-plecho", name: "На плечо", namePlural: "На плечо", description: "Сумки на плечо" },
  { slug: "baguette", name: "Багет", namePlural: "Багет", description: "Сумки-багет" },
  { slug: "tote", name: "Тоут", namePlural: "Тоуты", description: "Шоперы и тоуты" },
  { slug: "saddle", name: "Седло", namePlural: "Седло", description: "Сумки-седло" },
  { slug: "backpack", name: "Рюкзак", namePlural: "Рюкзаки", description: "Рюкзаки" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export const VALID_CATEGORIES: readonly string[] = CATEGORIES.map((c) => c.slug);
export const CATEGORY_SLUGS: CategorySlug[] = CATEGORIES.map((c) => c.slug);

export const CATEGORY_ORDER: CategorySlug[] = [
  "crossbody",
  "na-plecho",
  "baguette",
  "tote",
  "saddle",
  "backpack",
];

export function getCategoryName(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

export function getCategoryNamePlural(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.namePlural ?? slug;
}

export function getCategoryDescription(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.description ?? "";
}

export function isCategorySlug(slug: string): slug is CategorySlug {
  return CATEGORY_SLUGS.includes(slug as CategorySlug);
}
