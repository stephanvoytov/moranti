/* =============================================
   Admin WB Sync API
   POST  — async start, returns runId
   GET   — history of completed runs
   Protected: requires valid admin session
   ============================================= */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/admin-auth";
import { csrfGuard } from "@/lib/csrf";
import { enforceRateLimit } from "@/lib/rate-limit";
import { runWbSync } from "@/lib/wb-sync";
import { getSyncHistory } from "@/lib/sync-history";
import { invalidateCache } from "@/lib/data-cache";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const history = await getSyncHistory("wb");
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
    const runId = runWbSync();
    // После синхронизации (когда завершится) — сбросить все кеши данных.
    // Инвалидация делается здесь сразу, т.к. sync-runner сохраняет
    // результат в историю, а свежие данные нужны с момента запуска.
    invalidateCache();
    return NextResponse.json({ runId, status: "started" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
