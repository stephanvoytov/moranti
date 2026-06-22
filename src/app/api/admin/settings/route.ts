/* =============================================
   Admin Settings API — GET, PUT
   Protected: requires valid admin session
   ============================================= */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/admin-auth";
import { csrfGuard } from "@/lib/csrf";
import { enforceRateLimit } from "@/lib/rate-limit";
import { settingsSchema } from "@/lib/schemas";
import { readSettings, writeSettings } from "@/lib/settings";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const settings = await readSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rl = enforceRateLimit(request);
  if (rl) return rl;

  try {
    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const updated = await writeSettings(parsed.data);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
