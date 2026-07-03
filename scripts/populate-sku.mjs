#!/usr/bin/env node
/**
 * populate-sku.mjs — Проставляет sku из WB vendorCode / Ozon offer_id.
 * 
 * Стратегия:
 *   1. WB vendorCode → sku (основной источник)
 *   2. Для Ozon-only товаров: offer_id → sku
 *   3. Если sku уже занят другим товаром — логируем и пропускаем
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fetchWbCards(apiKey) {
  const allCards = [];
  let cursor = { limit: 100 };
  while (true) {
    const res = await fetch('https://content-api.wildberries.ru/content/v2/get/cards/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': apiKey },
      body: JSON.stringify({ settings: { cursor } }),
    });
    const data = await res.json();
    const cards = data?.cards || [];
    allCards.push(...cards);
    const next = data?.cursor;
    if (!next?.updatedAt || cards.length < 100) break;
    cursor = next;
    await new Promise(r => setTimeout(r, 300));
  }
  return allCards;
}

async function main() {
  const wbApiKey = process.env.WB_API_KEY;
  const ozonClientId = process.env.OZON_CLIENT_ID;
  const ozonApiKey = process.env.OZON_API_KEY;

  const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
  console.log(`DB: ${products.length} products`);

  const byWb = new Map(products.filter(p => p.wbArticle).map(p => [Number(p.wbArticle), p]));
  const byOzon = new Map(products.filter(p => p.ozonArticle).map(p => [Number(p.ozonArticle), p]));
    const byId = new Map(products.map(p => [p.id, p]));
  const skuIndex = new Map(products.filter(p => p.sku).map(p => [p.sku, p]));

  let setCount = 0;
  let conflictCount = 0;
  let skipCount = 0;

  // ——— Phase 1: WB vendorCode ———
  if (wbApiKey) {
    console.log('\n=== Phase 1: WB vendorCode → sku ===');
    const cards = await fetchWbCards(wbApiKey);
    console.log(`  ${cards.length} cards fetched`);

    for (const card of cards) {
      const vendorCode = card.vendorCode?.trim();
      if (!vendorCode) continue;

      const article = card.nmID;
      const db = byWb.get(article);
      if (!db) {
        console.log(`  SKIP: WB ${article} (${vendorCode}) not in DB`);
        continue;
      }
      if (db.sku === vendorCode) { skipCount++; continue; }

      // Check if sku already taken by another product
      const existing = skuIndex.get(vendorCode);
      if (existing && existing.id !== db.id) {
        console.log(`  CONFLICT: ${vendorCode} already on ${existing.id}, cannot set on ${db.id}`);
        conflictCount++;
        continue;
      }

      await prisma.product.update({ where: { id: db.id }, data: { sku: vendorCode } });
      const existingRecord = byId.get(db.id);
      if (existingRecord) skuIndex.set(vendorCode, existingRecord);
      setCount++;
      console.log(`  OK: ${db.id} ← ${vendorCode}`);
    }
    console.log(`  WB done: ${setCount} set, ${conflictCount} conflicts, ${skipCount} already`);
  }

  // ——— Phase 2: Ozon offer_id for remaining ———
  let ozonSet = 0;
  if (ozonClientId && ozonApiKey) {
    console.log('\n=== Phase 2: Ozon offer_id → sku ===');
    let allItems = [];
    let lastId = null;
    while (true) {
      const res = await fetch('https://api-seller.ozon.ru/v3/product/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Client-Id': ozonClientId,
          'Api-Key': ozonApiKey,
        },
        body: JSON.stringify({ filter: { visibility: 'ALL' }, last_id: lastId, limit: 1000 }),
      });
      const data = await res.json();
      const items = data?.result?.items || [];
      allItems.push(...items);
      lastId = data?.result?.last_id;
      if (!lastId || items.length < 1000) break;
      await new Promise(r => setTimeout(r, 200));
    }
    console.log(`  ${allItems.length} items fetched`);

    for (const item of allItems) {
      const offerId = item.offer_id?.trim();
      if (!offerId) continue;

      const productId = item.product_id;
      const db = byOzon.get(productId);
      if (!db) {
        console.log(`  SKIP: Ozon ${productId} (${offerId}) not in DB`);
        continue;
      }
      if (db.sku) {
        if (db.sku !== offerId) {
          console.log(`  NOTE: ${db.id} sku="${db.sku}" vs Ozon offer_id="${offerId}"`);
        }
        skipCount++;
        continue;
      }

      // Check if sku already taken
      const existing = skuIndex.get(offerId);
      if (existing) {
        if (existing.id !== db.id) {
          // If the existing product with this sku doesn't have ozonArticle,
          // we may have a duplicate — log for manual fix
          console.log(`  CONFLICT: sku="${offerId}" already on ${existing.id} (wb=${existing.wbArticle}), skipping ${db.id} (ozon=${productId})`);
          conflictCount++;
          continue;
        }
      }

      await prisma.product.update({ where: { id: db.id }, data: { sku: offerId } });
      const found = byId.get(db.id);
      if (found) skuIndex.set(offerId, found);
      ozonSet++;
      console.log(`  OK: ${db.id} ← ${offerId}`);
    }
    console.log(`  Ozon done: ${ozonSet} set, ${conflictCount} total conflicts`);
  }

  const remaining = await prisma.product.count({ where: { sku: null } });
  console.log(`\n=== Summary ===`);
  console.log(`  Set: ${setCount + ozonSet}`);
  console.log(`  Conflicts: ${conflictCount}`);
  console.log(`  Without sku: ${remaining}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
