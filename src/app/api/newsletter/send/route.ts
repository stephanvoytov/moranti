import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import prisma, { prismaQuery } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";
import { buildNewsletterHtml } from "@/lib/newsletter-template";

/**
 * POST /api/newsletter/send — рассылка активным подписчикам.
 * Только для авторизованных в админке. Тема и текст приходят из глобала.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: req.headers });
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Требуется вход в админку" },
        { status: 401 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as {
      subject?: string;
      message?: unknown;
    };
    const subject = (body.subject || "").trim();
    const message = body.message;
    const hasMessage =
      message && typeof message === "object"
        ? JSON.stringify(message).length > 20
        : Boolean(String(message ?? "").trim());
    if (!subject || !hasMessage) {
      return NextResponse.json(
        { ok: false, error: "Заполните тему и текст письма" },
        { status: 400 },
      );
    }

    const subs = await payload.find({
      collection: "subscribers",
      where: { status: { equals: "active" } },
      limit: 1000,
      depth: 0,
      overrideAccess: false,
      user,
    });

    if (!subs.docs.length) {
      return NextResponse.json({
        ok: true,
        sent: 0,
        failed: 0,
        total: 0,
        note: "Активных подписчиков нет",
      });
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      "http://localhost:3000";

    let sent = 0;
    let failed = 0;

    for (const s of subs.docs) {
      // ссылка отписки: токен из prisma-таблицы Subscriber (double opt-in)
      let unsubscribeUrl: string | undefined;
      try {
        const legacy = await prismaQuery(() =>
          prisma.subscriber.findUnique({ where: { email: s.email } }),
        );
        if (legacy?.unsubscribeToken) {
          unsubscribeUrl = `${siteUrl}/api/subscribe/unsubscribe?token=${legacy.unsubscribeToken}`;
        }
      } catch {
        /* нет prisma/токена — fallback на mailto в шаблоне */
      }

      try {
        await sendMail({
          to: s.email,
          subject,
      html: buildNewsletterHtml({
        message: message as never,
        unsubscribeUrl,
        siteUrl,
      }),
        });
        sent++;
      } catch {
        failed++;
      }
    }

    return NextResponse.json({ ok: true, sent, failed, total: subs.docs.length });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error)?.message || "Ошибка отправки" },
      { status: 500 },
    );
  }
}
