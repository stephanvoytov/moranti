import { seoConfig, buildProductSeoMeta } from "@/config/seo";
import { getProducts } from "@/data/products";
import {
  buildProductJsonLd,
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
} from "@/lib/seo-jsonld";
import SeoPreview from "@/components/admin/seo-preview";

/** Запись для превью: что Google покажет для URL + микроразметка */
export interface SeoEntry {
  id: string;
  group: "pages" | "categories" | "products";
  path: string;
  title: string;
  description: string;
  noindex: boolean;
  /** Сегменты breadcrumb в URL-строке: ["Каталог", "Кросс-боди"] */
  siteSegments: string[];
  /** Канонический URL (относительный путь) */
  canonical: string;
  /** JSON-LD, который реально отдаёт страница */
  jsonLd: Record<string, unknown>[];
  /** OpenGraph-значения (могут отличаться от title/description) */
  og?: { title: string; description: string };
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
      canonical: "/",
      jsonLd: [],
    },
    {
      id: "catalog",
      group: "pages",
      path: "/catalog",
      title: catalog.title,
      description: catalog.description,
      noindex: false,
      siteSegments: ["Каталог"],
      canonical: "/catalog",
      jsonLd: [
        buildCollectionPageJsonLd(
          "Каталог кожаных сумок Moranti",
          "Женские сумки из натуральной итальянской кожи. Кросс-боди, тоуты, багеты, рюкзаки.",
          "/catalog",
          products.length,
        ),
      ],
    },
    {
      id: "care",
      group: "pages",
      path: "/care",
      title: pages.care.title,
      description: pages.care.description,
      noindex: false,
      siteSegments: ["Уход за сумками"],
      canonical: "/care",
      jsonLd: [],
    },
    {
      id: "delivery",
      group: "pages",
      path: "/delivery",
      title: pages.delivery.title,
      description: pages.delivery.description,
      noindex: false,
      siteSegments: ["Доставка"],
      canonical: "/delivery",
      jsonLd: [],
    },
    {
      id: "favorites",
      group: "pages",
      path: "/favorites",
      title: pages.favorites.title,
      description: pages.favorites.description,
      noindex: true,
      siteSegments: [],
      canonical: "/favorites",
      jsonLd: [],
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
      canonical: `/catalog?category=${slug}`,
      jsonLd: [
        buildCollectionPageJsonLd(
          cat.title.replace(" — Moranti", ""),
          `${cat.description} Доставка по России.`,
          `/catalog?category=${slug}`,
          count,
        ),
      ],
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
      canonical: `/catalog/${p.slug}`,
      jsonLd: [
        buildProductJsonLd(p, siteUrl),
        buildBreadcrumbJsonLd(
          [
            { name: "Главная", path: "/" },
            { name: "Каталог", path: "/catalog" },
            { name: p.name, path: `/catalog/${p.slug}` },
          ],
          siteUrl,
        ),
      ],
      og: { title: meta.ogTitle, description: meta.description },
    });
  }

  // Глобальная микроразметка из layout.tsx — присутствует на каждой странице
  const globalJsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Moranti",
      url: siteUrl,
      logo: `${siteUrl}/images/moranti-logo.png`,
      description:
        "Женские сумки из натуральной итальянской кожи. Минималистичные формы, без кричащих логотипов.",
      contactPoint: { "@type": "ContactPoint", contactType: "sales" },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Moranti",
      url: siteUrl,
      description: "Премиальные кожаные сумки ручной работы",
      inLanguage: "ru",
    },
  ];

  return (
    <SeoPreview
      entries={entries}
      domain={domain}
      siteName={site.siteName}
      faviconUrl={`${siteUrl}/favicon.ico`}
      globalJsonLd={globalJsonLd}
    />
  );
}