/* =============================================
   Admin Models API — GET (list), POST (create)
   Protected: requires valid admin session
   Source: Prisma (Postgres)
   ============================================= */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/admin-auth";
import { csrfGuard } from "@/lib/csrf";
import { enforceRateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import prisma, { prismaQuery, serializeProduct } from "@/lib/prisma";
import { VALID_CATEGORIES } from "@/lib/schemas";

const createModelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  category: z.enum(VALID_CATEGORIES),
  description: z.string().optional().default(""),
  composition: z.string().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  image: z.string().optional().default(""),
});

/* ——— GET /api/admin/models ——— */

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const models = await prismaQuery(() =>
    prisma.model.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        variants: {
          where: { archivedAt: null },
          orderBy: { createdAt: "asc" },
        },
      },
    })
  );

  const result = models.map((m) => ({
    ...m,
    variants: m.variants.map((v) => serializeProduct(v as Record<string, unknown>)),
  }));

  return NextResponse.json({ items: result });
}

/* ——— POST /api/admin/models ——— */

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

  const parsed = createModelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { name, slug, category, description, composition, dimensions, image } = parsed.data;

  // Auto-generate ID
  const lastModel = await prismaQuery(() =>
    prisma.model.findFirst({ orderBy: { createdAt: "desc" }, select: { id: true } })
  );
  const lastNum = lastModel
    ? parseInt(lastModel.id.replace("model-", ""), 10) || 0
    : 0;
  const newId = `model-${String(lastNum + 1).padStart(3, "0")}`;

  const model = await prismaQuery(() =>
    prisma.model.create({
      data: {
        id: newId,
        name: name.trim(),
        slug,
        category,
        description,
        composition: composition ?? null,
        dimensions: dimensions ?? null,
        image,
      },
    })
  );

  return NextResponse.json(model, { status: 201 });
}
