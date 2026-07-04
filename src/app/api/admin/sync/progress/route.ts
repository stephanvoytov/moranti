/* =============================================
   Admin Sync Progress API
   GET /api/admin/sync/progress?runId=xxx
   Protected: requires valid admin session
   ============================================= */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/admin-auth";
import { getSyncProgress } from "@/lib/sync-runner";
import { getSyncHistory } from "@/lib/sync-history";
import { invalidateCache } from "@/lib/data-cache";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const runId = searchParams.get("runId");
  const platform = searchParams.get("platform") as "wb" | "ozon" | null;

  // Если передан runId — возвращаем прогресс конкретного запуска
  if (runId) {
    const progress = getSyncProgress(runId);
    if (!progress) {
      // Возможно уже завершился и утёк из памяти — проверим историю
      return NextResponse.json({ status: "completed" });
    }
    return NextResponse.json(progress);
  }

  // Если передан platform — возвращаем статус последнего запуска
  if (platform) {
    const activeRunId = getActiveRunId(platform);
    if (activeRunId) {
      const progress = getSyncProgress(activeRunId);
      if (progress) return NextResponse.json(progress);
    }
    // Завершился — возвращаем из истории
    const lastRun = await getLastSyncRun(platform);
    return NextResponse.json(
      lastRun
        ? {
            status: "completed",
            platform,
            startedAt: lastRun.timestamp,
            details: lastRun,
          }
        : { status: "idle" }
    );
  }

  return NextResponse.json({ status: "idle" });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  if (body.action === "invalidate-cache") {
    invalidateCache();
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

// Импорт для getActiveRunId
import { getActiveRunId, getLastSyncRun } from "@/lib/sync-runner";
