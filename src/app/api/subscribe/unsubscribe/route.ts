/* =============================================
    GET /api/subscribe/unsubscribe?token=... — отписка от рассылки.
   ============================================= */

import { NextResponse } from "next/server";
import prisma, { prismaQuery } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Неверная ссылка отписки" }, { status: 400 });
  }

  try {
    const sub = await prismaQuery(() =>
      prisma.subscriber.findUnique({ where: { unsubscribeToken: token } }),
    );

    if (!sub) {
      return NextResponse.json({ error: "Подписка не найдена" }, { status: 404 });
    }

    await prismaQuery(() =>
      prisma.subscriber.update({
        where: { id: sub.id },
        data: { unsubscribedAt: new Date(), confirmed: false },
      }),
    );

    return NextResponse.redirect(new URL("/?unsubscribed=1", request.url));
  } catch (err) {
    logger.error("Unsubscribe failed", { error: (err as Error)?.message });
    return NextResponse.json({ error: "Ошибка отписки" }, { status: 500 });
  }
}
