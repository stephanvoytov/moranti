import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.SITE_URL || "http://localhost:3001";
  const isProd = process.env.APP_ENV === "production";

  // Dev/preview окружение — запрещаем индексацию, чтобы Google не задублировал
  // контент с prod (dev и prod делят одну БД и один код).
  if (!isProd) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
