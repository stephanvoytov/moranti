import type { MetadataRoute } from "next";
import { getProducts } from "@/data/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.SITE_URL || "http://localhost:3001";
  const products = await getProducts();
  const now = new Date();

  // Product detail pages
  const productUrls = products.map((p) => ({
    url: `${siteUrl}/catalog/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/catalog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/favorites`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...productUrls,
  ];
}
