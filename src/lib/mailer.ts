/* =============================================
    Moranti — Mailer (nodemailer, SMTP)
    Отправка вопросов из формы «Задать вопрос».

    Env:
      SMTP_HOST, SMTP_PORT (465 = implicit TLS, 587 = STARTTLS),
      SMTP_USER, SMTP_PASS
    Получатель: settings.contactEmail (админка) или QUESTION_EMAIL env.
   ============================================= */

import nodemailer, { type Transporter } from "nodemailer";
import { logger } from "@/lib/logger";

let transporter: Transporter | null = null;

/** Ленивая инициализация: null, если SMTP не настроен */
function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    logger.warn("SMTP not configured — question email skipped", {
      hasHost: Boolean(host),
      hasUser: Boolean(user),
    });
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

export function isMailConfigured(): boolean {
  return getTransporter() !== null;
}

export interface QuestionEmailPayload {
  /** Имя посетителя (необязательно) */
  name?: string;
  /** Email клиента — куда владелец ответит (Reply-To) */
  fromEmail: string;
  question: string;
  productUrl?: string;
}

/**
 * Отправка вопроса владельцу.
 * @param to получатель — settings.contactEmail из админки (fallback: QUESTION_EMAIL env)
 */
export async function sendQuestionEmail(
  payload: QuestionEmailPayload,
  to?: string,
): Promise<void> {
  const tx = getTransporter();
  if (!tx) throw new Error("SMTP is not configured");

  const recipient = to || process.env.QUESTION_EMAIL || "";
  if (!recipient) throw new Error("Recipient email (contactEmail / QUESTION_EMAIL) is not set");

  const { name, fromEmail, question, productUrl } = payload;
  const siteName = "Moranti";
  const signature = name ? `\n\nС уважением,\n${name}` : "";

  await tx.sendMail({
    from: `"${siteName} — сайт" <${process.env.SMTP_USER}>`,
    to: recipient,
    replyTo: fromEmail,
    subject: `Вопрос с сайта${productUrl ? " (товар)" : ""}`,
    text: [
      `Вопрос от посетителя сайта:`,
      "",
      question + signature,
      "",
      `Email для ответа: ${fromEmail}`,
      productUrl ? `Товар: ${productUrl}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    html: `
      <h2>Вопрос с сайта ${siteName}</h2>
      ${productUrl ? `<p><b>Товар:</b> <a href="${productUrl}">${productUrl}</a></p>` : ""}
      <p>${(question + signature).replace(/\n/g, "<br/>")}</p>
      <hr/>
      <p><b>Email для ответа:</b> <a href="mailto:${fromEmail}">${fromEmail}</a></p>
    `,
  });

  logger.info("Question email sent", { to: recipient, productUrl: productUrl || "-" });
}
