import type { Metadata } from "next";
import CatalogPage from "./catalog-content";

export const metadata: Metadata = {
  title: "Каталог сумок из натуральной итальянской кожи",
  description:
    "Каталог женских сумок Moranti из натуральной итальянской кожи. Трендовые модели: сумки через плечо, тоут, мини, багет, рюкзаки, сёдла, вечерние. Более 100 моделей.",
  openGraph: {
    title: "Каталог сумок Moranti — натуральная итальянская кожа",
    description:
      "Трендовые модели: shoulder, tote, mini, baguette, backpack, saddle, evening. Более 100 моделей.",
    url: "/catalog",
    siteName: "Moranti",
    type: "website",
    locale: "ru_RU",
  },
};

export default function CatalogPageWrapper() {
  return <CatalogPage />;
}
