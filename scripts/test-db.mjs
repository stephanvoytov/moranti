// Test DB connectivity
import pg from 'pg';
const { Pool } = pg;

async function main() {
  // Try pooled (PgBouncer)
  console.log('--- Testing PgBouncer (port 6543) ---');
  const pool1 = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL,
    ssl: { rejectUnauthorized: true },
    connectionTimeoutMillis: 10000,
  });
  try {
    const res = await pool1.query('SELECT COUNT(*) as cnt FROM "Product"');
    console.log('PgBouncer OK:', res.rows[0].cnt, 'products');
  } catch (e) {
    console.error('PgBouncer FAIL:', e.message);
    console.error('Code:', e.code);
  }
  await pool1.end();

  // Try direct
  console.log('\n--- Testing Direct (port 5432) ---');
  const pool2 = new Pool({
    connectionString: process.env.DIRECT_URL || process.env.POSTGRES_URL_NON_POOLING,
    ssl: { rejectUnauthorized: true },
    connectionTimeoutMillis: 10000,
  });
  try {
    const res = await pool2.query('SELECT COUNT(*) as cnt FROM "Product"');
    console.log('Direct OK:', res.rows[0].cnt, 'products');
  } catch (e) {
    console.error('Direct FAIL:', e.message);
    console.error('Code:', e.code);
  }
  await pool2.end();
}

main().catch(console.error);
