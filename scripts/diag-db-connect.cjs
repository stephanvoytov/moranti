/**
 * Временный диагностический скрипт (PR-ветка): печатает, к какому хосту/порту
 * реально подключается GitHub Actions, резолвит DNS и проверяет TCP + pg-хендшейк.
 * Удаляется вместе с PR.
 */
const net = require("net");
const dns = require("dns").promises;

const raw = process.env.DATABASE_URL || "";
const log = (...a) => console.log("[diag]", ...a);

async function tcp(host, port, label, timeoutMs = 20000) {
  const t = Date.now();
  return new Promise((res) => {
    const s = net.connect(port, host);
    s.setTimeout(timeoutMs);
    const done = (msg) => {
      console.log(`[diag] ${label} ${host}:${port} -> ${msg} (${Date.now() - t}ms)`);
      s.destroy();
      res();
    };
    s.on("connect", () => done("TCP OK"));
    s.on("timeout", () => done("TCP TIMEOUT"));
    s.on("error", (e) => done(`TCP ERROR ${e.code}`));
  });
}

(async () => {
  log("DATABASE_URL present:", raw.length > 0, "length:", raw.length);

  let u = null;
  try {
    u = new URL(raw);
    log("parsed host:", u.hostname);
    log("parsed port:", u.port || "(not set -> pg default 5432)");
    log("parsed db:", u.pathname);
    log("parsed user:", u.username);
    log("has password:", u.password.length > 0);
  } catch (e) {
    log("URL parse failed:", e.message);
    return;
  }

  try {
    log("dns resolve4:", JSON.stringify(await dns.resolve4(u.hostname)));
  } catch (e) {
    log("dns resolve4 failed:", e.code || e.message);
  }

  const port = Number(u.port || 5432);
  await tcp(u.hostname, port, "secret-target");
  await tcp("main-server-vsv.duckdns.org", 55432, "expected-target");

  try {
    const { Client } = require("pg");
    const t = Date.now();
    const c = new Client({ connectionString: raw, connectionTimeoutMillis: 15000 });
    await c.connect();
    const r = await c.query("select count(*)::int as n from \"Product\"");
    log("pg OK in", Date.now() - t, "ms, Product rows:", r.rows[0].n);
    await c.end();
  } catch (e) {
    log("pg FAILED:", e.code || "", e.message);
  }
})();
