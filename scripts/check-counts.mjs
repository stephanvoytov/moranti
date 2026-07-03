#!/usr/bin/env node
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const all = await prisma.product.findMany({ orderBy: { id: "asc" } });
  const wb = all.filter(p => p.wbArticle);
  const ozon = all.filter(p => p.ozonArticle);
  const both = all.filter(p => p.wbArticle && p.ozonArticle);
  const wbOnly = all.filter(p => p.wbArticle && !p.ozonArticle);
  const ozonOnly = all.filter(p => p.ozonArticle && !p.wbArticle);
  const neither = all.filter(p => !p.wbArticle && !p.ozonArticle);

  console.log(`Всего в БД: ${all.length}`);
  console.log(`С WB артикулом: ${wb.length}`);
  console.log(`С Ozon артикулом: ${ozon.length}`);
  console.log(`И там и там: ${both.length}`);
  console.log(`Только WB: ${wbOnly.length}`);
  console.log(`Только Ozon: ${ozonOnly.length}`);
  console.log(`Без артикулов: ${neither.length}`);

  // WB API вернул 100 active cards. Почему 100, а не 86 (только WB)?
  // Потому что Content API возвращает все карточки товаров,
  // а одна модель (imt) может иметь несколько карточек (color/size variants)
  console.log("\n--- Модели (группировка товаров) ---");
  const models = await prisma.model.findMany({
    include: { variants: { where: { archivedAt: null } } },
    orderBy: { name: "asc" },
  });
  for (const m of models) {
    console.log(`  ${m.name} (imtId=${m.imtId || "—"}): ${m.variants.length} товаров`);
    for (const v of m.variants) {
      console.log(`    - ${v.id} (${v.name})`);
    }
  }
  console.log(`  Всего моделей: ${models.length}`);
  const withoutModel = (await prisma.product.count({ where: { archivedAt: null, modelId: null } }));
  console.log(`  Товаров без модели: ${withoutModel}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
