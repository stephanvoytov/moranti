/* =============================================
   POST /api/admin/login
   Body: { "password": "..." }
   ============================================= */

import { NextRequest, NextResponse } from "next/server";
import { login, setSessionCookie } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = body?.password;

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    const session = login(password);
    if (!session) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.headers.set("Set-Cookie", setSessionCookie(session));
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
