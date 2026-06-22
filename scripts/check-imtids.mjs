import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

async function main() {
  const db = new PrismaClient();
  try {
    const rows = await db.product.findMany({
      where: { wbArticle: { not: null } },
      select: { id: true, wbArticle: true, imtId: true },
      orderBy: { wbArticle: 'asc' },
    });
    const withImt = rows.filter(x => x.imtId);
    console.log('Total:', rows.length, 'With imtId:', withImt.length);
    for (const x of withImt) {
      console.log(x.id, 'article=' + x.wbArticle, 'imtId=' + x.imtId);
    }
  } finally {
    await db.$disconnect();
  }
}

main().catch(console.error);
