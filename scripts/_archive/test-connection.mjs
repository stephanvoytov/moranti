console.log("1. Starting...");
const { PrismaClient } = await import("@prisma/client");
console.log("2. Prisma imported");
const prisma = new PrismaClient();
console.log("3. Client created");
try {
  const count = await prisma.product.count({ where: { wbArticle: { not: null } } });
  console.log("4. Products with wbArticle:", count);
} catch (e) {
  console.log("4. Error:", e.message);
}
await prisma.$disconnect();
console.log("5. Done");
