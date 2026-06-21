import type { Metadata } from "next";
import CatalogPage from "./catalog-content";

export const metadata: Metadata = {
  title: "Каталог кожаных сумок",
  description:
    "Каталог женских сумок Moranti из натуральной кожи. Модели: crossbody, na-plecho, baguette, tote, saddle, backpack. Более 50 моделей.",
  openGraph: {
    title: "Каталог сумок Moranti — натуральная кожа",
    description:
      "Модели: crossbody, na-plecho, baguette, tote, saddle, backpack. Более 50 моделей.",
    url: "/catalog",
    siteName: "Moranti",
    type: "website",
    locale: "ru_RU",
  },
};

export default function CatalogPageWrapper() {
  return <CatalogPage />;
}
