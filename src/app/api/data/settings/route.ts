/* =============================================
   Public Settings API — GET
   Returns site settings (hero, contacts, social, etc.)
   ============================================= */

import { NextResponse } from "next/server";
import { readSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = readSettings();
  return NextResponse.json(settings, {
    headers: {
      "Cache-Control": "public, max-age=30, s-maxage=30, stale-while-revalidate=120",
    },
  });
}
