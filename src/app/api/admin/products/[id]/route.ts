/* =============================================
   Admin Products API — GET (single), PUT, DELETE
   Protected: requires valid admin session
   Fallback: если Prisma недоступна — читает/пишет JSON
   ============================================= */

import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { getSession } from "@/lib/admin-auth";
import { csrfGuard } from "@/lib/csrf";
import prisma, { prismaQuery } from "@/lib/prisma";

const VALID_CATEGORIES = [
  "crossbody", "na-plecho", "baguette", "tote", "saddle", "backpack",
];

/* ——— JSON fallback helpers ——— */

function dataPath() {
  return path.join(process.cwd(), "data", "products.json");
}

function readJsonFallback() {
  try {
    if (!existsSync(dataPath())) return { products: [] };
    return JSON.parse(readFileSync(dataPath(), "utf-8"));
  } catch {
    return { products: [] };
  }
}

function writeJsonFallback(data: unknown) {
  try {
    writeFileSync(dataPath(), JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // read-only fs — silently ignore
  }
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

  // Try Prisma first
  try {
    const product = await prismaQuery(() => prisma.product.findUnique({ where: { id } }));
    if (product) return NextResponse.json(product);
  } catch {
    // Prisma unavailable — fallback to JSON
  }

  // JSON fallback
  const data = readJsonFallback();
  const product = data.products.find((p: { id: string }) => p.id === id);
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

  // Try Prisma first
  try {
    const existing = await prismaQuery(() => prisma.product.findUnique({ where: { id } }));
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

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

    if (body.wbArticle !== undefined) {
      data.wbArticle = Number(body.wbArticle);
      data.slug = `wb-${body.wbArticle}`;
    }
    if (body.ozonArticle !== undefined) {
      data.ozonArticle = body.ozonArticle ? Number(body.ozonArticle) : null;
    }

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

    const updated = await prismaQuery(() =>
      prisma.product.update({
        where: { id },
        data,
      })
    );

    return NextResponse.json(updated);
  } catch {
    // Prisma unavailable → fallback to JSON
  }

  // JSON fallback for PUT
  const jsonData = readJsonFallback();
  const index = jsonData.products.findIndex((p: { id: string }) => p.id === id);
  if (index === -1) {
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

    const current = jsonData.products[index];
    const updated = { ...current };

    if (body.name) updated.name = body.name.trim();
    if (body.price !== undefined) updated.price = Number(body.price);
    if (body.originalPrice !== undefined) updated.originalPrice = Number(body.originalPrice);
    if (body.category) updated.category = body.category;
    if (body.description !== undefined) updated.description = body.description;
    if (body.rating !== undefined) updated.rating = body.rating ? Number(body.rating) : undefined;
    if (body.reviewsCount !== undefined) updated.reviewsCount = body.reviewsCount ? Number(body.reviewsCount) : undefined;

    if (body.images !== undefined && Array.isArray(body.images)) {
      const filtered = body.images.filter(Boolean);
      updated.images = filtered;
      updated.image = filtered[0] || "";
    }

    if (body.wbArticle !== undefined) {
      updated.wbArticle = Number(body.wbArticle);
      updated.slug = `wb-${updated.wbArticle}`;
    }
    if (body.ozonArticle !== undefined) {
      updated.ozonArticle = body.ozonArticle ? Number(body.ozonArticle) : undefined;
    }

    const wbNum = body.wbArticle !== undefined ? Number(body.wbArticle) : current.wbArticle;
    const ozonNum = body.ozonArticle !== undefined
      ? (body.ozonArticle ? Number(body.ozonArticle) : null)
      : current.ozonArticle;

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
    updated.marketplaces = marketplaces;

    jsonData.products[index] = updated;
    writeJsonFallback(jsonData);

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

  // Try Prisma first
  try {
    const existing = await prismaQuery(() => prisma.product.findUnique({ where: { id } }));
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    await prismaQuery(() => prisma.product.delete({ where: { id } }));
    return NextResponse.json({ ok: true });
  } catch {
    // Prisma unavailable → fallback to JSON
  }

  // JSON fallback
  const data = readJsonFallback();
  const index = data.products.findIndex((p: { id: string }) => p.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  data.products.splice(index, 1);
  data.meta = data.meta || { count: 0 };
  data.meta.count = data.products.length;
  writeJsonFallback(data);

  return NextResponse.json({ ok: true });
}
