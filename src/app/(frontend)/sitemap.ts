import type { MetadataRoute } from "next";
import { getAllProducts, getProducts } from "@/data/products";
import { seoConfig } from "@/config/seo";
import { buildVariantPages } from "@/lib/variant-pages";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Dev/preview окружение — sitemap пустой (см. robots.ts: noindex)
  if (process.env.APP_ENV !== "production") return [];

  const siteUrl = process.env.SITE_URL || "http://localhost:3001";
  const products = await getAllProducts();

  // Product detail pages — используем реальную дату обновления из БД
  const productUrls = products.map((p) => ({
    url: `${siteUrl}/catalog/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Категории каталога — чистые URL /catalog/:slug
  const categoryUrls: MetadataRoute.Sitemap = Object.keys(seoConfig.categories).map(
    (cat) => ({
      url: `${siteUrl}/catalog/${cat}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }),
  );

  // Лендинги категория×цвет/материал + глобальные страницы материалов —
  // строятся из актуальных товаров (комбинации с ≥2 товарами)
  const inStockProducts = await getProducts();
  const variantUrls: MetadataRoute.Sitemap = buildVariantPages(inStockProducts).map(
    (page) => ({
      url: `${siteUrl}${page.path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }),
  );

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/care`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/delivery`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/contacts`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...categoryUrls,
    ...variantUrls,
    ...productUrls,
  ];
}
