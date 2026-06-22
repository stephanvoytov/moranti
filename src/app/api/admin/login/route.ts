/* =============================================
   POST /api/admin/login
   Body: { "password": "..." }
   Rate limit: 5 попыток / 15s
   ============================================= */

import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/admin-auth";
import { loginSchema } from "@/lib/schemas";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const LOGIN_OPTS = { max: 5, windowMs: 15_000 };

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // Rate limit
  const rl = enforceRateLimit(request, LOGIN_OPTS);
  if (rl) return rl;

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Password required", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const session = login(parsed.data.password);
    if (!session) {
      logger.warn("Login failed", { ip });
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    logger.info("Login successful", { ip });

    const response = NextResponse.json({ ok: true });
    response.cookies.set("admin_session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 86400, // 24h
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
