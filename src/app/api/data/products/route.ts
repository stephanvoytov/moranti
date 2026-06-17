/* =============================================
   GET /api/data/products
   Public API — возвращает все товары для клиентских компонентов
   ============================================= */

import { NextResponse } from "next/server";
import { getProducts, getCategories } from "@/data/products";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = getProducts();
  const categories = getCategories();

  return NextResponse.json(
    { products, categories },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
