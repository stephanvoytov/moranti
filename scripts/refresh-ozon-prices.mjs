/**
 * refresh-ozon-prices.mjs — разовый рефреш ozonPrice/ozonOriginalPrice/rating
 * для всех товаров с ozonArticle + пересчёт display-цены по логике merge.mjs
 * (min по доступным площадкам, stock > 0).
 *
 *   $env:VERCEL = "0"; node scripts/refresh-ozon-prices.mjs
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({ path: process.env.ENV_FILE || ".env.local" });
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL || "" }),
});

const { getProductsPrices } = await import("./sync-modules/ozon-price.mjs");

const products = await prisma.product.findMany({
  where: { ozonArticle: { not: null }, archivedAt: null },
  select: {
    id: true, slug: true, name: true,
    price: true, originalPrice: true, inStock: true,
    wbPrice: true, wbOriginalPrice: true, wbStock: true,
    ozonArticle: true, ozonPrice: true, ozonOriginalPrice: true, ozonStock: true,
  },
});
const skus = products.map((p) => Number(p.ozonArticle));
console.log(`Товаров с Ozon SKU: ${skus.length}`);

const prices = await getProductsPrices(skus);
const bySku = new Map(prices.map((r) => [Number(r.sku), r]));

let changed = 0;
for (const p of products) {
  const live = bySku.get(Number(p.ozonArticle));
  if (!live) continue;

  const eff = live.cardPrice ?? live.price;
  const updates = {};
  const log = [];

  if (eff != null && eff !== p.ozonPrice) {
    updates.ozonPrice = eff;
    log.push(`ozonPrice ${p.ozonPrice ?? "—"} → ${eff}`);
  }
  if (live.oldPrice != null && live.oldPrice !== p.ozonOriginalPrice) {
    updates.ozonOriginalPrice = live.oldPrice;
    log.push(`ozonOrig ${p.ozonOriginalPrice ?? "—"} → ${live.oldPrice}`);
  }
  if (live.rating != null && Math.abs(live.rating - (p.ozonRating ?? 0)) > 0.01) {
    updates.ozonRating = live.rating;
  }
  if (live.reviewsCount != null && live.reviewsCount !== p.ozonReviewsCount) {
    updates.ozonReviewsCount = live.reviewsCount;
  }

  // Display price — как в merge.mjs
  const finalOz = updates.ozonPrice ?? p.ozonPrice;
  const wbAvail = (p.wbStock ?? 0) > 0;
  const ozAvail = (p.ozonStock ?? 0) > 0;
  const candidates = [
    wbAvail ? (p.wbPrice ?? null) : null,
    ozAvail ? (finalOz ?? null) : null,
  ].filter((x) => x != null);
  if (candidates.length > 0) {
    const np = Math.min(...candidates);
    if (np !== p.price) {
      updates.price = np;
      log.push(`price ${p.price} → ${np}`);
    }
  }
  const origCandidates = [
    wbAvail ? (p.wbOriginalPrice ?? null) : null,
    ozAvail ? (updates.ozonOriginalPrice ?? p.ozonOriginalPrice ?? null) : null,
  ].filter((x) => x != null && x > 0);
  if (origCandidates.length > 0) {
    const np = Math.min(...origCandidates);
    if (np !== p.originalPrice) {
      updates.originalPrice = np;
      log.push(`origPrice ${p.originalPrice} → ${np}`);
    }
  } else if (p.originalPrice && p.originalPrice > 0) {
    // Источников зачёркнутой цены нет — гасим старую, чтобы не висела навсегда
    updates.originalPrice = 0;
    log.push(`origPrice ${p.originalPrice} → 0`);
  }

  if (Object.keys(updates).length === 0) continue;
  await prisma.product.update({ where: { id: p.id }, data: updates });
  changed++;
  console.log(`• ${p.name}: ${log.join("; ")}`);
}
console.log(`\nОбновлено товаров: ${changed}`);
await prisma.$disconnect();
