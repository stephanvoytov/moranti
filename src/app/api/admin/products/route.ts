/* =============================================
   Admin Products API — GET (list), POST (create)
   Protected: requires valid admin session
   ============================================= */

import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { getSession } from "@/lib/admin-auth";
import { csrfGuard } from "@/lib/csrf";
import { invalidateProductsCache } from "@/data/products";
import type { Product, MarketplaceLink } from "@/data/products";

/* ——— Типы ——— */

interface ProductsFile {
  products: Product[];
  categories: { name: string; slug: string }[];
  meta: { count: number };
}

/* ——— Helpers ——— */

function dataPath(): string {
  return path.join(process.cwd(), "data", "products.json");
}

function readData(): ProductsFile {
  const raw = readFileSync(dataPath(), "utf-8");
  return JSON.parse(raw);
}

function writeData(data: ProductsFile): void {
  writeFileSync(dataPath(), JSON.stringify(data, null, 2), "utf-8");
}

const VALID_CATEGORIES = [
  "tote", "shoulder", "backpack", "baguette", "mini", "evening", "saddle",
];

/* ——— GET /api/admin/products ——— */

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase() || "";
  const category = searchParams.get("category") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

  const data = readData();
  let filtered = data.products;

  if (search) {
    filtered = filtered.filter(
      (p: Product) =>
        p.name.toLowerCase().includes(search) ||
        p.id.toLowerCase().includes(search) ||
        String(p.wbArticle).includes(search),
    );
  }

  if (category && VALID_CATEGORIES.includes(category)) {
    filtered = filtered.filter((p: Product) => p.category === category);
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const safePage = Math.min(page, Math.max(totalPages, 1));
  const start = (safePage - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return NextResponse.json({
    items,
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  });
}

/* ——— POST /api/admin/products ——— */

export async function POST(request: NextRequest) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validation
    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const price = Number(body.price);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: "Price must be > 0" }, { status: 400 });
    }

    const category = body.category;
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}` }, { status: 400 });
    }

    const data = readData();

    // Generate new ID
    const maxNum = data.products.reduce(
      (max: number, p: Product) => Math.max(max, parseInt(p.id.replace("mor-", ""), 10) || 0),
      0,
    );
    const newId = `mor-${String(maxNum + 1).padStart(3, "0")}`;

    const hasWbArticle = body.wbArticle && Number(body.wbArticle) > 0;
    const hasOzonArticle = body.ozonArticle && Number(body.ozonArticle) > 0;
    const wbArticleNum = hasWbArticle ? Number(body.wbArticle) : undefined;
    const ozonArticleNum = hasOzonArticle ? Number(body.ozonArticle) : undefined;
    // Slug: если есть артикул WB — от него, иначе от newId
    const slug = body.slug || (hasWbArticle ? `wb-${wbArticleNum}` : `product-${newId}`);

    // Auto-generate marketplace links from article numbers
    const marketplaces: MarketplaceLink[] = [];
    if (hasWbArticle) {
      marketplaces.push({
        name: "Wildberries",
        url: `https://www.wildberries.ru/catalog/${wbArticleNum}/detail.aspx`,
        icon: "/images/icons/wb.svg",
      });
    }
    if (hasOzonArticle) {
      marketplaces.push({
        name: "Ozon",
        url: `https://www.ozon.ru/product/${ozonArticleNum}/`,
        icon: "/images/icons/ozon.svg",
      });
    }

    // Images: if provided as array, use as-is; fallback from single image for migration
    const images: string[] = Array.isArray(body.images) && body.images.length > 0
      ? body.images.filter(Boolean)
      : body.image
        ? [body.image]
        : [];

    const newProduct: Omit<Product, "id"> & { id: string } = {
      id: newId,
      slug,
      name: body.name.trim(),
      price,
      originalPrice: body.originalPrice ? Number(body.originalPrice) : price,
      currency: "₽",
      category,
      description: body.description || "",
      image: images[0] || "",
      images,
      marketplaces,
      wbArticle: wbArticleNum ?? 0,
      ozonArticle: ozonArticleNum,
      rating: body.rating ? Number(body.rating) : undefined,
      reviewsCount: body.reviewsCount ? Number(body.reviewsCount) : undefined,
    };

    data.products.push(newProduct);
    data.meta.count = data.products.length;
    writeData(data);
    invalidateProductsCache();

    return NextResponse.json(newProduct, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
