/* =============================================
   GET /api/prices?articles=969008238,584878143
   =============================================
   Прокси для цен Wildberries.
   
   Пока нет WB_API_KEY — возвращаем статику из products.ts.
   Когда появится ключ (.env.local → WB_API_KEY=...) —
   раскомментируй официальный API и закомментируй статику.
   ============================================= */

import { NextRequest, NextResponse } from "next/server";
import { getWbApiKey, type WbPriceResult } from "@/lib/wb-config";
import { getProducts } from "@/data/products";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const articlesRaw = searchParams.get("articles");

  if (!articlesRaw) {
    return NextResponse.json(
      { error: "Missing 'articles' query param. Example: ?articles=969008238,584878143" },
      { status: 400 }
    );
  }

  const articles = articlesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0);

  if (articles.length === 0) {
    return NextResponse.json({ error: "No valid article numbers" }, { status: 400 });
  }

  if (articles.length > 100) {
    return NextResponse.json({ error: "Maximum 100 articles" }, { status: 400 });
  }

  const apiKey = getWbApiKey();

  if (apiKey) {
    // ─── Официальный API Wildberries ───
    // TODO: реализовать запрос к https://content-api.wildberries.ru
    // Пока заглушка — возвращает статику
    return getStaticPrices(articles);
  }

  // ─── Статические данные (пока нет API-ключа) ───
  return getStaticPrices(articles);
}

/** Возвращает цены из статического массива products.ts */
function getStaticPrices(articles: number[]): NextResponse<{ articles: WbPriceResult[] }> {
  const allProducts = getProducts();
  const result: WbPriceResult[] = articles.map((article) => {
    const product = allProducts.find((p) => p.wbArticle === article);
    return {
      article,
      price: product?.price ?? 0,
      originalPrice: product?.originalPrice ?? null,
    };
  });

  return NextResponse.json(
    { articles: result },
    {
      headers: {
        "Cache-Control":
          "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
