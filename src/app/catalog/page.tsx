import type { Metadata } from "next";
import { getProducts, getCategories } from "@/data/products";
import { readSettings } from "@/lib/settings";
import CatalogPage from "./catalog-content";

// ISR: 1 час. Принудительный сброс кэша — через revalidatePath в sync-runner.ts
export const revalidate = 3600;

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

export default async function CatalogPageWrapper() {
  const [products, categories, settings] = await Promise.all([
    getProducts(),
    getCategories(),
    readSettings(),
  ]);

  return (
    <CatalogPage
      initialProducts={products}
      initialCategories={categories}
      initialCatalogOrder={settings.catalogOrder ?? []}
    />
  );
}
