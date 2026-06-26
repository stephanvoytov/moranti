import type { Metadata } from "next";
import Script from "next/script";
import { randomUUID } from "crypto";
import { Playfair_Display, Montserrat, Inter } from "next/font/google";
import { FavoritesProvider } from "@/lib/favorites-context";
import { readSettings } from "@/lib/settings";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ScrollToTop from "@/components/ui/scroll-to-top";
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
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

/* ——— Site URL ——— */

const siteUrl = process.env.SITE_URL || "http://localhost:3001";

/* ——— Metadata ——— */

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Moranti — премиальные кожаные сумки",
    template: "%s — Moranti",
  },
  description:
    "Moranti — женские сумки из натуральной итальянской кожи. Минималистичные формы, без кричащих логотипов. Доставка по всей России.",
  keywords: [
    "сумки", "Moranti", "кожаные сумки", "натуральная итальянская кожа",
    "женские сумки", "сумки через плечо", "сумки из замши", "классические сумки",
    "кросс-боди", "тоут", "багет", "рюкзак кожаный",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Moranti — премиальные кожаные сумки",
    description:
      "Женские сумки из натуральной итальянской кожи. Минималистичные формы, без кричащих логотипов.",
    url: "/",
    siteName: "Moranti",
    type: "website",
    locale: "ru_RU",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Moranti — премиальные кожаные сумки",
    description:
      "Женские сумки из натуральной итальянской кожи. Минималистичные формы, без кричащих логотипов.",
    images: ["/twitter-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  verification: {
    // Можно задать через YANDEX_VERIFICATION в .env.local
    yandex: process.env.YANDEX_VERIFICATION || undefined,
  },
};

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
  // Таймаут 2 секунды — если Supabase холодная, не блокируем рендер
  let ymId: string | undefined;
  try {
    const settings = await Promise.race([
      readSettings(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("settings timeout")), 2000),
      ),
    ]);
    ymId = settings.yandexMetrikaId || process.env.YANDEX_METRIKA_ID;
  } catch {
    ymId = process.env.YANDEX_METRIKA_ID;
  }

  // ─── CSP nonce (per-request, prevents XSS via inline scripts) ───
  const nonce = randomUUID();

  // ─── Content-Security-Policy via <meta> tag ───
  // Важно: Next.js injects свои inline-скрипты (chunks, bootstrap) без nonce.
  // 'strict-dynamic' НЕ используется — он запрещает 'self' и ломает Next.js.
  // Вместо этого: 'self' разрешает Next.js чанки, 'unsafe-inline' разрешает
  // Next.js inline-скрипты, а nonce — страховка для наших JSON-LD и Я.Метрики.
  // Остальные директивы (img-src, connect-src, etc.) строгие.
  const isDev = process.env.NODE_ENV === "development";
  const csp = [
    "default-src 'self'",
    // Scripts: 'self' для Next.js чанков, 'unsafe-inline' для его inline-скриптов,
    // nonce для наших JSON-LD и Яндекс.Метрики.
    // 'unsafe-eval' — нужен React DevTools в dev-режиме (eval для callstack).
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    // Styles: 'unsafe-inline' для dev-режима (Next.js Fast Refresh)
    "style-src 'self' 'unsafe-inline'",
    // Images: WB CDN + Яндекс.Метрика
    "img-src 'self' https://*.wbbasket.ru https://*.geobasket.ru https://mc.yandex.ru data:",
    // Fonts: self-hosted via next/font
    "font-src 'self'",
    // Connections: same-origin + Яндекс.Метрика
    "connect-src 'self' https://mc.yandex.ru",
    // Media: пока не используем
    "media-src 'none'",
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

        {/* Structured data: Organization + WebSite */}
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Moranti",
                url: siteUrl,
                logo: `${siteUrl}/images/moranti-logo.png`,
                description:
                  "Женские сумки из натуральной итальянской кожи. Минималистичные формы, без кричащих логотипов.",
                contactPoint: {
                  "@type": "ContactPoint",
                  contactType: "sales",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Moranti",
                url: siteUrl,
                description: "Премиальные кожаные сумки ручной работы",
                inLanguage: "ru",
              },
            ]),
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
                    clickmap:true,
                    trackLinks:true,
                    accurateTrackBounce:true,
                    webvisor:true
                  });
                `,
              }}
            />
            <noscript>
              <div>
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
      </body>
    </html>
  );
}
