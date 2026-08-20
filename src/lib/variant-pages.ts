/* =============================================
   Moranti — Variant landing pages
   Индексируемые лендинги категория × цвет/материал
   (/catalog/crossbody/iz-zamshi, /catalog/tote/chernye)
   + глобальные страницы материалов (/catalog/iz-zamshi).
   Генерируются из актуальных товаров: комбинации с <2
   товарами не создаются (тонкий контент).
   ============================================= */

import type { Product } from "@/data/products";
import { seoConfig, applyTemplate } from "@/config/seo";
import { getBasicColorName } from "@/lib/color-map";

export type VariantKind = "material" | "color";

export interface VariantPage {
  kind: VariantKind;
  /** Слаг категории; null — глобальная страница (/catalog/iz-zamshi) */
  category: string | null;
  /** Сегмент пути лендинга: iz-zamshi | chernye */
  variant: string;
  /** Полный путь: /catalog/tote/iz-zamshi */
  path: string;
  /** H1 страницы («Сумки-тоуты из замши») */
  h1: string;
  /** Title для generateMetadata */
  title: string;
  description: string;
  /** Название для breadcrumb («Тоут из замши») */
  breadcrumb: string;
  /** Материал (нормализованный, «Замша»/«Кожа») — для фильтра каталога */
  material?: string;
  /** Цвет (базовый, «Чёрный») — для фильтра каталога */
  color?: string;
  /** Товары комбинации */
  products: Product[];
}

/* ─── Материалы ─── */

export const MATERIALS = {
  "Кожа": {
    slug: "iz-naturalnoj-kozhi",
    genitive: "натуральной кожи",
    breadcrumb: "натуральная кожа",
  },
  "Замша": {
    slug: "iz-zamshi",
    genitive: "замши",
    breadcrumb: "замша",
  },
  "Кожа + Замша": {
    slug: "iz-kozhi-i-zamshi",
    genitive: "натуральной кожи и замши",
    breadcrumb: "кожа и замша",
  },
} as const;

type MaterialName = keyof typeof MATERIALS;

/** Нормализация материала: как в фильтре каталога (catalog-content) */
export function normalizeMaterial(composition: string | undefined): MaterialName | null {
  if (!composition) return null;
  const c = composition.toLowerCase();
  const hasLeather = c.includes("кожа");
  const hasSuede = c.includes("замша");
  if (hasLeather && hasSuede) return "Кожа + Замша";
  if (hasLeather) return "Кожа";
  if (hasSuede) return "Замша";
  return null;
}

/* ─── Цвета ─── */

/** Множественное число базового цвета: «Чёрный» → «чёрные» */
function pluralizeColor(color: string): string {
  return color
    .replace(/ый$/, "ые")
    .replace(/ой$/, "ые")
    .toLowerCase();
}

/** Транслитерация цвета для слага: «чёрные» → chernye */
function translitColor(plural: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
    и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh",
    щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return plural
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("");
}

/* ─── Сборка страниц ─── */

function buildMaterialPage(
  category: string,
  material: MaterialName,
  products: Product[],
): VariantPage {
  const meta = MATERIALS[material];
  const cat = seoConfig.categories[category];
  const name = cat.variantName;

  return {
    kind: "material",
    category,
    variant: meta.slug,
    path: `/catalog/${category}/${meta.slug}`,
    h1: `${name} из ${meta.genitive}`,
    title: applyTemplate(seoConfig.variants.materialTitleTemplate, {
      name,
      material: meta.genitive,
    }),
    description: applyTemplate(seoConfig.variants.materialDescriptionTemplate, {
      name,
      material: meta.genitive,
    }),
    breadcrumb: `${cat.name} из ${meta.breadcrumb}`,
    material,
    products,
  };
}

function buildColorPage(
  category: string,
  color: string,
  products: Product[],
): VariantPage {
  const plural = pluralizeColor(color);
  const cat = seoConfig.categories[category];
  const name = cat.variantName;

  return {
    kind: "color",
    category,
    variant: translitColor(plural),
    path: `/catalog/${category}/${translitColor(plural)}`,
    h1: `${name} ${plural}`,
    title: applyTemplate(seoConfig.variants.colorTitleTemplate, {
      name,
      color: plural,
    }),
    description: applyTemplate(seoConfig.variants.colorDescriptionTemplate, {
      name,
      color: plural,
    }),
    breadcrumb: `${cat.name} · ${plural}`,
    color,
    products,
  };
}

function buildGlobalPage(slug: string, products: Product[]): VariantPage {
  const meta = seoConfig.variants.global[slug];
  return {
    kind: "material",
    category: null,
    variant: slug,
    path: `/catalog/${slug}`,
    h1: meta.h1,
    title: meta.title,
    description: meta.description,
    breadcrumb: meta.h1,
    products,
  };
}

/** Прогнать товары через фильтры категории/цвета/материала (логика каталога) */
function filterProducts(
  products: Product[],
  opts: { category?: string | null; color?: string; material?: string },
): Product[] {
  return products.filter((p) => {
    if (opts.category && p.category !== opts.category) return false;
    if (opts.color && getBasicColorName(p.colorName) !== opts.color) return false;
    if (opts.material && normalizeMaterial(p.composition) !== opts.material)
      return false;
    return true;
  });
}

/** Alt-текст изображения товара: название + цвет («Сумка-тоут из замши, коричневая») */
export function buildProductAlt(p: {
  name: string;
  colorName?: string | null;
}): string {
  const color = getBasicColorName(p.colorName);
  return color ? `${p.name}, ${color.toLowerCase()}` : p.name;
}

/** Все лендинги: категория×материал, категория×цвет (≥2 товаров), глобальные */
export function buildVariantPages(products: Product[]): VariantPage[] {
  const pages: VariantPage[] = [];

  // Глобальные страницы материалов: /catalog/iz-zamshi, iz-naturalnoj-kozhi, iz-italyanskoj-kozhi
  for (const slug of Object.keys(seoConfig.variants.global)) {
    let items: Product[];
    if (slug === "iz-italyanskoj-kozhi") {
      // Брендовый USP-лендинг: весь ассортимент (вся кожа — итальянская)
      items = products;
    } else {
      const material = slug === "iz-zamshi" ? "Замша" : "Кожа";
      items = filterProducts(products, { material });
    }
    if (items.length >= 2) {
      pages.push(buildGlobalPage(slug, items));
    }
  }

  // Категория × материал и категория × цвет — только комбинации с ≥2 товарами
  for (const category of Object.keys(seoConfig.categories)) {
    const catProducts = products.filter((p) => p.category === category);

    const byMaterial = new Map<MaterialName, Product[]>();
    for (const p of catProducts) {
      const m = normalizeMaterial(p.composition);
      if (m) byMaterial.set(m, [...(byMaterial.get(m) ?? []), p]);
    }
    for (const [material, items] of byMaterial) {
      if (items.length >= 2) pages.push(buildMaterialPage(category, material, items));
    }

    const byColor = new Map<string, Product[]>();
    for (const p of catProducts) {
      const c = getBasicColorName(p.colorName);
      if (c) byColor.set(c, [...(byColor.get(c) ?? []), p]);
    }
    for (const [color, items] of byColor) {
      if (items.length >= 2) pages.push(buildColorPage(category, color, items));
    }
  }

  return pages;
}

/** Лендинг категория×вариант (/catalog/tote/iz-zamshi) */
export function getVariantPage(
  category: string,
  variant: string,
  products: Product[],
): VariantPage | null {
  return (
    buildVariantPages(products).find(
      (p) => p.category === category && p.variant === variant,
    ) ?? null
  );
}

/** Глобальный лендинг (/catalog/iz-zamshi) */
export function getGlobalVariantPage(
  slug: string,
  products: Product[],
): VariantPage | null {
  return (
    buildVariantPages(products).find((p) => p.category === null && p.variant === slug) ??
    null
  );
}