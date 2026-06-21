/* =============================================
   Admin Products API — GET (single), PUT, DELETE
   Protected: requires valid admin session
   ============================================= */

import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { getSession } from "@/lib/admin-auth";
import { csrfGuard } from "@/lib/csrf";
import { invalidateProductsCache } from "@/data/products";
import type { Product, MarketplaceLink } from "@/data/products";

interface ProductsFile {
  products: Product[];
  categories: { name: string; slug: string }[];
  meta: { count: number };
}

const VALID_CATEGORIES = [
  "crossbody", "na-plecho", "baguette", "tote", "saddle", "backpack",
];

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

/* ——— GET /api/admin/products/[id] ——— */

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const data = readData();
  const product = data.products.find((p: Product) => p.id === id);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

/* ——— PUT /api/admin/products/[id] ——— */

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const data = readData();
  const index = data.products.findIndex((p: Product) => p.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  try {
    const body = await request.json();

    // Validation
    if (body.name !== undefined && (!body.name || !body.name.trim())) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }

    if (body.price !== undefined && (isNaN(Number(body.price)) || Number(body.price) <= 0)) {
      return NextResponse.json({ error: "Price must be > 0" }, { status: 400 });
    }

    if (body.category !== undefined && !VALID_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}` }, { status: 400 });
    }

    // Update fields
    const current = data.products[index];
    const updated = { ...current };

    if (body.name) updated.name = body.name.trim();
    if (body.price !== undefined) updated.price = Number(body.price);
    if (body.originalPrice !== undefined) updated.originalPrice = Number(body.originalPrice);
    if (body.category) updated.category = body.category;
    if (body.description !== undefined) updated.description = body.description;
    if (body.rating !== undefined) updated.rating = body.rating ? Number(body.rating) : undefined;
    if (body.reviewsCount !== undefined) updated.reviewsCount = body.reviewsCount ? Number(body.reviewsCount) : undefined;

    // Images array
    if (body.images !== undefined && Array.isArray(body.images)) {
      const filtered = body.images.filter(Boolean);
      updated.images = filtered;
      updated.image = filtered[0] || "";
    }

    // Article numbers → auto-generate marketplace links
    if (body.wbArticle !== undefined) {
      updated.wbArticle = Number(body.wbArticle);
      // slug тоже обновляем, если меняется артикул
      updated.slug = `wb-${updated.wbArticle}`;
    }
    if (body.ozonArticle !== undefined) {
      updated.ozonArticle = body.ozonArticle ? Number(body.ozonArticle) : undefined;
    }

    // Rebuild marketplaces from article numbers
    const marketplaces: MarketplaceLink[] = [];
    if (updated.wbArticle && Number(updated.wbArticle) > 0) {
      marketplaces.push({
        name: "Wildberries",
        url: `https://www.wildberries.ru/catalog/${updated.wbArticle}/detail.aspx`,
        icon: "/images/icons/wb.svg",
      });
    }
    if (updated.ozonArticle) {
      marketplaces.push({
        name: "Ozon",
        url: `https://www.ozon.ru/product/${updated.ozonArticle}/`,
        icon: "/images/icons/ozon.svg",
      });
    }
    updated.marketplaces = marketplaces;

    data.products[index] = updated;
    writeData(data);
    invalidateProductsCache();

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

/* ——— DELETE /api/admin/products/[id] ——— */

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const data = readData();
  const index = data.products.findIndex((p: Product) => p.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  data.products.splice(index, 1);
  data.meta.count = data.products.length;
  writeData(data);
  invalidateProductsCache();

  return NextResponse.json({ ok: true });
}
