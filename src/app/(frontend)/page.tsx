import { getProducts, getCategories } from "@/data/products";
import { buildItemListJsonLd } from "@/lib/seo-jsonld";
import BrandSeo from "@/components/sections/brand-seo";
import HomeClient from "./home-client";
import { getPayload } from "payload";
import config from "@payload-config";
import { RenderBlock } from "@/components/sections/page-view";
import {
  HomeHero,
  HomeProducts,
  HomeCategories,
  resolveProducts,
  type CategoryView,
} from "./home-blocks";

export const revalidate = 60;

const HOME_BLOCKS = new Set(["homeHero", "products", "categories"]);

export default async function Home() {
  const [products, baseCategories, homePage, categoriesColl] =
    await Promise.all([
      getProducts(),
      getCategories(),
      (async () => {
        try {
          const payload = await getPayload({ config });
          const res = await payload.find({
            collection: "pages",
            where: { slug: { equals: "home" } },
            limit: 1,
            depth: 3,
          });
          return res.docs[0] || null;
        } catch {
          return null;
        }
      })(),
      (async () => {
        try {
          const payload = await getPayload({ config });
          const res = await payload.find({
            collection: "categories",
            limit: 200,
            depth: 0,
          });
          return (res.docs as any[]) || [];
        } catch {
          return [];
        }
      })(),
    ]);

  // Фото категории: из карточки Категории, иначе фолбэк на первый товар
  const catImageMap: Record<string, string> = {};
  for (const c of categoriesColl as any[]) {
    if (c?.slug && c?.image) catImageMap[String(c.slug)] = String(c.image);
  }
  const categories: CategoryView[] = baseCategories.map((c) => {
    const img = catImageMap[c.slug] || "";
    const display = img || products.find((p) => p.category === c.slug)?.image || "";
    return { slug: c.slug, name: c.name, count: c.count, image: display };
  });

  const blocks = Array.isArray((homePage as any)?.layout)
    ? ((homePage as any).layout as any[])
    : [];

  const siteUrl = process.env.SITE_URL || "http://localhost:3001";

  // JSON-LD для первого блока «Товары» (если есть)
  const firstProductsBlock = blocks.find((b) => b.blockType === "products");
  const jsonLdProducts = firstProductsBlock
    ? resolveProducts(firstProductsBlock, products)
    : [];

  return (
    <>
      {jsonLdProducts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildItemListJsonLd(jsonLdProducts, siteUrl)),
          }}
        />
      )}

      {blocks.map((block, i) => {
        if (block.blockType === "homeHero")
          return <HomeHero key={i} block={block} />;
        if (block.blockType === "products")
          return <HomeProducts key={i} block={block} products={products} />;
        if (block.blockType === "categories")
          return <HomeCategories key={i} block={block} categories={categories} />;
        return <RenderBlock key={i} block={block} data={{ products }} />;
      })}

      <BrandSeo />
      <HomeClient />
    </>
  );
}
