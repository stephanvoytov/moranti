/* =============================================
   GET /api/admin/me — проверка сессии
   ============================================= */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}
