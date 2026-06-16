/* =============================================
   POST /api/admin/logout
   ============================================= */

import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.headers.set(
    "Set-Cookie",
    "admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
  );
  return response;
}
