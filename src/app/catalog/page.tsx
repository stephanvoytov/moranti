import type { Metadata } from "next";
import { getProducts, getCategories } from "@/data/products";
import { readSettings } from "@/lib/settings";
import CatalogPage from "./catalog-content";

export const revalidate = 0;

const CATEGORY_META: Record<string, { name: string; title: string; desc: string }> = {
  crossbody: {
    name: "Кросс-боди",
    title: "Сумки кросс-боди из натуральной кожи — купить | Moranti",
    desc: "Женские сумки кросс-боди из натуральной кожи и замши. Через плечо — удобно и стильно.",
  },
  "na-plecho": {
    name: "На плечо",
    title: "Сумки на плечо из натуральной кожи — купить | Moranti",
    desc: "Классические сумки на плечо из натуральной кожи. Повседневные модели, которые сочетаются с любым гардеробом.",
  },
  baguette: {
    name: "Багет",
    title: "Сумки-багет из натуральной кожи и замши — купить | Moranti",
    desc: "Компактные сумки-багет из натуральной кожи и замши. Городские модели с ремешком через плечо.",
  },
  tote: {
    name: "Тоут",
    title: "Сумки-тоуты из натуральной кожи — купить | Moranti",
    desc: "Шоперы и тоуты из натуральной кожи и замши. Вместительные сумки для работы, учёбы и шопинга.",
  },
  saddle: {
    name: "Седло",
    title: "Сумки-седло из натуральной кожи — купить | Moranti",
    desc: "Оригинальные сумки-седло из натуральной кожи. Модели в стиле casual с характерным изгибом.",
  },
  backpack: {
    name: "Рюкзаки",
    title: "Кожаные рюкзаки — купить | Moranti",
    desc: "Рюкзаки из натуральной кожи: компактные городские и вместительные. Удобно носить каждый день.",
  },
};

/** Русская плюрализация: 1 модель, 2 модели, 5 моделей */
function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

interface Props {
  searchParams: Promise<{ category?: string; sort?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const catSlug = params.category;
  const products = await getProducts();

  if (catSlug && CATEGORY_META[catSlug]) {
    const cat = CATEGORY_META[catSlug];
    const count = products.filter((p) => p.category === catSlug).length;
    const desc = `${cat.desc} ${count} ${plural(count, "модель", "модели", "моделей")}. Доставка по России.`;
    return {
      title: { absolute: cat.title },
      description: desc,
      alternates: { canonical: `/catalog?category=${catSlug}` },
      openGraph: {
        title: cat.title.replace(" — купить | Moranti", " — Moranti"),
        description: desc,
        url: `/catalog?category=${catSlug}`,
        siteName: "Moranti",
        type: "website",
        locale: "ru_RU",
      },
    };
  }

  const minPrice = products.length
    ? Math.min(...products.map((p) => p.price))
    : 0;
  const catalogDesc = `Каталог ${products.length} кожаных сумок Moranti: кросс-боди, тоуты, багеты, седла, рюкзаки из натуральной кожи и замши. От ${minPrice.toLocaleString("ru-RU")} ₽. Доставка по России.`;

  return {
    title: { absolute: "Каталог кожаных сумок — купить | Moranti" },
    description: catalogDesc,
    alternates: { canonical: "/catalog" },
    openGraph: {
      title: "Каталог кожаных сумок — Moranti",
      description: catalogDesc,
      url: "/catalog",
      siteName: "Moranti",
      type: "website",
      locale: "ru_RU",
    },
  };
}

export default async function CatalogPageWrapper() {
  const [products, categories, settings] = await Promise.all([
    getProducts(),
    getCategories(),
    readSettings(),
  ]);

  return (
    <>
      {/* CollectionPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Каталог кожаных сумок Moranti",
            description:
              "Женские сумки из натуральной итальянской кожи. Кросс-боди, тоуты, багеты, рюкзаки.",
            url: "/catalog",
            numberOfItems: products.length,
          }),
        }}
      />
      <CatalogPage
        initialProducts={products}
        initialCategories={categories}
        initialCatalogOrder={settings.catalogOrder ?? []}
      />
    </>
  );
}
