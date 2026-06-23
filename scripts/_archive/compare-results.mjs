import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

const scrape = JSON.parse(readFileSync("data/wb-scrape-result.json", "utf-8"));
const wbArticles = new Set(scrape.products.map((p) => p.article));
console.log("WB products:", wbArticles.size);

const prisma = new PrismaClient();
const dbProducts = await prisma.product.findMany({ orderBy: { wbArticle: "asc" } });
console.log("DB products:", dbProducts.length);

const dbWithWb = dbProducts.filter((p) => p.wbArticle);
console.log("DB with wbArticle:", dbWithWb.length);

const dbArticles = new Set(dbWithWb.map((p) => p.wbArticle));
console.log("DB unique articles:", dbArticles.size);

// Products in DB but NOT on WB
const missingFromWB = dbWithWb.filter((p) => !wbArticles.has(p.wbArticle));
if (missingFromWB.length > 0) {
  console.log("\n❌ In DB but NOT on WB (archived/deleted):");
  for (const p of missingFromWB) {
    console.log("  " + p.id + " wbArticle=" + p.wbArticle + " — " + p.name);
  }
}

// Products on WB but NOT in DB (new)
const dbArticleSet = new Set(dbWithWb.map((p) => p.wbArticle));
const newOnWB = scrape.products.filter((p) => !dbArticleSet.has(p.article));
if (newOnWB.length > 0) {
  console.log("\n🆕 On WB but NOT in DB (new products):");
  for (const p of newOnWB) {
    console.log("  article=" + p.article + " — " + p.name + " — " + p.priceProduct + "₽");
  }
} else {
  console.log('\n✅ No new products on WB — all ' + dbArticles.size + ' existing articles match');
}

// Price comparison
console.log("\n📊 Price changes (first 10):");
let changed = 0;
for (const wb of scrape.products) {
  const db = dbWithWb.find((p) => p.wbArticle === wb.article);
  if (db && db.price !== wb.priceProduct) {
    changed++;
    if (changed <= 10) {
      const oldP = db.price || 0;
      const newP = wb.priceProduct || 0;
      const diff = newP - oldP;
      const pct = oldP > 0 ? Math.round((diff / oldP) * 100) : 0;
      console.log(
        "  " + wb.article + " " + wb.name + ": " +
        oldP + "₽ → " + newP + "₽ (" + (diff > 0 ? "+" : "") + diff + "₽, " + pct + "%)"
      );
    }
  }
}
console.log("Total price changes: " + changed);

// Products that might have been archived in our DB
const archived = dbProducts.filter((p) => p.archivedAt !== null);
if (archived.length > 0) {
  console.log("\n📦 Archived products in DB:");
  for (const p of archived) {
    console.log("  " + p.id + " — " + p.name + " (archived: " + p.archivedAt + ")");
  }
}

await prisma.$disconnect();
