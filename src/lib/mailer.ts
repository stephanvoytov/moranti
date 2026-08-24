/* =============================================
    Moranti — почтовый модуль.
    SMTP через env (Vercel). В dev без кредов — лог в консоль.
   ============================================= */

import nodemailer from "nodemailer";

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
