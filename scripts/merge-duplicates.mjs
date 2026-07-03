#!/usr/bin/env node
/**
 * merge-duplicates.mjs — V2: осторожный merge с проверками
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
  console.log(`Products: ${products.length}`);

  // Index products
  const byId = new Map(products.map(p => [p.id, p]));
  const byOzon = new Map(products.filter(p => p.ozonArticle).map(p => [Number(p.ozonArticle), p]));
  const byWb = new Map(products.filter(p => p.wbArticle).map(p => [Number(p.wbArticle), p]));

  // Fetch WB cards
  const wbRes = await fetch('https://content-api.wildberries.ru/content/v2/get/cards/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.WB_API_KEY,
    },
    body: JSON.stringify({ settings: { cursor: { limit: 100 } } }),
  });
  const wbData = await wbRes.json();
  const wbCards = wbData?.cards || [];

  const wbVendorToNm = new Map();
  for (const card of wbCards) {
    const vc = card.vendorCode?.trim();
    if (vc && card.nmID) wbVendorToNm.set(vc, card.nmID);
  }

  // Fetch Ozon items
  const ozonItems = [];
  let lastId = null;
  while (true) {
    const res = await fetch('https://api-seller.ozon.ru/v3/product/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': process.env.OZON_CLIENT_ID,
        'Api-Key': process.env.OZON_API_KEY,
      },
      body: JSON.stringify({ filter: { visibility: 'ALL' }, last_id: lastId, limit: 1000 }),
    });
    const data = await res.json();
    const items = data?.result?.items || [];
    ozonItems.push(...items);
    lastId = data?.result?.last_id;
    if (!lastId || items.length < 1000) break;
    await new Promise(r => setTimeout(r, 200));
  }

  for (const item of ozonItems) {
    const offerId = item.offer_id?.trim();
    const productId = item.product_id;
    if (!offerId || !productId) continue;

    const dup = byOzon.get(productId);
    if (!dup) {
      console.log(`NOT FOUND: Ozon ${productId} (${offerId}) not in DB`);
      continue;
    }
    if (dup.sku) {
      console.log(`OK: ${dup.id} already has sku="${dup.sku}"`);
      continue;
    }

    // Find primary by vendorCode
    const nmId = wbVendorToNm.get(offerId);
    const primary = nmId ? byWb.get(nmId) : null;

    if (!primary) {
      // Ozon-only product or unmatched
      // Check if sku is free before setting
      const existingSku = byId.get(offerId);
      if (!existingSku) {
        await prisma.product.update({ where: { id: dup.id }, data: { sku: offerId } });
        console.log(`SET: ${dup.id} ← sku="${offerId}"`);
      } else {
        console.log(`CONFLICT: ${dup.id} sku="${offerId}" taken by ${existingSku.id}`);
      }
      continue;
    }

    if (primary.id === dup.id) {
      // Same product — just set sku if missing
      if (!dup.sku) {
        await prisma.product.update({ where: { id: dup.id }, data: { sku: offerId } });
        console.log(`SET (self): ${dup.id} ← sku="${offerId}"`);
      }
      continue;
    }

    // DIFFERENT products — merge Ozon data into primary
    console.log(`\n=== ${dup.id} → ${primary.id} (sku="${offerId}") ===`);
    console.log(`  dup: wb=${dup.wbArticle} ozon=${dup.ozonArticle} price=${dup.ozonPrice} stock=${dup.ozonStock}`);
    console.log(`  pri: wb=${primary.wbArticle} ozon=${primary.ozonArticle} price=${primary.ozonPrice} stock=${primary.ozonStock}`);

    const updates = {};

    // OZON ARTICLE — only if primary doesn't have one AND no other product has it
    const ozonVal = dup.ozonArticle ? Number(dup.ozonArticle) : null;
    if (ozonVal && !primary.ozonArticle) {
      const alreadyUsed = products.find(p => p.ozonArticle && Number(p.ozonArticle) === ozonVal && p.id !== dup.id && p.id !== primary.id);
      if (!alreadyUsed) {
        updates.ozonArticle = BigInt(ozonVal);
        console.log(`  + ozonArticle: ${ozonVal}`);
      } else {
        console.log(`  SKIP ozonArticle ${ozonVal}: already on ${alreadyUsed.id}`);
      }
    }

    // PRICE
    if (dup.ozonPrice != null && !primary.ozonPrice) {
      updates.ozonPrice = dup.ozonPrice;
      console.log(`  + ozonPrice: ${dup.ozonPrice}`);
    }
    if (dup.ozonOriginalPrice != null && !primary.ozonOriginalPrice) {
      updates.ozonOriginalPrice = dup.ozonOriginalPrice;
    }
    if (dup.ozonStock != null) {
      updates.ozonStock = dup.ozonStock;
      console.log(`  + ozonStock: ${dup.ozonStock}`);
    }
    if (dup.ozonImage && !primary.ozonImage) {
      updates.ozonImage = dup.ozonImage;
    }
    if (dup.ozonImages?.length && !primary.ozonImages?.length) {
      updates.ozonImages = dup.ozonImages;
    }
    if (dup.rating != null && !primary.rating) {
      updates.rating = dup.rating;
    }
    if (dup.reviewsCount != null && !primary.reviewsCount) {
      updates.reviewsCount = dup.reviewsCount;
    }
    if (dup.colorName && !primary.colorName) {
      updates.colorName = dup.colorName;
    }

    // 1. Clear dup's ozonArticle FIRST (before setting on primary)
    if (updates.ozonArticle) {
      await prisma.product.update({ where: { id: dup.id }, data: { ozonArticle: null } });
      console.log(`  ✓ cleared ozonArticle from ${dup.id}`);
    }

    // 2. Apply merge to primary
    if (Object.keys(updates).length > 0) {
      await prisma.product.update({ where: { id: primary.id }, data: updates });
      console.log(`  ✓ merged ${Object.keys(updates).length} fields to ${primary.id}`);
    }

    // 3. Archive duplicate
    await prisma.product.update({
      where: { id: dup.id },
      data: {
        archivedAt: new Date(),
        sku: null,
      },
    });
    console.log(`  ✓ archived ${dup.id}`);
  }

  const total = await prisma.product.count();
  const withSku = await prisma.product.count({ where: { NOT: { sku: null } } });
  const archived = await prisma.product.count({ where: { NOT: { archivedAt: null } } });
  console.log(`\n=== Results ===`);
  console.log(`  Total: ${total}, with sku: ${withSku}, archived: ${archived}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
