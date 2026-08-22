/* =============================================
    POST /api/question — «Задать вопрос»
    Публичный роут (без авторизации): honeypot + валидация Zod.
    Письмо уходит владельцу (settings.contactEmail), Reply-To —
    email клиента, чтобы владелец отвечал одной кнопкой.
   ============================================= */

import { NextResponse } from "next/server";
import { questionSchema } from "@/lib/schemas";
import { readSettings } from "@/lib/settings";
import { sendQuestionEmail, isMailConfigured } from "@/lib/mailer";
import { logger } from "@/lib/logger";

const siteUrl = process.env.SITE_URL || "http://localhost:3001";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = questionSchema.safeParse(body);

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

    const settings = await readSettings();
    const recipient =
      settings.contactEmail || process.env.QUESTION_EMAIL || "";

    if (!isMailConfigured() || !recipient) {
      logger.warn("Question skipped — mail not configured", {
        hasSmtp: isMailConfigured(),
        hasRecipient: Boolean(recipient),
      });
      return NextResponse.json(
        { error: "Форма временно недоступна. Напишите нам в VK, пожалуйста." },
        { status: 503 },
      );
    }

    const productUrl = parsed.data.productSlug
      ? `${siteUrl}/catalog/${parsed.data.productSlug}`
      : undefined;

    await sendQuestionEmail(
      {
        name: parsed.data.name,
        fromEmail: parsed.data.email,
        question: parsed.data.question,
        productUrl,
      },
      recipient,
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("Question email failed", { error: (err as Error)?.message });
    return NextResponse.json(
      { error: "Не удалось отправить вопрос. Попробуйте позже." },
      { status: 500 },
    );
  }
}
