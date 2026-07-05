/**
 * Re-generates human-readable slugs from sku (now product id).
 * 
 * Правила:
 * - CamelCase → kebab: BalensaTaup → balensa-taup
 * - / → -: Sopp0145/30Sopp01BL45/30 → sopp0145-30sopp01bl45-30
 * - numbers/titlecase split: Sopp01GR45/30 → sopp01-gr45-30
 * - уникальность гарантируется через usedSlugs
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugFromSku(sku) {
  // 1. Split CamelCase: BalensaTaup → balensa taup, Sopp01GR → sopp01 gr
  let s = sku
    .replace(/([a-z])([A-Z])/g, "$1-$2")     // aB → a-B
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2") // ABc → AB-c
    .toLowerCase();

  // 2. Replace / → -
  s = s.replace(/[/]+/g, "-");

  // 3. Clean up
  s = s
    .replace(/[^a-z0-9-]/g, "")   // remove anything not a-z, 0-9, -
    .replace(/-+/g, "-")           // -- → -
    .replace(/^-|-$/g, "");        // trim

  return s || "product";
}

async function main() {
  const dry = process.argv.includes("--dry");
  const products = await prisma.product.findMany({
    where: { archivedAt: null },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Generating slugs for ${products.length} active products\n`);

  const usedSlugs = new Set();
  let updated = 0;

  for (const p of products) {
    let slug = slugFromSku(p.sku || p.id);

    // Ensure uniqueness
    let finalSlug = slug;
    let counter = 1;
    while (usedSlugs.has(finalSlug)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }
    usedSlugs.add(finalSlug);

    if (finalSlug !== p.slug) {
      console.log(`  ${p.id}: ${p.slug} → ${finalSlug}`);
      if (!dry) {
        await prisma.product.update({
          where: { id: p.id },
          data: { slug: finalSlug },
        });
      }
      updated++;
    }
  }

  console.log(`\nDone: ${updated} slugs updated`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
