import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
try {
  const r = await prisma.product.findFirst({
    where: { id: "mor-001" },
    select: { id: true, image: true, images: true },
  });
  console.log("image:", r.image?.substring(0, 80));
  console.log("images[0]:", r.images?.[0]?.substring(0, 80));
  console.log("match:", r.image === r.images?.[0]);
  console.log("images length:", r.images?.length);
} finally {
  await prisma.$disconnect();
}
