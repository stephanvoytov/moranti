/* =============================================
   Admin Products API — GET (list), POST (create)
   Protected: requires valid admin session
   Source: Prisma (Supabase Postgres)
   ============================================= */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/admin-auth";
import { csrfGuard } from "@/lib/csrf";
import prisma, { prismaQuery } from "@/lib/prisma";

const VALID_CATEGORIES = [
  "crossbody", "na-plecho", "baguette", "tote", "saddle", "backpack",
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

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { id: { contains: search, mode: "insensitive" } },
    ].filter(Boolean);
  }
  if (category && VALID_CATEGORIES.includes(category)) {
    where.category = category;
  }

  const [items, total] = await prismaQuery(() => Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]));

  const totalPages = Math.ceil(total / limit);
  return NextResponse.json({
    items,
    pagination: { page, limit, total, totalPages },
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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const price = Number(body.price);
  if (isNaN(price) || price <= 0) {
    return NextResponse.json({ error: "Price must be > 0" }, { status: 400 });
  }
  const category = body.category as string;
  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}` }, { status: 400 });
  }

  const wbArticle = body.wbArticle && Number(body.wbArticle) > 0 ? Number(body.wbArticle) : undefined;
  const ozonArticle = body.ozonArticle ? Number(body.ozonArticle) : undefined;

  const marketplaces: { name: string; url: string; icon: string }[] = [];
  if (wbArticle) {
    marketplaces.push({
      name: "Wildberries",
      url: `https://www.wildberries.ru/catalog/${wbArticle}/detail.aspx`,
      icon: "/images/icons/wb.svg",
    });
  }
  if (ozonArticle) {
    marketplaces.push({
      name: "Ozon",
      url: `https://www.ozon.ru/product/${ozonArticle}/`,
      icon: "/images/icons/ozon.svg",
    });
  }

  const images = Array.isArray(body.images) && body.images.length > 0
    ? body.images.filter(Boolean)
    : body.image
      ? [body.image]
      : [];

  const lastProduct = await prismaQuery(() =>
    prisma.product.findFirst({
      orderBy: { createdAt: "desc" },
      select: { id: true },
    })
  );
  const lastNum = lastProduct
    ? parseInt(lastProduct.id.replace("mor-", ""), 10) || 0
    : 0;
  const newId = `mor-${String(lastNum + 1).padStart(3, "0")}`;
  const slug = (body.slug as string) || (wbArticle ? `wb-${wbArticle}` : `product-${newId}`);

  const product = await prismaQuery(() =>
    prisma.product.create({
      data: {
        id: newId,
        slug,
        name: (body.name as string).trim(),
        price,
        originalPrice: body.originalPrice ? Number(body.originalPrice) : price,
        currency: "₽",
        category,
        description: (body.description as string) || "",
        image: (images[0] as string) || "",
        images,
        marketplaces,
        wbArticle: wbArticle ?? null,
        ozonArticle: ozonArticle ?? null,
        rating: body.rating ? Number(body.rating) : null,
        reviewsCount: body.reviewsCount ? Number(body.reviewsCount) : null,
        salesCount: body.salesCount ? Number(body.salesCount) : null,
      },
    })
  );

  return NextResponse.json(product, { status: 201 });
}
