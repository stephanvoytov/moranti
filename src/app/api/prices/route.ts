/* =============================================
   GET /api/prices?articles=969008238,584878143
   =============================================
   Прокси для цен Wildberries.
   
   - Есть WB_API_KEY → живые цены из официального API WB (с серверным кэшем)
   - Нет ключа → статика из БД
   - API недоступен → graceful degradation на статику
   ============================================= */

import { NextRequest, NextResponse } from "next/server";
import { getWbPrices, invalidateWbPriceCache } from "@/lib/wb-prices";
import { enforceRateLimit } from "@/lib/rate-limit";
import { pricesQuerySchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const rl = enforceRateLimit(request, { max: 60, windowMs: 60_000 });
  if (rl) return rl;

  const { searchParams } = new URL(request.url);
  const parsed = pricesQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Missing 'articles' query param. Example: ?articles=969008238,584878143" },
      { status: 400 },
    );
  }

  const articles = parsed.data.articles
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

  // Поддержка ?refresh=1 — сброс кэша (для админки)
  if (searchParams.get("refresh") === "1") {
    invalidateWbPriceCache();
  }

  const result = await getWbPrices(articles);

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
