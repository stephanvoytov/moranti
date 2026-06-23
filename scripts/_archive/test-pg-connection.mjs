import { readFileSync } from "fs";

// Read .env manually
const env = readFileSync(".env", "utf-8");
const match = env.match(/DATABASE_URL="([^"]+)"/);
if (!match) {
  console.error("DATABASE_URL not found in .env");
  process.exit(1);
}

const url = match[1];
console.log("URL:", url.replace(/:[^@]+@/, ":****@"));

const pg = await import("pg");

const client = new pg.Client({
  connectionString: url,
  connectionTimeoutMillis: 15000,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log("Connected!");
  const res = await client.query("SELECT version()");
  console.log("Version:", res.rows[0].version);
  const count = await client.query("SELECT COUNT(*) FROM \"Product\"");
  console.log("Products count:", count.rows[0].count);
  await client.end();
} catch (e) {
  console.error("Connection error:", e.message);
  // Try without ssl
  console.log("Trying without SSL...");
  try {
    const client2 = new pg.Client({
      connectionString: url,
      connectionTimeoutMillis: 15000,
      ssl: false,
    });
    await client2.connect();
    console.log("Connected without SSL!");
    await client2.end();
  } catch (e2) {
    console.error("Also failed:", e2.message);
  }
}
