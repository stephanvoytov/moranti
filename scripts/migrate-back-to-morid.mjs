// Скрипт: id → mor-NNN, текущий id → sku
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });
  console.log(`Total products: ${products.length}`);

  let seq = 1;
  for (const p of products) {
    const newId = "mor-" + String(seq).padStart(3, "0");
    console.log(`  ${p.id} → ${newId} (sku=${p.id})`);
    await prisma.$executeRawUnsafe(
      `UPDATE "Product" SET id = $1, sku = $2 WHERE id = $3`,
      newId, p.id, p.id
    );
    seq++;
  }
  console.log("Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
