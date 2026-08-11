import type { Metadata } from "next";
import { randomUUID } from "crypto";
import { Playfair_Display, Montserrat, Inter } from "next/font/google";
import { FavoritesProvider } from "@/lib/favorites-context";
import { seoConfig } from "@/config/seo";
import { YANDEX_METRIKA_ID } from "@/config/analytics";
import { buildGlobalJsonLd } from "@/lib/seo-jsonld";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ScrollToTop from "@/components/ui/scroll-to-top";
import { YandexMetricaProvider } from "@artginzburg/next-ym";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

/* ——— Google Fonts (next/font — self-hosted, optimized) ——— */

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

/* ——— Site URL ——— */

const siteUrl = process.env.SITE_URL || "http://localhost:3001";

/* ——— Metadata ——— */

export async function generateMetadata(): Promise<Metadata> {
  const { site } = seoConfig;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: site.defaultTitle,
      template: site.titleTemplate,
    },
    description: site.defaultDescription,
    keywords: site.keywords,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: site.defaultTitle,
      description: site.defaultDescription,
      url: "/",
      siteName: site.siteName,
      type: "website",
      locale: site.locale,
      images: [{ url: site.ogImage, width: 1200, height: 630, alt: site.ogImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: site.defaultTitle,
      description: site.defaultDescription,
      images: [site.twitterImage],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/manifest.json",
    verification: {
      // Можно задать через YANDEX_VERIFICATION в .env.local
      yandex: process.env.YANDEX_VERIFICATION || undefined,
      google: process.env.GOOGLE_SITE_VERIFICATION || "_EUyD3GosfZHJoRCZvoCME7CJt7eCxUr7lgT-lXQVLM",
    },
  };
}

export const viewport = {
  themeColor: "#2C2420",
};

/* ——— Root Layout ——— */

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ID Яндекс.Метрики — константа в src/config/analytics.ts (без env и админки)

  // ─── CSP nonce (per-request, prevents XSS via inline scripts) ───
  const nonce = randomUUID();

    // ─── Content-Security-Policy via <meta> tag ───
    // Важно: Next.js injects свои inline-скрипты (chunks, bootstrap) без nonce.
    // 'strict-dynamic' НЕ используется — он запрещает 'self' и ломает Next.js.
    // Вместо этого: 'self' разрешает Next.js чанки, 'unsafe-inline' разрешает
    // Next.js inline-скрипты, а nonce — страховка для наших JSON-LD.
// Метрика подключается пакетом @artginzburg/next-ym через next/script:
      // сниппет-инициализатор (inline) + tag.js (https://mc.yandex.ru) —
      // поэтому нужен явный https://mc.yandex.ru в script-src. tag.js также
      // ходит на mc.yandex.com (watch, callback, advert.gif, sync_cookie) —
      // без него Метрика падает в консоль с CSP-ошибками и не работает.
      // Остальные директивы (img-src, connect-src, etc.) строгие.
    const isDev = process.env.NODE_ENV === "development";
    // Vercel инжектит виджет Live Feedback (vercel.live/_next-live/feedback/feedback.js)
    // только в preview-деплои. В проде скрипта нет — домен не добавляем.
    const isVercelPreview = process.env.VERCEL_ENV === "preview";
    const vercelLive = isVercelPreview ? " https://vercel.live" : "";
    const csp = [
      "default-src 'self'",
      // Scripts: 'self' для Next.js чанков, 'unsafe-inline' для его inline-скриптов,
      // nonce для наших JSON-LD и инлайн-сниппета Я.Метрики, https://mc.yandex.ru —
      // для tag.js (Метрика вставляет его динамически, без nonce).
      // 'unsafe-eval' — нужен React DevTools в dev-режиме (eval для callstack).
      // va.vercel-scripts.com — только в dev (debug-скрипт Vercel Analytics;
      // в проде скрипт first-party, same-origin).
      `script-src 'self' 'unsafe-inline' https://mc.yandex.ru https://mc.yandex.com${isDev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ""}${vercelLive}`,
    // Styles: 'unsafe-inline' для dev-режима (Next.js Fast Refresh)
    "style-src 'self' 'unsafe-inline'",
    // Images: WB CDN + Яндекс.Метрика + фавиконки маркетплейсов + Vercel Blob (загрузки из админки)
    "img-src 'self' https://*.wbbasket.ru https://*.geobasket.ru https://*.ozone.ru https://www.wildberries.ru https://www.ozon.ru https://mc.yandex.ru https://mc.yandex.com https://*.public.blob.vercel-storage.com data:",
    // Fonts: self-hosted via next/font
    "font-src 'self'",
    // Connections: same-origin + Яндекс.Метрика + Vercel Analytics
    // (beacon Web Vitals) (+ vercel.live для Live Feedback в превью)
    // wss://mc.yandex.ru — WebSocket Метрики (вебвизор/реальное время);
    // без него tag.js падает в консоль с CSP-ошибкой.
    // https://*.wbbasket.ru — hls.js тянет m3u8-плейлист и сегменты через fetch.
    `connect-src 'self' https://mc.yandex.ru wss://mc.yandex.ru https://mc.yandex.com https://vitals.vercel-insights.com https://*.wbbasket.ru${vercelLive}`,
    // Media: HLS-видео WB (wbbasket) + blob: (hls.js играет через MSE/blob URL)
    "media-src 'self' blob: https://*.wbbasket.ru",
    // Frame: block all
    "frame-src 'none'",
    // Objects: block plugins (Flash, PDF viewers)
    "object-src 'none'",
    // Base: restrict <base> to same origin
    "base-uri 'self'",
    // Forms: only submit to same origin
    "form-action 'self'",
  ].join("; ");

  return (
    <html
      lang="ru"
      className={`${playfair.variable} ${montserrat.variable} ${inter.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        {/* Content-Security-Policy (nonce + инструкции) */}
        <meta httpEquiv="Content-Security-Policy" content={csp} />

        {/* Preconnect for external services */}
        <link rel="preconnect" href="https://mc.yandex.ru" />
        <link rel="preconnect" href="https://kgd-basket-cdn-01bl.geobasket.ru" />
        <link rel="dns-prefetch" href="https://mc.yandex.ru" />
        <link rel="dns-prefetch" href="https://kgd-basket-cdn-01bl.geobasket.ru" />

        {/* Favicon for legacy browsers */}
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Structured data: Organization + WebSite (единый источник — seo-jsonld.ts) */}
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildGlobalJsonLd(siteUrl)),
          }}
        />
      </head>
      <body>
        {/* Яндекс.Метрика — @artginzburg/next-ym (next/script), обезличенный счётчик,
            без вебвизора и карты кликов (законный интерес, ФЗ-152).
            ID — константа YANDEX_METRIKA_ID; init-параметры без ssr (с ним tag.js
            не отправляет хиты). Авто-SPA-хиты и noscript-пиксель — из коробки. */}
        <YandexMetricaProvider
          tagID={YANDEX_METRIKA_ID}
          initParameters={{ trackLinks: true, accurateTrackBounce: true, ecommerce: "dataLayer" }}
        >
          <FavoritesProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <ScrollToTop />
          </FavoritesProvider>
        </YandexMetricaProvider>

        {/* Vercel Analytics — Web Vitals + page views (first-party, ~2KB) */}
        <Analytics />
      </body>
    </html>
  );
}
