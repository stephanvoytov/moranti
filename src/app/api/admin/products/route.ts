/* =============================================
   Admin Products API — GET (list), POST (create)
   Protected: requires valid admin session
   ============================================= */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/admin-auth";
import { csrfGuard } from "@/lib/csrf";
import prisma from "@/lib/prisma";

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
      { wbArticle: isNaN(Number(search)) ? undefined : Number(search) },
    ].filter(Boolean);
  }
  if (category && VALID_CATEGORIES.includes(category)) {
    where.category = category;
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

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

  try {
    const body = await request.json();

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

    // Generate new ID
    const lastProduct = await prisma.product.findFirst({
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    const lastNum = lastProduct
      ? parseInt(lastProduct.id.replace("mor-", ""), 10) || 0
      : 0;
    const newId = `mor-${String(lastNum + 1).padStart(3, "0")}`;

    const hasWbArticle = body.wbArticle && Number(body.wbArticle) > 0;
    const hasOzonArticle = body.ozonArticle && Number(body.ozonArticle) > 0;
    const wbArticleNum = hasWbArticle ? Number(body.wbArticle) : undefined;
    const ozonArticleNum = hasOzonArticle ? Number(body.ozonArticle) : undefined;
    const slug = body.slug || (hasWbArticle ? `wb-${wbArticleNum}` : `product-${newId}`);

    const marketplaces = [];
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

    const images = Array.isArray(body.images) && body.images.length > 0
      ? body.images.filter(Boolean)
      : body.image
        ? [body.image]
        : [];

    const product = await prisma.product.create({
      data: {
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
        wbArticle: wbArticleNum ?? null,
        ozonArticle: ozonArticleNum ?? null,
        rating: body.rating ? Number(body.rating) : null,
        reviewsCount: body.reviewsCount ? Number(body.reviewsCount) : null,
        salesCount: body.salesCount ? Number(body.salesCount) : null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
