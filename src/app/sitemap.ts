import type { MetadataRoute } from "next";
import { getProducts } from "@/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.SITE_URL || "http://localhost:3001";
  const products = getProducts();
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
      url: `${siteUrl}/favorites`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...productUrls,
  ];
}
