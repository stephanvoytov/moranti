#!/usr/bin/env node
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const prisma = new PrismaClient();

async function main() {
  // Все модели
  const models = await prisma.model.findMany({ orderBy: { id: "asc" } });
  console.log("=== Все модели (" + models.length + ") ===\n");
  for (const m of models) {
    console.log("  " + m.id + ": " + m.name);
    console.log("    slug=" + m.slug + " category=" + m.category);
    console.log("    composition=" + m.composition);
    console.log("    dimensions=" + m.dimensions);
    console.log("    image=" + (m.image || "null"));
    const count = await prisma.product.count({ where: { modelId: m.id } });
    console.log("    variants=" + count);
    console.log("");
  }

  // Продукты без модели
  const noModel = await prisma.product.findMany({
    where: { modelId: null },
    take: 5,
    orderBy: { id: "asc" },
    select: { id: true, name: true, wbArticle: true, ozonArticle: true, category: true, modelId: true },
  });
  console.log("=== Продукты без модели (первые 5) ===");
  for (const p of noModel) {
    console.log("  " + p.id + ": " + p.name);
    console.log("    wbArt=" + p.wbArticle + " ozonArt=" + p.ozonArticle + " category=" + p.category);
  }

  // Посмотрим: у каких продуктов проставлена modelId
  const withModel = await prisma.product.count({ where: { modelId: { not: null } } });
  const total = await prisma.product.count();
  console.log("\n=== Статистика ===");
  console.log("  С моделью: " + withModel + "/" + total);
}

main().catch(console.error).finally(() => prisma.$disconnect());
