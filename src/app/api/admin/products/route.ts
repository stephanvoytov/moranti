/* =============================================
   Admin Products API — GET (list), POST (create)
   Protected: requires valid admin session
   Source: Prisma (Supabase Postgres)
   ============================================= */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/admin-auth";
import { csrfGuard } from "@/lib/csrf";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createProductSchema, productsQuerySchema, VALID_CATEGORIES } from "@/lib/schemas";
import prisma, { prismaQuery, serializeProduct } from "@/lib/prisma";

/* ——— GET /api/admin/products ——— */

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = productsQuerySchema.safeParse(Object.fromEntries(searchParams));
  const { search = "", category = "", archived = "", marketplace = "", page = 1, limit = 20 } = parsed.data ?? {};

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { id: { contains: search, mode: "insensitive" } },
    ].filter(Boolean);
  }
  if (category && VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
    where.category = category;
  }
  if (archived === "true") {
    where.archivedAt = { not: null };
  } else if (archived === "false") {
    where.archivedAt = null;
  }
  if (marketplace === "wb") {
    where.wbArticle = { not: null };
  } else if (marketplace === "ozon") {
    where.ozonArticle = { not: null };
  } else if (marketplace === "both") {
    where.wbArticle = { not: null };
    where.ozonArticle = { not: null };
  }

  const [items, total] = await prismaQuery(() => Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { model: { select: { id: true, name: true } } },
    }),
    prisma.product.count({ where }),
  ]));

  const totalPages = Math.ceil(total / limit);
  return NextResponse.json({
    items: items.map((p) => serializeProduct(p as Record<string, unknown>)),
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

  const rl = enforceRateLimit(request);
  if (rl) return rl;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { name, price, originalPrice, category, description, wbArticle, ozonArticle, images: inputImages, rating, reviewsCount, slug: customSlug, modelId } = parsed.data;

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

  const images = inputImages.length > 0 ? inputImages : [];

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
  const slug = customSlug || `product-mor-${String(lastNum + 1).padStart(3, "0")}`;

  const product = await prismaQuery(() =>
    prisma.product.create({
      data: {
        id: newId,
        slug,
        name: name.trim(),
        price,
        originalPrice: originalPrice ?? price,
        currency: "₽",
        category,
        description: description || "",
        image: images[0] || "",
        images,
        marketplaces,
        wbArticle: wbArticle ?? null,
        ozonArticle: ozonArticle ?? null,
        rating: rating ?? null,
        reviewsCount: reviewsCount ?? null,
        modelId: modelId ?? null,
      },
    })
  );

  return NextResponse.json(serializeProduct(product as Record<string, unknown>), { status: 201 });
}
