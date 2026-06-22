import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
try {
  const rows = await db.product.findMany({
    where: { wbArticle: { not: null } },
    select: { id: true, wbArticle: true },
    orderBy: { wbArticle: 'asc' },
  });
  const articles = rows.map(r => r.wbArticle);
  console.log(articles.join(';'));
} finally {
  await db.$disconnect();
}
