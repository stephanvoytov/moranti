/* =============================================
   Moranti — Admin Auth
   Сессия в encrypted cookie (AES-256-GCM).
   Нет серверного состояния — переживает hot reload.
   ============================================= */

import { cookies } from "next/headers";
import crypto from "crypto";

/* ——— Constants ——— */

const COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 24 * 60 * 60 * 1_000;
const ALGORITHM = "aes-256-gcm";
const KEY_ITERATIONS = 100_000;
const KEY_LENGTH = 32;
const SALT = "moranti-admin-salt-v1";

/* ——— Crypto helpers ——— */

function deriveKey(password: string): Buffer {
  return crypto.pbkdf2Sync(password, SALT, KEY_ITERATIONS, KEY_LENGTH, "sha256");
}

function encrypt(data: string, key: Buffer): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let enc = cipher.update(data, "utf8", "hex");
  enc += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${tag}:${enc}`;
}

function decrypt(payload: string, key: Buffer): string | null {
  try {
    const parts = payload.split(":");
    if (parts.length !== 3) return null;
    const iv = Buffer.from(parts[0], "hex");
    const tag = Buffer.from(parts[1], "hex");
    const data = parts[2];
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    let out = decipher.update(data, "hex", "utf8");
    out += decipher.final("utf8");
    return out;
  } catch {
    return null;
  }
}

/* ——— Public API ——— */

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin";
}

/** Проверить пароль и вернуть зашифрованный токен (или null) */
export function login(password: string): string | null {
  if (password !== getAdminPassword()) return null;

  const now = Date.now();
  const payload = JSON.stringify({
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  });

  const key = deriveKey(getAdminPassword());
  return encrypt(payload, key);
}

/** Прочитать и верифицировать сессию из куки */
export async function getSession(): Promise<{ createdAt: number; expiresAt: number } | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const key = deriveKey(getAdminPassword());
  const raw = decrypt(token, key);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) return null;
    return session;
  } catch {
    return null;
  }
}

export function setSessionCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1_000}`;
}

export function clearSession(): Response {
  return new Response(null, {
    status: 200,
    headers: {
      "Set-Cookie": `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    },
  });
}
