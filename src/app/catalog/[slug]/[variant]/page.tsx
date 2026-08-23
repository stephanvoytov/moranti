import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProducts } from "@/data/products";
import {
  buildVariantPages,
  getVariantPage,
} from "@/lib/variant-pages";
import VariantView from "@/components/sections/variant-view";

interface Props {
  params: Promise<{ slug: string; variant: string }>;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return buildVariantPages(products)
    .filter((p) => p.category)
    .map((p) => ({ slug: p.category, variant: p.variant }));
}

// ISR 60с — как на категориях: состав лендинга зависит от актуальных товаров
export const revalidate = 60;

// Слаги вне generateStaticParams (мусорные/несуществующие) — жёсткий 404
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, variant } = await params;
  const products = await getProducts();
  const page = getVariantPage(slug, variant, products);
  if (!page) notFound();

  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      title: page.title,
      description: page.description,
      url: page.path,
      siteName: "Moranti",
      type: "website",
      locale: "ru_RU",
    },
  };
}

export default async function CategoryVariantPage({ params }: Props) {
  const { slug, variant } = await params;
  const products = await getProducts();
  const page = getVariantPage(slug, variant, products);
  if (!page) notFound();

  return <VariantView page={page} />;
}