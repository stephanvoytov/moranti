// Populate rating, reviewsCount, salesCount for all products
// Run: node scripts/populate-data.mjs

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Realistic data per category
const categoryData = {
  crossbody: { ratingMin: 4.2, ratingMax: 4.9, reviewsBase: 15, salesBase: 40 },
  'na-plecho': { ratingMin: 4.0, ratingMax: 4.8, reviewsBase: 20, salesBase: 55 },
  baguette: { ratingMin: 4.3, ratingMax: 5.0, reviewsBase: 10, salesBase: 30 },
  tote: { ratingMin: 4.1, ratingMax: 4.7, reviewsBase: 25, salesBase: 70 },
  saddle: { ratingMin: 4.0, ratingMax: 4.6, reviewsBase: 8, salesBase: 25 },
  backpack: { ratingMin: 4.4, ratingMax: 4.9, reviewsBase: 12, salesBase: 35 },
};

function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function randBetween(rand, min, max) {
  return min + rand() * (max - min);
}

async function main() {
  const products = await prisma.product.findMany({ orderBy: { id: 'asc' } });
  console.log(`Found ${products.length} products`);

  let updated = 0;
  for (const p of products) {
    const cat = p.category || 'crossbody';
    const cfg = categoryData[cat] || categoryData.crossbody;
    const rand = rng(parseInt(p.id.split('-').pop() || '1', 10) || 1);

    const rating = Math.round(randBetween(rand, cfg.ratingMin, cfg.ratingMax) * 10) / 10;
    const reviewsCount = Math.floor(randBetween(rand, cfg.reviewsBase * 0.3, cfg.reviewsBase * 2));
    const salesCount = Math.floor(randBetween(rand, cfg.salesBase * 0.3, cfg.salesBase * 3));

    await prisma.product.update({
      where: { id: p.id },
      data: { rating, reviewsCount, salesCount },
    });
    updated++;
  }

  console.log(`Updated ${updated} products with rating/reviewsCount/salesCount`);

  // Show sample
  const sample = await prisma.product.findMany({ take: 3, orderBy: { id: 'asc' } });
  for (const s of sample) {
    console.log(`  ${s.id}: rating=${s.rating}, reviews=${s.reviewsCount}, sales=${s.salesCount}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
