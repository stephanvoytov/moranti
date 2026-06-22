/* =============================================
   POST /api/admin/login
   Body: { "password": "..." }
   Simple in-memory rate limiter (5 попыток / 15s)
   ============================================= */

import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/admin-auth";

/* ——— Rate limiter ——— */

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return false;
  }

  entry.count++;
  return true;
}

/* ——— Route ——— */

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "127.0.0.1";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const password = body?.password;

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    const session = login(password);
    if (!session) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Сбросить счётчик при успешном входе
    loginAttempts.delete(ip);

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
