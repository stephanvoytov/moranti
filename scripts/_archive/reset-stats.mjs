import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const r = await prisma.product.updateMany({ data: { rating: null, reviewsCount: null, salesCount: null } });
  console.log(`Reset ${r.count} products`);
  await prisma.$disconnect();
}

main().catch(console.error);
