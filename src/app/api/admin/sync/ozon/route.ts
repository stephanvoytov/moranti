/* =============================================
   Admin Ozon Sync API
   POST  — async start, returns runId
   GET   — history of completed runs
   Protected: requires valid admin session
   ============================================= */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/admin-auth";
import { csrfGuard } from "@/lib/csrf";
import { enforceRateLimit } from "@/lib/rate-limit";
import { runOzonSync } from "@/lib/ozon-sync";
import { getSyncHistory } from "@/lib/sync-history";
import { invalidateCache } from "@/lib/data-cache";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const history = await getSyncHistory("ozon");
  return NextResponse.json({ runs: history });
}

export async function POST(request: NextRequest) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rl = enforceRateLimit(request, { max: 5, windowMs: 60_000 });
  if (rl) return rl;

  try {
    const runId = runOzonSync();
    // Сбрасываем кеш сразу (следующий запрос возьмёт свежие данные из БД)
    invalidateCache();
    return NextResponse.json({ runId, status: "started" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Ozon sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
