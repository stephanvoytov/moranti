/* =============================================
   Admin WB Sync API — POST (start), GET (status)
   Protected: requires valid admin session
   ============================================= */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/admin-auth";
import { csrfGuard } from "@/lib/csrf";
import { enforceRateLimit } from "@/lib/rate-limit";
import { runWbSync } from "@/lib/wb-sync";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { readFileSync, existsSync } = await import("fs");
    const path = await import("path");
    const logPath = path.join(process.cwd(), "data", "sync-log.json");
    if (existsSync(logPath)) {
      return NextResponse.json(JSON.parse(readFileSync(logPath, "utf-8")));
    }
  } catch {
    // log not available
  }

  return NextResponse.json({ status: "unknown" });
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
    const result = await runWbSync();
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
