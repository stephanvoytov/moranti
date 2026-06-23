import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const prods = await prisma.product.findMany({
    where: { wbArticle: { not: null } },
    select: { id: true, wbArticle: true, name: true },
    orderBy: { wbArticle: 'asc' },
  });
  console.log(`Products with WB articles: ${prods.length}`);
  for (const p of prods) {
    console.log(`${p.id.padEnd(10)} article=${p.wbArticle}  ${p.name}`);
  }
  await prisma.$disconnect();
}

main().catch(console.error);
