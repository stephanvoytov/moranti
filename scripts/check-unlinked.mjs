import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const products = await prisma.product.findMany({
  where: { modelId: null, archivedAt: null },
  orderBy: { id: "asc" },
});

console.log(`Unlinked products (${products.length}):`);
for (const p of products) {
  console.log(`  ${p.id} | ${p.name.slice(0, 40)} | wb:${p.wbArticle || "-"} | ozon:${p.ozonArticle || "-"}`);
}

await prisma.$disconnect();
