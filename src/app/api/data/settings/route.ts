/* =============================================
   Public Settings API — GET
   Returns site settings (hero, contacts, social, etc.)
   ============================================= */

import { NextResponse } from "next/server";
import { readSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = readSettings();
  return NextResponse.json(settings);
}
