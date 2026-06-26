/* =============================================
   Admin Models API — GET (single), PUT, DELETE
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

const updateModelSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  slug: z.string().min(1, "Slug is required").optional(),
  category: z.enum(VALID_CATEGORIES).optional(),
  description: z.string().optional(),
  composition: z.string().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  image: z.string().optional(),
});

const linkVariantsSchema = z.object({
  variantIds: z.array(z.string()),
});

/* ——— GET /api/admin/models/[id] ——— */

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const model = await prismaQuery(() =>
    prisma.model.findUnique({
      where: { id },
      include: {
        variants: {
          where: { archivedAt: null },
          orderBy: { createdAt: "asc" },
        },
      },
    })
  );

  if (!model) {
    return NextResponse.json({ error: "Model not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...model,
    variants: model.variants.map((v) => serializeProduct(v as Record<string, unknown>)),
  });
}

/* ——— PUT /api/admin/models/[id] ——— */

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

  const rl = enforceRateLimit(request);
  if (rl) return rl;

  const { id } = await params;

  const model = await prismaQuery(() => prisma.model.findUnique({ where: { id } }));
  if (!model) {
    return NextResponse.json({ error: "Model not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = updateModelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { name, slug, category, description, composition, dimensions, image } = parsed.data;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name.trim();
  if (slug !== undefined) data.slug = slug;
  if (category !== undefined) data.category = category;
  if (description !== undefined) data.description = description;
  if (composition !== undefined) data.composition = composition ?? null;
  if (dimensions !== undefined) data.dimensions = dimensions ?? null;
  if (image !== undefined) data.image = image;

  const updated = await prismaQuery(() =>
    prisma.model.update({ where: { id }, data })
  );

  return NextResponse.json(updated);
}

/* ——— DELETE /api/admin/models/[id] ——— */

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

  const model = await prismaQuery(() => prisma.model.findUnique({ where: { id } }));
  if (!model) {
    return NextResponse.json({ error: "Model not found" }, { status: 404 });
  }

  // Unlink all variants first
  await prismaQuery(() =>
    prisma.product.updateMany({
      where: { modelId: id },
      data: { modelId: null },
    })
  );

  await prismaQuery(() => prisma.model.delete({ where: { id } }));

  return NextResponse.json({ ok: true });
}

/* ——— PUT /api/admin/models/[id]/link ——— */
/* Link/unlink variants to this model */

export async function PATCH(
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

  const model = await prismaQuery(() => prisma.model.findUnique({ where: { id } }));
  if (!model) {
    return NextResponse.json({ error: "Model not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Support both setting variantIds and unlinking a single variant
  if (body.action === "unlink" && body.variantId) {
    await prismaQuery(() =>
      prisma.product.update({
        where: { id: body.variantId as string },
        data: { modelId: null },
      })
    );
    return NextResponse.json({ ok: true });
  }

  const parsed = linkVariantsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // Unlink all current variants first
  await prismaQuery(() =>
    prisma.product.updateMany({
      where: { modelId: id },
      data: { modelId: null },
    })
  );

  // Link new variants
  for (const vid of parsed.data.variantIds) {
    const product = await prismaQuery(() => prisma.product.findUnique({ where: { id: vid } }));
    if (product) {
      await prismaQuery(() =>
        prisma.product.update({
          where: { id: vid },
          data: { modelId: id },
        })
      );
    }
  }

  return NextResponse.json({ ok: true, linkedCount: parsed.data.variantIds.length });
}
