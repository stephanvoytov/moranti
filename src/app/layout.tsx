import type { Metadata } from "next";
import Script from "next/script";
import { Playfair_Display, Montserrat, Inter } from "next/font/google";
import { FavoritesProvider } from "@/lib/favorites-context";
import { readSettings } from "@/lib/settings";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import "./globals.css";

/* ——— Google Fonts (next/font — self-hosted, optimized) ——— */

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400"],
});

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500"],
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
    default: "Moranti — сумки из натуральной итальянской кожи",
    template: "%s — Moranti",
  },
  description:
    "Moranti — женские сумки из натуральной итальянской кожи. Минималистичные формы, ручная работа, никаких кричащих логотипов.",
  keywords: [
    "сумки",
    "Moranti",
    "итальянские сумки",
    "натуральная итальянская кожа",
    "женские сумки",
    "кожаные сумки",
    "сумки через плечо",
    "сумки из замши",
    "классические сумки",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Moranti — сумки из натуральной итальянской кожи",
    description:
      "Женские сумки из натуральной итальянской кожи. Минималистичные формы, ручная работа.",
    url: "/",
    siteName: "Moranti",
    type: "website",
    locale: "ru_RU",
  },
};

/* ——— Yandex Metrika ID ——— */

// Из админки (settings.json) или .env.local
let ymId: string | undefined;
try {
  const settings = readSettings();
  ymId = settings.yandexMetrikaId || process.env.YANDEX_METRIKA_ID;
} catch {
  ymId = process.env.YANDEX_METRIKA_ID;
}

/* ——— Root Layout ——— */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${playfair.variable} ${montserrat.variable} ${inter.variable}`}
    >
      <head>
        {/* Preconnect for external services */}
        <link rel="preconnect" href="https://mc.yandex.ru" />
        <link rel="preconnect" href="https://kgd-basket-cdn-01bl.geobasket.ru" />
        <link rel="dns-prefetch" href="https://mc.yandex.ru" />
        <link rel="dns-prefetch" href="https://kgd-basket-cdn-01bl.geobasket.ru" />

        {/* Organization structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Moranti",
              url: siteUrl,
              description:
                "Женские сумки из натуральной итальянской кожи. Минималистичные формы, ручная работа.",
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "sales",
              },
            }),
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
        </FavoritesProvider>
      </body>
    </html>
  );
}
