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
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      // Обучающие AI-краулеры: трафика не дают, жрут ресурсы — блокируем.
      // Поисковые AI-боты (OAI-SearchBot, Claude-SearchBot, GoogleOther)
      // оставлены разрешёнными — они приводят трафик из AI-поиска.
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        disallow: "/",
      },
      {
        userAgent: "ClaudeBot",
        disallow: "/",
      },
      {
        userAgent: "anthropic-ai",
        disallow: "/",
      },
      {
        userAgent: "Google-Extended",
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
      {
        userAgent: "meta-externalagent",
        disallow: "/",
      },
      {
        userAgent: "Applebot-Extended",
        disallow: "/",
      },
      {
        userAgent: "Bytespider",
        disallow: "/",
      },
      {
        userAgent: "cohere-ai",
        disallow: "/",
      },
      {
        userAgent: "Amazonbot",
        disallow: "/",
      },
      {
        userAgent: "Diffbot",
        disallow: "/",
      },
      {
        userAgent: "ImagesiftBot",
        disallow: "/",
      },
      {
        userAgent: "YouBot",
        disallow: "/",
      },
      {
        userAgent: "FacebookBot",
        disallow: "/",
      },
      {
        userAgent: "AI2Bot",
        disallow: "/",
      },
      {
        userAgent: "Scrapy",
        disallow: "/",
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
