/* =============================================
    Moranti — почтовый модуль.
    SMTP через env (Vercel). В dev без кредов — лог в консоль.
   ============================================= */

import nodemailer from "nodemailer";
import { logger } from "@/lib/logger";

const cfg = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  from: process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@moranti.ru",
  adminEmail:
    process.env.ADMIN_EMAIL ||
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    "admin@moranti.ru",
};

function hasSmtp(): boolean {
  return Boolean(cfg.host && cfg.user && cfg.pass);
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: { user: cfg.user, pass: cfg.pass },
    });
  }
  return transporter;
}

export interface MailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendMail(input: MailInput): Promise<{ dev?: boolean }> {
  if (!hasSmtp()) {
    // Dev-режим: не падаем, просто логируем.
    console.log(
      "[mail:dev]",
      JSON.stringify({ to: input.to, subject: input.subject }),
    );
    return { dev: true };
  }

  await getTransporter().sendMail({
    from: cfg.from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text || input.html.replace(/<[^>]+>/g, " "),
  });
  return {};
}

export function getAdminEmail(): string {
  return cfg.adminEmail;
}

export interface QuestionEmailPayload {
  /** Имя посетителя (необязательно) */
  name?: string;
  /** Email клиента — куда владелец ответит (Reply-To) */
  fromEmail: string;
  question: string;
  productUrl?: string;
}

export function isMailConfigured(): boolean {
  return getTransporter() !== null;
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

/**
 * Double opt-in: письмо подтверждения подписки — отправляется САМОМУ подписчику.
 */
export async function sendDoubleOptInEmail(opts: {
  to: string;
  confirmUrl: string;
  unsubscribeUrl: string;
}): Promise<void> {
  const tx = getTransporter();
  if (!tx) throw new Error("SMTP is not configured");

  const { to, confirmUrl, unsubscribeUrl } = opts;
  const siteName = "Moranti";

  await tx.sendMail({
    from: `"${siteName}" <${process.env.SMTP_USER}>`,
    to,
    subject: `Подтвердите подписку на рассылку ${siteName}`,
    text: [
      `Здравствуйте!`,
      ``,
      `Спасибо за интерес к ${siteName}. Чтобы подтвердить подписку на рассылку`,
      `о новых коллекциях и поступлениях, перейдите по ссылке:`,
      confirmUrl,
      ``,
      `Если вы не подписывались — просто проигнорируйте это письмо.`,
      ``,
      `Отписаться: ${unsubscribeUrl}`,
      ``,
      `С уважением,`,
      `Команда ${siteName}`,
    ].join("\n"),
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #1A1614;">
        <h2 style="font-family: 'Playfair Display', Georgia, serif;">Подтвердите подписку</h2>
        <p>Спасибо за интерес к <b>${siteName}</b>. Чтобы подтвердить подписку на рассылку о новых коллекциях и поступлениях, нажмите кнопку:</p>
        <p>
          <a href="${confirmUrl}" style="display: inline-block; padding: 12px 28px; background: #C49A6C; color: #fff; text-decoration: none; font-family: 'Montserrat', sans-serif; letter-spacing: 0.05em;">Подтвердить подписку</a>
        </p>
        <p style="color: #6B6560; font-size: 13px;">Если вы не подписывались — просто проигнорируйте это письмо.</p>
        <p style="color: #6B6560; font-size: 13px;"><a href="${unsubscribeUrl}">Отписаться</a> от рассылки.</p>
      </div>
    `,
  });

  logger.info("Double opt-in email sent", { to });
}
