/* =============================================
   Admin Products API — GET (single), PUT, DELETE
   Protected: requires valid admin session
   Source: Prisma (Supabase Postgres)
   ============================================= */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/admin-auth";
import { csrfGuard } from "@/lib/csrf";
import { enforceRateLimit } from "@/lib/rate-limit";
import { MARKETPLACE_URLS } from "@/lib/marketplaces";
import { updateProductSchema, VALID_CATEGORIES } from "@/lib/schemas";
import prisma, { prismaQuery, serializeProduct } from "@/lib/prisma";
import { invalidateCache } from "@/lib/data-cache";

/* ——— GET /api/admin/products/[slug] ——— */

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { slug } = await params;
  const product = await prismaQuery(() => prisma.product.findUnique({ where: { slug } }));
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(serializeProduct(product as Record<string, unknown>));
}

/* ——— PUT /api/admin/products/[slug] ——— */

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rl = enforceRateLimit(request);
  if (rl) return rl;

  const { slug } = await params;

  const product = await prismaQuery(() => prisma.product.findUnique({ where: { slug } }));
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { name, price, originalPrice, category, description, rating, reviewsCount, images, wbArticle, ozonArticle, composition, colorName, modelId, sku } = parsed.data;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name.trim();
  if (price !== undefined) data.price = price;
  if (originalPrice !== undefined) data.originalPrice = originalPrice;
  if (category !== undefined) data.category = category;
  if (description !== undefined) data.description = description;
  if (rating !== undefined) data.rating = rating ?? null;
  if (reviewsCount !== undefined) data.reviewsCount = reviewsCount ?? null;
  if (composition !== undefined) data.composition = composition;
  if (colorName !== undefined) data.colorName = colorName;
  if (modelId !== undefined) data.modelId = modelId ?? null;
  if (sku !== undefined) data.sku = sku ?? null;

  if (images !== undefined) {
    const filtered = images.filter(Boolean);
    data.images = filtered;
    data.image = filtered[0] || "";
  }

  if (wbArticle !== undefined) {
    data.wbArticle = wbArticle;
    data.slug = product.slug;
  }
  if (ozonArticle !== undefined) {
    data.ozonArticle = ozonArticle ?? null;
  }

  const wbNum = wbArticle !== undefined ? wbArticle : product.wbArticle;
  const ozonNum = ozonArticle !== undefined ? (ozonArticle ?? null) : product.ozonArticle;

  const marketplaces: { name: string; url: string; icon: string }[] = [];
  if (wbNum && wbNum > 0) {
    marketplaces.push({
      name: "Wildberries",
      url: MARKETPLACE_URLS.wbProduct(Number(wbNum)),
      icon: "/images/icons/wb.svg",
    });
  }
  if (ozonNum) {
    marketplaces.push({
      name: "Ozon",
      url: MARKETPLACE_URLS.ozonProduct(Number(ozonNum)),
      icon: "/images/icons/ozon.svg",
    });
  }
  data.marketplaces = marketplaces;

  const updated = await prismaQuery(() =>
    prisma.product.update({ where: { slug }, data })
  );
  invalidateCache("all-products");
  invalidateCache("all-categories");
  return NextResponse.json(serializeProduct(updated as Record<string, unknown>));
}

/* ——— DELETE /api/admin/products/[slug] ——— */

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { slug } = await params;

  const product = await prismaQuery(() => prisma.product.findUnique({ where: { slug } }));
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await prismaQuery(() => prisma.product.delete({ where: { slug } }));
  invalidateCache("all-products");
  invalidateCache("all-categories");
  return NextResponse.json({ ok: true });
}
