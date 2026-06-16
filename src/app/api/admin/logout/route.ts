/* =============================================
   POST /api/admin/logout
   ============================================= */

import { NextRequest, NextResponse } from "next/server";
import { csrfGuard } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const response = NextResponse.json({ ok: true });
  response.headers.set(
    "Set-Cookie",
    "admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
  );
  return response;
}
