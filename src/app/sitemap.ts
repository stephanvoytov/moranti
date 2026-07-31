import type { MetadataRoute } from "next";
import { getAllProducts } from "@/data/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.SITE_URL || "http://localhost:3001";
  const products = await getAllProducts();

  // Product detail pages — используем реальную дату обновления из БД
  const productUrls = products.map((p) => ({
    url: `${siteUrl}/catalog/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Категории каталога (фильтры с query-параметром)
  const categoryUrls: MetadataRoute.Sitemap = [
    "crossbody",
    "na-plecho",
    "baguette",
    "tote",
    "saddle",
    "backpack",
  ].map((cat) => ({
    url: `${siteUrl}/catalog?category=${cat}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

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
    ...categoryUrls,
    ...productUrls,
  ];
}
