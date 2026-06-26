/* =============================================
   GET /api/admin/sync-status
   Возвращает историю синхронизации (WB + Ozon).
   Protected: требует сессии.
   ============================================= */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/admin-auth";
import { getSyncHistory } from "@/lib/sync-history";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const wb = getSyncHistory("wb");
  const ozon = getSyncHistory("ozon");

  return NextResponse.json({ wb, ozon });
}
