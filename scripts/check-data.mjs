#!/usr/bin/env node
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const prisma = new PrismaClient();

async function check() {
  const all = await prisma.product.findMany({ orderBy: { id: "asc" } });

  console.log("=== Всего товаров: " + all.length + " ===\n");

  // 1. Статистика
  const withWb = all.filter((p) => p.wbArticle).length;
  const withOzon = all.filter((p) => p.ozonArticle).length;
  const withBoth = all.filter((p) => p.wbArticle && p.ozonArticle).length;
  const withOzonPrice = all.filter((p) => p.ozonPrice != null).length;
  const withWbPrice = all.filter((p) => p.wbPrice != null).length;
  const withRating = all.filter((p) => p.rating != null).length;
  const archived = all.filter((p) => p.archivedAt).length;
  const outOfStock = all.filter((p) => p.inStock === false).length;
  const noName = all.filter((p) => !p.name).length;
  const noPrice = all.filter((p) => !p.price || p.price === 0).length;

  console.log("Статистика:");
  console.log("  С WB артикулом:    " + withWb);
  console.log("  С Ozon артикулом:  " + withOzon);
  console.log("  С обеих площадок:  " + withBoth);
  console.log("  Цена WB:           " + withWbPrice);
  console.log("  Цена Ozon:         " + withOzonPrice);
  console.log("  Рейтинг:           " + withRating);
  console.log("  Архивных:          " + archived);
  console.log("  Нет в наличии:     " + outOfStock);
  console.log("  Без названия:      " + noName);
  console.log("  Без цены:          " + noPrice);

  // 2. Сэмплы с обеих площадок
  console.log("\n=== Сэмплы (есть и WB и Ozon) ===");
  const both = all.filter((p) => p.wbArticle && p.ozonArticle).slice(0, 5);
  for (const p of both) {
    console.log("  " + p.id + ": " + p.name);
    console.log(
      "    price=" +
        p.price +
        " orig=" +
        p.originalPrice +
        " wbPrice=" +
        p.wbPrice +
        " ozonPrice=" +
        p.ozonPrice +
        " ozonOrig=" +
        p.ozonOriginalPrice,
    );
    console.log("    wbArt=" + p.wbArticle + " ozonArt=" + p.ozonArticle);
    console.log(
      "    category=" +
        p.category +
        " rating=" +
        p.rating +
        " reviews=" +
        p.reviewsCount,
    );
    console.log(
      "    color=" +
        p.colorName +
        " composition=" +
        (p.composition ? p.composition.slice(0, 50) : "null"),
    );
    console.log("    inStock=" + p.inStock + " photoCount=" + p.photoCount);
    console.log("    image=" + (p.image ? p.image.slice(0, 80) : "null"));
    console.log("");
  }

  // 3. Сэмплы WB-only
  console.log("=== Сэмплы (только WB) ===");
  const wbOnly = all.filter((p) => p.wbArticle && !p.ozonArticle).slice(0, 5);
  for (const p of wbOnly) {
    console.log("  " + p.id + ": " + p.name);
    console.log(
      "    price=" +
        p.price +
        " wbPrice=" +
        p.wbPrice +
        " ozonPrice=" +
        p.ozonPrice,
    );
    console.log("    category=" + p.category + " rating=" + p.rating);
    console.log("    inStock=" + p.inStock + " photoCount=" + p.photoCount);
    console.log("");
  }

  // 4. Сэмплы Ozon-only
  console.log("=== Сэмплы (только Ozon) ===");
  const ozonOnly = all
    .filter((p) => !p.wbArticle && p.ozonArticle)
    .slice(0, 5);
  for (const p of ozonOnly) {
    console.log("  " + p.id + ": " + p.name);
    console.log(
      "    price=" +
        p.price +
        " ozonPrice=" +
        p.ozonPrice +
        " ozonOrig=" +
        p.ozonOriginalPrice,
    );
    console.log("    category=" + p.category + " rating=" + p.rating);
    console.log("    inStock=" + p.inStock + " photoCount=" + p.photoCount);
    console.log("");
  }

  // 5. Проблемные — без цены
  const zeroPrice = all.filter((p) => !p.price || p.price === 0);
  if (zeroPrice.length > 0) {
    console.log("=== Проблемные (без цены) ===");
    for (const p of zeroPrice) {
      console.log(
        "  " +
          p.id +
          ": " +
          p.name +
          " wbArt=" +
          p.wbArticle +
          " ozonArt=" +
          p.ozonArticle,
      );
      console.log(
        "    wbPrice=" +
          p.wbPrice +
          " ozonPrice=" +
          p.ozonPrice +
          " ozonOrig=" +
          p.ozonOriginalPrice,
      );
    }
  }

  await prisma.$disconnect();
}

check().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
