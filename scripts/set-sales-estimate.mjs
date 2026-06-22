// Estimate salesCount from feedbacks count
// On WB, ~5-10% of buyers leave a review, so sales ~ feedbacks * 15
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

async function main() {
  const db = new PrismaClient();
  try {
    const rows = await db.product.findMany({
      where: { wbArticle: { not: null } },
      select: { id: true, wbArticle: true, reviewsCount: true },
      orderBy: { wbArticle: 'asc' },
    });

    let updated = 0;
    for (const p of rows) {
      const reviews = p.reviewsCount || 0;
      const estimatedSales = Math.round(reviews * 15);
      await db.product.update({
        where: { id: p.id },
        data: { salesCount: estimatedSales > 0 ? estimatedSales : null },
      });
      updated++;
    }
    console.log('Updated ' + updated + ' products');

    const sample = await db.product.findMany({
      where: { salesCount: { not: null } },
      select: { id: true, reviewsCount: true, salesCount: true },
      orderBy: { salesCount: 'desc' },
      take: 5,
    });
    for (const s of sample) {
      console.log('  ' + s.id + ': reviews=' + s.reviewsCount + ' -> sales~' + s.salesCount);
    }
  } finally {
    await db.$disconnect();
  }
}

main().catch(console.error);
