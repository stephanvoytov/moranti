#!/usr/bin/env node
/**
 * apply-categories.mjs — Применяет inferCategory() ко всем товарам в БД
 */

import { PrismaClient } from "@prisma/client";
import { inferCategory } from "./infer-category.mjs";

const prisma = new PrismaClient();

async function main() {
  console.log("=== apply-categories ===\n");

  console.log("Fetching products...");
  const products = await prisma.product.findMany({
    where: { archivedAt: null },
  });
  console.log("Active products:", products.length, "\n");

  const counts = { before: {}, after: {} };
  let changed = 0;
  let unchanged = 0;

  for (const p of products) {
    counts.before[p.category] = (counts.before[p.category] || 0) + 1;
  }

  console.log("Before:");
  for (const [cat, n] of Object.entries(counts.before).sort()) {
    console.log(`  ${cat}: ${n}`);
  }

  for (const p of products) {
    const inferred = inferCategory({
      name: p.name,
      characteristics: p.characteristics || [],
      root: p.imtId ? Number(p.imtId) : undefined,
    });

    if (inferred !== p.category) {
      await prisma.product.update({
        where: { id: p.id },
        data: { category: inferred },
      });
      console.log(`  ${p.id} ${p.category} → ${inferred}`);
      changed++;
    } else {
      unchanged++;
    }
  }

  const after = await prisma.product.findMany({
    where: { archivedAt: null },
  });
  for (const p of after) {
    counts.after[p.category] = (counts.after[p.category] || 0) + 1;
  }

  console.log("\nAfter:");
  for (const [cat, n] of Object.entries(counts.after).sort()) {
    console.log(`  ${cat}: ${n}`);
  }

  console.log(`\nChanged: ${changed}`);
  console.log(`Unchanged: ${unchanged}`);
  console.log("\n=== Done ===");
}

main()
  .catch((e) => {
    console.error("FATAL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
