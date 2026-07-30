import type { Metadata } from "next";
import { getProducts, getCategories } from "@/data/products";
import { readSettings } from "@/lib/settings";
import CatalogPage from "./catalog-content";

export const revalidate = 0;

const CATEGORY_META: Record<string, { name: string; desc: string }> = {
  crossbody: {
    name: "Кросс-боди",
    desc: "Женские сумки кросс-боди из натуральной кожи. Через плечо — удобно и стильно.",
  },
  "na-plecho": {
    name: "На плечо",
    desc: "Сумки на плечо из натуральной кожи. Классические модели на каждый день.",
  },
  baguette: {
    name: "Багет",
    desc: "Сумки-багет из натуральной кожи и замши. Компактные модели для города.",
  },
  tote: {
    name: "Тоут",
    desc: "Шоперы и тоуты из натуральной кожи. Вместительные сумки для работы и шопинга.",
  },
  saddle: {
    name: "Седло",
    desc: "Сумки-седло из натуральной кожи. Оригинальные модели в стиле casual.",
  },
  backpack: {
    name: "Рюкзаки",
    desc: "Кожаные рюкзаки из натуральной кожи. Удобные и стильные рюкзаки для города.",
  },
};

interface Props {
  searchParams: Promise<{ category?: string; sort?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const catSlug = params.category;

  if (catSlug && CATEGORY_META[catSlug]) {
    const cat = CATEGORY_META[catSlug];
    return {
      title: `${cat.name} из натуральной кожи — каталог | Moranti`,
      description: cat.desc,
      alternates: { canonical: `/catalog?category=${catSlug}` },
      openGraph: {
        title: `${cat.name} Moranti — натуральная кожа`,
        description: cat.desc,
        url: `/catalog?category=${catSlug}`,
        siteName: "Moranti",
        type: "website",
        locale: "ru_RU",
      },
    };
  }

  return {
    title: "Каталог кожаных сумок",
    description:
      "Каталог женских сумок Moranti из натуральной кожи. Модели: crossbody, na-plecho, baguette, tote, saddle, backpack. Более 50 моделей.",
    alternates: { canonical: "/catalog" },
    openGraph: {
      title: "Каталог сумок Moranti — натуральная кожа",
      description:
        "Модели: crossbody, na-plecho, baguette, tote, saddle, backpack. Более 50 моделей.",
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
