import { seoConfig, buildProductSeoMeta } from "@/config/seo";
import { getProducts } from "@/data/products";
import SeoPreview from "@/components/admin/seo-preview";

/** Запись для превью: что Google покажет для URL */
export interface SeoEntry {
  id: string;
  group: "pages" | "categories" | "products";
  path: string;
  title: string;
  description: string;
  noindex: boolean;
  /** Сегменты breadcrumb в URL-строке: ["Каталог", "Кросс-боди"] */
  siteSegments: string[];
}

export default async function SeoAdminPage() {
  const siteUrl = process.env.SITE_URL || "http://localhost:3001";
  const domain = siteUrl.replace(/^https?:\/\//, "");
  const products = await getProducts();
  const { site, pages, categories, catalog } = seoConfig;

  const entries: SeoEntry[] = [];

  // ─── Страницы ───
  entries.push(
    {
      id: "home",
      group: "pages",
      path: "/",
      title: site.defaultTitle,
      description: site.defaultDescription,
      noindex: false,
      siteSegments: [],
    },
    {
      id: "catalog",
      group: "pages",
      path: "/catalog",
      title: catalog.title,
      description: catalog.description,
      noindex: false,
      siteSegments: ["Каталог"],
    },
    {
      id: "care",
      group: "pages",
      path: "/care",
      title: pages.care.title,
      description: pages.care.description,
      noindex: false,
      siteSegments: ["Уход за сумками"],
    },
    {
      id: "delivery",
      group: "pages",
      path: "/delivery",
      title: pages.delivery.title,
      description: pages.delivery.description,
      noindex: false,
      siteSegments: ["Доставка"],
    },
    {
      id: "favorites",
      group: "pages",
      path: "/favorites",
      title: pages.favorites.title,
      description: pages.favorites.description,
      noindex: true,
      siteSegments: [],
    },
  );

  // ─── Категории ───
  for (const [slug, cat] of Object.entries(categories)) {
    const count = products.filter((p) => p.category === slug).length;
    entries.push({
      id: `cat-${slug}`,
      group: "categories",
      path: `/catalog?category=${slug}`,
      title: cat.title,
      // Без счётчика: «12 моделей» кешируется Google и устаревает
      description: `${cat.description} Доставка по России.`,
      // Пустая категория закрыта от индексации (см. generateMetadata каталога)
      noindex: count === 0,
      siteSegments: ["Каталог", cat.name],
    });
  }

  // ─── Товары (примеры: первые 3 с уникальными названиями) ───
  const seen = new Set<string>();
  const samples: typeof products = [];
  for (const p of products) {
    if (seen.has(p.name)) continue;
    seen.add(p.name);
    samples.push(p);
    if (samples.length >= 3) break;
  }
  for (const p of samples) {
    const meta = buildProductSeoMeta(p);
    entries.push({
      id: `prod-${p.slug}`,
      group: "products",
      path: `/catalog/${p.slug}`,
      title: meta.title,
      description: meta.description,
      noindex: false,
      siteSegments: ["Каталог", p.name],
    });
  }

  return (
    <SeoPreview
      entries={entries}
      domain={domain}
      siteName={site.siteName}
      faviconUrl={`${siteUrl}/favicon.ico`}
    />
  );
}
