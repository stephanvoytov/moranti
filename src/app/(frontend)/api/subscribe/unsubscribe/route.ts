/* =============================================
    GET /api/subscribe/unsubscribe?token=... — отписка от рассылки.
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
      text: "Ссылка отписки неполная — попробуйте скопировать её из письма целиком.",
      status: 400,
    });
  }

  try {
    const sub = await prismaQuery(() =>
      prisma.subscriber.findUnique({ where: { unsubscribeToken: token } }),
    );

    if (!sub) {
      return simpleHtmlPage({
        title: "Подписка не найдена",
        text: "Возможно, вы уже отписались ранее. Если письма продолжают приходить — напишите нам через форму на сайте.",
        status: 404,
      });
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
    return simpleHtmlPage({
      title: "Что-то пошло не так",
      text: "Не удалось отписаться. Попробуйте позже — ссылка в письме остаётся действительной.",
      status: 500,
    });
  }
}
