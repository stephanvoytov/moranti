import type { Metadata } from "next";
import Script from "next/script";
import { randomUUID } from "crypto";
import { Playfair_Display, Montserrat, Inter } from "next/font/google";
import { FavoritesProvider } from "@/lib/favorites-context";
import { readSettings } from "@/lib/settings";
import type { SiteSettings } from "@/lib/settings";
import { seoConfig } from "@/config/seo";
import { buildGlobalJsonLd } from "@/lib/seo-jsonld";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ScrollToTop from "@/components/ui/scroll-to-top";
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
  weight: ["400", "500", "600", "700", "800"],
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

/** Настройки с таймаутом 2с — если БД не отвечает, не блокируем рендер */
async function readSettingsSafe(): Promise<SiteSettings | null> {
  try {
    return await Promise.race([
      readSettings(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("settings timeout")), 2000),
      ),
    ]);
  } catch {
    return null;
  }
}

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
      icon: [{ url: "/favicon.ico", sizes: "any" }],
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
  // Yandex Metrika ID: из админки или .env.local
  // Таймаут 2 секунды — если БД не отвечает, не блокируем рендер
  const settings = await readSettingsSafe();
  const ymId = settings?.yandexMetrikaId || process.env.YANDEX_METRIKA_ID;

  // ─── CSP nonce (per-request, prevents XSS via inline scripts) ───
  const nonce = randomUUID();

    // ─── Content-Security-Policy via <meta> tag ───
    // Важно: Next.js injects свои inline-скрипты (chunks, bootstrap) без nonce.
    // 'strict-dynamic' НЕ используется — он запрещает 'self' и ломает Next.js.
    // Вместо этого: 'self' разрешает Next.js чанки, 'unsafe-inline' разрешает
    // Next.js inline-скрипты, а nonce — страховка для наших JSON-LD и инлайн-сниппета
    // Я.Метрики. Сам tag.js Метрика загружает динамически (createElement без nonce),
    // поэтому нужен явный https://mc.yandex.ru в script-src.
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
      `script-src 'self' 'unsafe-inline' https://mc.yandex.ru${isDev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ""}${vercelLive}`,
    // Styles: 'unsafe-inline' для dev-режима (Next.js Fast Refresh)
    "style-src 'self' 'unsafe-inline'",
    // Images: WB CDN + Яндекс.Метрика + фавиконки маркетплейсов + Vercel Blob (загрузки из админки)
    "img-src 'self' https://*.wbbasket.ru https://*.geobasket.ru https://*.ozone.ru https://www.wildberries.ru https://www.ozon.ru https://mc.yandex.ru https://*.public.blob.vercel-storage.com data:",
    // Fonts: self-hosted via next/font
    "font-src 'self'",
    // Connections: same-origin + Яндекс.Метрика + Vercel Analytics
    // (beacon Web Vitals) (+ vercel.live для Live Feedback в превью)
    // https://*.wbbasket.ru — hls.js тянет m3u8-плейлист и сегменты через fetch.
    `connect-src 'self' https://mc.yandex.ru https://vitals.vercel-insights.com https://*.wbbasket.ru${vercelLive}`,
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
        {/* Yandex Metrika */}
        {ymId && (
          <>
            <Script
              id="yandex-metrika"
              strategy="afterInteractive"
              nonce={nonce}
              dangerouslySetInnerHTML={{
                __html: `
                  (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                  m[i].l=1*new Date();
                  for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
                  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
                  (window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
                  ym(${ymId},"init",{
                    ssr:true,
                    webvisor:true,
                    clickmap:true,
                    ecommerce:"dataLayer",
                    referrer: document.referrer,
                    url: location.href,
                    accurateTrackBounce:true,
                    trackLinks:true
                  });
                `,
              }}
            />
            <noscript>
              <div>
                {/* Яндекс.Метрика noscript-пиксель — стандартный сниппет, next/image неприменим */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://mc.yandex.ru/watch/${ymId}`}
                  style={{ position: "absolute", left: "-9999px" }}
                  alt=""
                />
              </div>
            </noscript>
          </>
        )}

        <FavoritesProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <ScrollToTop />
        </FavoritesProvider>

        {/* Vercel Analytics — Web Vitals + page views (first-party, ~2KB) */}
        <Analytics />
      </body>
    </html>
  );
}
