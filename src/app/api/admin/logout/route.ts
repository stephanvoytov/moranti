/* =============================================
   POST /api/admin/logout
   ============================================= */

import { NextRequest, NextResponse } from "next/server";
import { csrfGuard } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
