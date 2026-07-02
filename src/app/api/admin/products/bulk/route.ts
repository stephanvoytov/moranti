/* =============================================
   Admin Products Bulk API — POST (archive/delete)
   Protected: requires valid admin session
   Source: Prisma (Postgres)
   ============================================= */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/admin-auth";
import { csrfGuard } from "@/lib/csrf";
import { enforceRateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import prisma, { prismaQuery } from "@/lib/prisma";

const bulkActionSchema = z.object({
  action: z.enum(["archive", "unarchive", "delete"]),
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
});

/* ——— POST /api/admin/products/bulk ——— */

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

  const parsed = bulkActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { action, ids } = parsed.data;

  const result = await prismaQuery(async () => {
    switch (action) {
      case "archive":
        return prisma.product.updateMany({
          where: { id: { in: ids } },
          data: { archivedAt: new Date().toISOString() },
        });

      case "unarchive":
        return prisma.product.updateMany({
          where: { id: { in: ids } },
          data: { archivedAt: null },
        });

      case "delete": {
        // First unlink from models if linked
        await prisma.product.updateMany({
          where: { id: { in: ids } },
          data: { modelId: null },
        });
        return prisma.product.deleteMany({
          where: { id: { in: ids } },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  });

  return NextResponse.json({
    success: true,
    action,
    count: result.count,
    message: getMessage(action, result.count),
  });
}

function getMessage(action: string, count: number): string {
  const nouns: Record<string, [string, string]> = {
    archive: ["товар архивирован", "товаров архивировано"],
    unarchive: ["товар разархивирован", "товаров разархивировано"],
    delete: ["товар удалён", "товаров удалено"],
  };
  const [one, few] = nouns[action] ?? ["обработано", "обработано"];
  return `${count} ${count === 1 ? one : few}`;
}
