import type { Metadata } from "next";
import Script from "next/script";
import { Playfair_Display, Montserrat, Inter } from "next/font/google";
import { FavoritesProvider } from "@/lib/favorites-context";
import Header from "@/components/layout/header";
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
    default: "Moranti — Сумки, которые говорят без слов",
    template: "%s — Moranti",
  },
  description:
    "Moranti — женские сумки из натуральной кожи. Минималистичные формы, ручная работа, никаких кричащих логотипов.",
  keywords: [
    "сумки",
    "брендовые сумки",
    "женские сумки",
    "Moranti",
    "премиальные сумки",
    "кожаные сумки",
    "сумки ручной работы",
    "тихая роскошь",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Moranti — Сумки, которые говорят без слов",
    description:
      "Женские сумки из натуральной кожи. Минимализм, ручная работа, никаких кричащих логотипов.",
    url: "/",
    siteName: "Moranti",
    type: "website",
    locale: "ru_RU",
  },
};

/* ——— Yandex Metrika ID ——— */

const ymId = process.env.YANDEX_METRIKA_ID;

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
                "Женские сумки из натуральной кожи. Минималистичные формы, ручная работа.",
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
        </FavoritesProvider>
      </body>
    </html>
  );
}
