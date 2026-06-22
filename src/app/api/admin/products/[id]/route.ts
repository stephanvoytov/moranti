/* =============================================
   Admin Products API — GET (single), PUT, DELETE
   Protected: requires valid admin session
   ============================================= */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/admin-auth";
import { csrfGuard } from "@/lib/csrf";
import prisma from "@/lib/prisma";

const VALID_CATEGORIES = [
  "crossbody", "na-plecho", "baguette", "tote", "saddle", "backpack",
];

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
  const product = await prisma.product.findUnique({ where: { id } });

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

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  try {
    const body = await request.json();

    if (body.name !== undefined && (!body.name || !body.name.trim())) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }
    if (body.price !== undefined && (isNaN(Number(body.price)) || Number(body.price) <= 0)) {
      return NextResponse.json({ error: "Price must be > 0" }, { status: 400 });
    }
    if (body.category !== undefined && !VALID_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}` }, { status: 400 });
    }

    const data: Record<string, unknown> = {};

    if (body.name) data.name = body.name.trim();
    if (body.price !== undefined) data.price = Number(body.price);
    if (body.originalPrice !== undefined) data.originalPrice = Number(body.originalPrice);
    if (body.category) data.category = body.category;
    if (body.description !== undefined) data.description = body.description;
    if (body.rating !== undefined) data.rating = body.rating ? Number(body.rating) : null;
    if (body.reviewsCount !== undefined) data.reviewsCount = body.reviewsCount ? Number(body.reviewsCount) : null;
    if (body.salesCount !== undefined) data.salesCount = body.salesCount ? Number(body.salesCount) : null;

    if (body.images !== undefined && Array.isArray(body.images)) {
      const filtered = body.images.filter(Boolean);
      data.images = filtered;
      data.image = filtered[0] || "";
    }

    // Article numbers + marketplace links
    if (body.wbArticle !== undefined) {
      data.wbArticle = Number(body.wbArticle);
      data.slug = `wb-${body.wbArticle}`;
    }
    if (body.ozonArticle !== undefined) {
      data.ozonArticle = body.ozonArticle ? Number(body.ozonArticle) : null;
    }

    // Rebuild marketplaces
    const wbNum = body.wbArticle !== undefined ? Number(body.wbArticle) : existing.wbArticle;
    const ozonNum = body.ozonArticle !== undefined
      ? (body.ozonArticle ? Number(body.ozonArticle) : null)
      : existing.ozonArticle;

    const marketplaces = [];
    if (wbNum && wbNum > 0) {
      marketplaces.push({
        name: "Wildberries",
        url: `https://www.wildberries.ru/catalog/${wbNum}/detail.aspx`,
        icon: "/images/icons/wb.svg",
      });
    }
    if (ozonNum) {
      marketplaces.push({
        name: "Ozon",
        url: `https://www.ozon.ru/product/${ozonNum}/`,
        icon: "/images/icons/ozon.svg",
      });
    }
    data.marketplaces = marketplaces;

    const updated = await prisma.product.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

/* ——— DELETE /api/admin/products/[id] ——— */

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
