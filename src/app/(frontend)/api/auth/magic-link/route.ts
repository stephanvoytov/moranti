import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { randomBytes } from "crypto";
import { sendMail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Укажите email" }, { status: 400 });
    }

    const payload = await getPayload({ config });
    const origin = new URL(request.url).origin;

    let existing = await payload.find({
      collection: "customers",
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    });

    if (existing.totalDocs === 0) {
      // Создаём аккаунт (пароль всё равно не нужен — вход по ссылке)
      await payload.create({
        collection: "customers",
        overrideAccess: true,
        data: {
          email,
          password: randomBytes(16).toString("hex"),
        },
      });
      existing = await payload.find({
        collection: "customers",
        where: { email: { equals: email } },
        limit: 1,
        overrideAccess: true,
      });
    }

    const customer = existing.docs[0] as { id: string | number };
    const token = randomBytes(24).toString("hex");
    const expiry = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    await payload.update({
      collection: "customers",
      id: customer.id,
      overrideAccess: true,
      data: { magicToken: token, magicTokenExpiry: expiry },
    });

    const link = `${origin}/api/auth/magic?token=${token}&email=${encodeURIComponent(email)}`;

    try {
      await sendMail({
        to: email,
        subject: "Вход в аккаунт Moranti",
        html: `
          <h2>Вход в аккаунт Moranti</h2>
          <p>Нажмите на ссылку, чтобы войти в личный кабинет:</p>
          <p><a href="${link}" style="color:#8B6F5C;font-weight:600">Войти в аккаунт →</a></p>
          <p style="color:#888;font-size:12px">Ссылка действует 30 минут. Если это были не вы — просто проигнорируйте письмо.</p>
        `,
      });
    } catch (e) {
      return NextResponse.json(
        { error: "Не удалось отправить письмо" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 },
    );
  }
}
