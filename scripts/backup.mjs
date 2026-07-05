import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFileSync, writeFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
const m = env.match(/DATABASE_URL="([^"]+)"/);
if (m) process.env.DATABASE_URL = m[1];

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL || "" }),
});

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

async function query(fn) {
  for (let i = 1; i <= 3; i++) {
    try { return await withTimeout(fn(), 30000); }
    catch (e) {
      console.log(`  attempt ${i}: ${(e.message || '').substring(0, 60)}`);
      if (i < 3) await new Promise(r => setTimeout(r, 3000));
    }
  }
  throw new Error('failed after 3 attempts');
}

try {
  console.log('1: warmup...');
  await query(() => prisma.$queryRawUnsafe('SELECT 1'));
  console.log('2: fetching products...');
  const products = await query(() => prisma.product.findMany({
    include: { model: true },
    orderBy: { id: 'asc' },
  }));
  console.log(`   ${products.length} products`);
  console.log('3: fetching models...');
  const models = await query(() => prisma.model.findMany({ orderBy: { id: 'asc' } }));
  console.log(`   ${models.length} models`);
  console.log('4: fetching settings...');
  const settings = await query(() => prisma.settings.findFirst());
  console.log('   settings:', settings ? 'found' : 'not found');

  // BigInt → Number для JSON.stringify
  const replacer = (key, value) => typeof value === 'bigint' ? Number(value) : value;
  const json = JSON.stringify({ products, models, settings, exportedAt: new Date().toISOString() }, replacer, 2);
  writeFileSync('backup-moranti.json', json);
  console.log(`\n✅ Backup saved: backup-moranti.json (${(Buffer.byteLength(json) / 1024 / 1024).toFixed(2)} MB)`);
} catch (e) {
  console.log('ERROR:', e.message || e);
}

await prisma.$disconnect();
