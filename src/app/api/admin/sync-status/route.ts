/* =============================================
   GET /api/admin/sync-status
   Возвращает статус последней синхронизации.
   Protected: требует сессии.
   ============================================= */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/admin-auth";
import { getSyncStatus } from "@/lib/wb-sync";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const status = getSyncStatus();
  return NextResponse.json(status || { neverRun: true });
}
