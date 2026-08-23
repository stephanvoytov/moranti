/* =============================================
   GET /api/data/products/all
   Public API — все товары, включая нет в наличии
   (для избранного, недавно просмотренных)
   ============================================= */

import { NextResponse } from "next/server";
import { getAllProducts, getCategories } from "@/data/products";

export const dynamic = "force-dynamic";

export async function GET() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategories(),
  ]);

  return NextResponse.json(
    { products, categories },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
