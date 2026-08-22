/* =============================================
    GET /api/subscribe/confirm?token=... — подтверждение подписки.
   ============================================= */

import { NextResponse } from "next/server";
import prisma, { prismaQuery } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Неверная ссылка подтверждения" }, { status: 400 });
  }

  try {
    const sub = await prismaQuery(() =>
      prisma.subscriber.findUnique({ where: { confirmToken: token } }),
    );

    if (!sub || sub.unsubscribedAt) {
      return NextResponse.json(
        { error: "Подписка не найдена или отменена" },
        { status: 404 },
      );
    }

    await prismaQuery(() =>
      prisma.subscriber.update({
        where: { id: sub.id },
        data: { confirmed: true, confirmedAt: new Date() },
      }),
    );

    return NextResponse.redirect(new URL("/?subscribed=1", request.url));
  } catch (err) {
    logger.error("Subscribe confirm failed", { error: (err as Error)?.message });
    return NextResponse.json({ error: "Ошибка подтверждения" }, { status: 500 });
  }
}
