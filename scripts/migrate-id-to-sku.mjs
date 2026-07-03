/**
 * Миграция: id → sku для всех товаров.
 *
 * Делаем в 2 шага, чтобы Prisma не потеряла данные:
 *   1. Для товаров без sku → генерируем sku из id
 *   2. Обновляем id = sku (прямым SQL, т.к. id — PK)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const dry = process.argv.includes("--dry");

  // Шаг 1: товары без sku — генерируем из id (archived duplicates)
  const withoutSku = await prisma.product.findMany({ where: { sku: null } });
  console.log(`Products without sku: ${withoutSku.length}`);
  for (const p of withoutSku) {
    console.log(`  Generating sku for ${p.id}: ${p.id}`);
    const newSku = p.id; // mor-104 → используем id как sku
    if (!dry) {
      await prisma.product.update({
        where: { id: p.id },
        data: { sku: newSku },
      });
    }
  }

  // Шаг 2: обновляем id = sku для всех товаров
  const all = await prisma.product.findMany({ select: { id: true, sku: true } });
  console.log(`\nUpdating id → sku for ${all.length} products`);

  // Используем $executeRawUnsafe для обновления PK
  for (const p of all) {
    if (p.id === p.sku) {
      console.log(`  ${p.id} — already matches sku, skipping`);
      continue;
    }
    if (!p.sku) {
      console.log(`  ${p.id} — no sku, skipping`);
      continue;
    }
    console.log(`  ${p.id} → ${p.sku}`);
    if (!dry) {
      // Каскадное обновление PK: modelId ссылается на Model, не на Product, так что безопасно
      await prisma.$executeRawUnsafe(
        `UPDATE "Product" SET id = $1 WHERE id = $2`,
        p.sku,
        p.id
      );
    }
  }

  // Проверка: дубликаты id после миграции?
  const all2 = await prisma.product.findMany({ select: { id: true } });
  const ids = all2.map(p => p.id);
  const dups = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dups.length > 0) {
    console.log(`\n⚠️ DUPLICATE ids after migration: ${dups.join(', ')}`);
  } else {
    console.log(`\n✅ No duplicate ids`);
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
