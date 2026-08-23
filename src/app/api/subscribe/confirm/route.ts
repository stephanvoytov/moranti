/* =============================================
    GET /api/subscribe/confirm?token=... — подтверждение подписки.
   ============================================= */

import { NextResponse } from "next/server";
import prisma, { prismaQuery } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { simpleHtmlPage } from "@/lib/simple-html";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return simpleHtmlPage({
      title: "Неверная ссылка",
      text: "Ссылка подтверждения неполная — попробуйте скопировать её из письма целиком.",
      status: 400,
    });
  }

  try {
    const sub = await prismaQuery(() =>
      prisma.subscriber.findUnique({ where: { confirmToken: token } }),
    );

    if (!sub || sub.unsubscribedAt) {
      return simpleHtmlPage({
        title: "Ссылка недействительна",
        text: "Подписка не найдена или была отменена. Если это ошибка — оформите подписку заново на сайте.",
        status: 404,
      });
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
    return simpleHtmlPage({
      title: "Что-то пошло не так",
      text: "Не удалось подтвердить подписку. Попробуйте позже — ссылка в письме остаётся действительной.",
      status: 500,
    });
  }
}
