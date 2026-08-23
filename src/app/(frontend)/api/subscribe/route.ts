/* =============================================
    POST /api/subscribe — подписка на рассылку (double opt-in).
    Публичный роут: honeypot + валидация Zod.
    Сохраняет подписчика и шлёт письмо с подтверждением.
   ============================================= */

import { NextResponse } from "next/server";
import { subscribeSchema } from "@/lib/schemas";
import prisma, { prismaQuery } from "@/lib/prisma";
import { sendDoubleOptInEmail, isMailConfigured } from "@/lib/mailer";
import { randomBytes } from "crypto";
import { logger } from "@/lib/logger";

const siteUrl = process.env.SITE_URL || "http://localhost:3001";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Некорректные данные" },
        { status: 400 },
      );
    }

    // Honeypot заполнен → бот. Отвечаем успехом, чтобы не палить защиту.
    if (parsed.data.website) {
      return NextResponse.json({ ok: true });
    }

    if (!isMailConfigured()) {
      logger.warn("Subscribe skipped — mail not configured");
      return NextResponse.json(
        { error: "Подписка временно недоступна." },
        { status: 503 },
      );
    }

    const email = parsed.data.email.toLowerCase().trim();

    const existing = await prismaQuery(() =>
      prisma.subscriber.findUnique({ where: { email } }),
    );

    // Уже подтверждён и активен — повторно не спамим.
    if (existing && existing.confirmed && !existing.unsubscribedAt) {
      return NextResponse.json({ ok: true });
    }

    const confirmToken = randomBytes(32).toString("hex");
    const unsubscribeToken = randomBytes(32).toString("hex");

    await prismaQuery(() =>
      prisma.subscriber.upsert({
        where: { email },
        update: {
          confirmToken,
          unsubscribeToken,
          consentedAt: new Date(),
          confirmed: false,
          confirmedAt: null,
          unsubscribedAt: null,
        },
        create: {
          email,
          confirmToken,
          unsubscribeToken,
          consentedAt: new Date(),
          source: "footer",
        },
      }),
    );

    const confirmUrl = `${siteUrl}/api/subscribe/confirm?token=${confirmToken}`;
    const unsubscribeUrl = `${siteUrl}/api/subscribe/unsubscribe?token=${unsubscribeToken}`;

    await sendDoubleOptInEmail({ to: email, confirmUrl, unsubscribeUrl });

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("Subscribe failed", { error: (err as Error)?.message });
    return NextResponse.json(
      { error: "Не удалось оформить подписку. Попробуйте позже." },
      { status: 500 },
    );
  }
}
