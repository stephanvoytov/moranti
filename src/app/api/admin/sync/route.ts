/* =============================================
   POST /api/admin/sync
   Запускает синхронизацию с Wildberries.
   Protected: требует сессии + CSRF.
   ============================================= */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/admin-auth";
import { csrfGuard } from "@/lib/csrf";
import { runWbSync } from "@/lib/wb-sync";
import { invalidateProductsCache } from "@/data/products";

export async function POST(request: Request) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const report = runWbSync();
  invalidateProductsCache();

  const status = report.error ? 500 : 200;
  return NextResponse.json(report, { status });
}
