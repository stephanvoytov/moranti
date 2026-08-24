import { NextResponse } from "next/server";
import { getPayload, generatePayloadCookie } from "payload";
import config from "@payload-config";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const fail = () =>
    NextResponse.redirect(new URL("/login?error=invalid", request.url));

  if (!token || !email) return fail();

  const payload = await getPayload({ config });

  const found = await payload.find({
    collection: "customers",
    where: {
      and: [
        { email: { equals: email } },
        { magicToken: { equals: token } },
        { magicTokenExpiry: { greater_than: new Date().toISOString() } },
      ],
    },
    limit: 1,
    overrideAccess: true,
    showHiddenFields: true,
  });

  if (found.totalDocs === 0) return fail();

  const customer = found.docs[0] as any;
  const oldHash = customer.hash;
  const oldSalt = customer.salt;
  const temp = randomBytes(16).toString("hex");

  await payload.update({
    collection: "customers",
    id: customer.id,
    overrideAccess: true,
    data: { password: temp, magicToken: "" },
  });

  const result = (await payload.login({
    collection: "customers",
    data: { email, password: temp },
    // Next.js Request совместим с Payload в рантайме
    req: request,
  })) as any;

  // Восстанавливаем прежний пароль, чтобы вход по ссылке не сбрасывал его.
  // shouldSavePassword срабатывает только если в data есть password, поэтому
  // передача hash/salt без password оставляет их без изменений (см. update.js).
  if (oldHash && oldSalt) {
    await payload.update({
      collection: "customers",
      id: customer.id,
      overrideAccess: true,
      showHiddenFields: true,
      data: { hash: oldHash, salt: oldSalt },
    });
  }

  const cookie = generatePayloadCookie({
    collectionAuthConfig: payload.collections.customers.config.auth,
    cookiePrefix: payload.config.cookiePrefix,
    token: result.token,
  });

  const res = NextResponse.redirect(new URL("/account", request.url));
  res.headers.set("Set-Cookie", cookie);
  return res;
}
