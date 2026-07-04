/* =============================================
   POST /api/admin/login
   Body: { "password": "..." }
   Rate limit: 5 попыток / 15s
   ============================================= */

import { NextRequest, NextResponse } from "next/server";
import { login, setSessionCookie } from "@/lib/admin-auth";
import { loginSchema } from "@/lib/schemas";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { rateLimitResponse } from "@/lib/rate-limit";

const LOGIN_OPTS = { max: 15, windowMs: 60_000 };

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

    // Используем единый setSessionCookie из admin-auth
    const cookieHeader = setSessionCookie(session);
    return new NextResponse(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Set-Cookie": cookieHeader, "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
