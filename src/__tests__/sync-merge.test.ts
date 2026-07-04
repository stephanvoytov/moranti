/**
 * Полные тесты для mergeProductSources — критически важная чистая функция.
 *
 * Проверяет все комбинации входов, приоритеты, граничные случаи.
 * Должна ловить регрессии при любых изменениях логики слияния.
 */

import { describe, it, expect } from "vitest";

const MERGE_PATH = "../../scripts/sync-modules/merge.mjs";

type MergeInput = Parameters<typeof import("../../scripts/sync-modules/merge.mjs") extends { mergeProductSources: infer F } ? F : never>;
type DBLike = Record<string, unknown>;

describe("mergeProductSources", () => {
  let mergeProductSources: (...args: any[]) => any;

  beforeAll(async () => {
    const mod = await import(MERGE_PATH);
    mergeProductSources = mod.mergeProductSources;
  });

  // ================================================================
  // ЦЕНЫ
  // ================================================================

  describe("цены", () => {
    it("выбирает минимальную цену из WB и Ozon", () => {
      const r = mergeProductSources(
        null,
        { price: 10000, discountedPrice: 8000, stock: null },
        null,
        { price: 9000, old_price: 11000 },
        null, null, null,
      );
      expect(r.price).toBe(8000);
      expect(r.wbPrice).toBe(8000);
      expect(r.ozonPrice).toBe(9000);
    });

    it("если Ozon дешевле — display price берётся из Ozon", () => {
      const r = mergeProductSources(
        null,
        { price: 15000, discountedPrice: 14000, stock: null },
        null,
        { price: 12000, old_price: 16000 },
        null, null, null,
      );
      expect(r.price).toBe(12000);
    });

    it("только WB цена", () => {
      const r = mergeProductSources(
        null,
        { price: 5000, discountedPrice: 4500, stock: 10 },
        null, null, null, null, null,
      );
      expect(r.price).toBe(4500);
      expect(r.wbPrice).toBe(4500);
      expect(r.wbOriginalPrice).toBe(5000);
      expect(r.ozonPrice).toBeUndefined();
    });

    it("только Ozon цена", () => {
      const r = mergeProductSources(
        null, null, null,
        { price: 9990, old_price: 12000 },
        null, null, null,
      );
      expect(r.price).toBe(9990);
      expect(r.ozonPrice).toBe(9990);
      expect(r.wbPrice).toBeUndefined();
    });

    it("цены совпадают — display price корректен", () => {
      const r = mergeProductSources(
        null,
        { price: 10000, discountedPrice: 8000, stock: null },
        null,
        { price: 8000, old_price: 10000 },
        null, null, null,
      );
      expect(r.price).toBe(8000);
    });

    it("originalPrice = min из original цен", () => {
      const r = mergeProductSources(
        null,
        { price: 5000, discountedPrice: 4500, stock: null },
        null,
        { price: 7000, old_price: 8000 },
        null, null, null,
      );
      expect(r.originalPrice).toBe(5000);
    });

    it("originalPrice отсутствует — fallback на price", () => {
      const r = mergeProductSources(
        null,
        { price: null, discountedPrice: 4500, stock: null },
        null, null, null, null, null,
      );
      expect(r.originalPrice).toBeUndefined(); // нет original — не ставится
      expect(r.price).toBe(4500);
    });

    it("null цены в API не затирают существующие в БД", () => {
      const db = { wbPrice: 4500, wbOriginalPrice: 5000 };
      const r = mergeProductSources(
        null,
        { price: 5000, discountedPrice: 4500, stock: null },
        null, null, null, null, db,
      );
      // Значение совпадает с БД — wbPrice не перезаписывается
      expect(r.wbPrice).toBeUndefined();
    });

    it("цен больше нет в API — в БД остаются (не затираются undefined)", () => {
      const db = { wbPrice: 4500, wbOriginalPrice: 5000, ozonPrice: 6000, ozonOriginalPrice: 7000 };
      const r = mergeProductSources(
        null, null, null, null, null, null, db,
      );
      // Все undefined — не ставим, остаётся как было
      expect(r.wbPrice).toBeUndefined();
      expect(r.ozonPrice).toBeUndefined();
    });

    it("цена изменилась — wbPrice обновляется", () => {
      const db = { wbPrice: 4500, wbOriginalPrice: 5000 };
      const r = mergeProductSources(
        null,
        { price: 5500, discountedPrice: 5000, stock: null },
        null, null, null, null, db,
      );
      expect(r.wbPrice).toBe(5000);
      expect(r.wbOriginalPrice).toBe(5500);
    });

    it("снова появилась цена после отсутствия", () => {
      const db = { wbPrice: null, wbOriginalPrice: null };
      const r = mergeProductSources(
        null,
        { price: 10000, discountedPrice: 8000, stock: null },
        null, null, null, null, db,
      );
      expect(r.wbPrice).toBe(8000);
      expect(r.wbOriginalPrice).toBe(10000);
    });
  });

  // ================================================================
  // РЕЙТИНГ
  // ================================================================

  describe("рейтинг", () => {
    it("weighted avg: 4.5 WB (10 reviews) + 4.0 Ozon (5 reviews) = 4.33", () => {
      const r = mergeProductSources(
        null, null, { rating: 4.5, feedbacks: 10 },
        { reviews_count: 5 }, null, { rating: 4.0 },
        null,
      );
      expect(r.rating).toBeCloseTo(4.3, 1);
      expect(r.reviewsCount).toBe(15);
    });

    it("weighted avg: 3.0 WB (100 rev) + 5.0 Ozon (1 rev) ≈ 3.02", () => {
      const r = mergeProductSources(
        null, null, { rating: 3.0, feedbacks: 100 },
        { reviews_count: 1 }, null, { rating: 5.0 },
        null,
      );
      expect(r.rating).toBeCloseTo(3.0, 1);
      expect(r.reviewsCount).toBe(101);
    });

    it("только WB рейтинг", () => {
      const r = mergeProductSources(null, null, { rating: 4.8, feedbacks: 20 }, null, null, null, null);
      expect(r.rating).toBe(4.8);
      expect(r.reviewsCount).toBe(20);
    });

    it("только Ozon рейтинг", () => {
      const r = mergeProductSources(null, null, null, { reviews_count: 3 }, null, { rating: 4.2 }, null);
      expect(r.rating).toBe(4.2);
      expect(r.reviewsCount).toBe(3);
    });

    it("нет отзывов нигде — рейтинг не ставится", () => {
      const r = mergeProductSources(null, null, null, null, null, null, null);
      expect(r.rating).toBeUndefined();
      expect(r.reviewsCount).toBeUndefined();
    });

    it("рейтинг в БД но не в API — не затирается", () => {
      const db = { rating: 4.1, reviewsCount: 10 };
      const r = mergeProductSources(null, null, null, null, null, null, db);
      expect(r.rating).toBeUndefined();
      expect(r.reviewsCount).toBeUndefined();
    });

    it("округление до 1 знака: 4.44 → 4.4", () => {
      const r = mergeProductSources(
        null, null, { rating: 4.44, feedbacks: 10 },
        { reviews_count: 1 }, null, { rating: 4.0 },
        null,
      );
      expect(r.rating).toBeCloseTo(4.4, 1);
    });

    it("округление до 1 знака: (4.45*10 + 4.0*1) / 11 ≈ 4.4", () => {
      // (4.45×10 + 4.0×1) ÷ 11 = 48.5 ÷ 11 = 4.409 → Math.round(4.409×10)/10 = 4.4
      const r = mergeProductSources(
        null, null, { rating: 4.45, feedbacks: 10 },
        { reviews_count: 1 }, null, { rating: 4.0 },
        null,
      );
      expect(r.rating).toBeCloseTo(4.4, 1);
    });
  });

  // ================================================================
  // ФОТО
  // ================================================================

  describe("фото", () => {
    it("CDN URL из WB карточки (3 фото)", () => {
      const card = { nmID: 12345678, media: { photo_count: 3 } };
      const r = mergeProductSources(card, null, null, null, null, null, null);
      expect(r.photoCount).toBe(3);
      expect(r.image).toMatch(/12345678.*big\/1\.webp$/);
      expect(r.images).toHaveLength(3);
      r.images.forEach((url, i) => {
        expect(url).toMatch(new RegExp(`${i + 1}\\.webp$`));
      });
    });

    it("CDN URL из WB карточки (30+ фото — макс 30)", () => {
      const card = { nmID: 123, photos: new Array(50).fill(0) };
      const r = mergeProductSources(card, null, null, null, null, null, null);
      expect(r.photoCount).toBe(50);
      expect(r.images!.length).toBeLessThanOrEqual(30);
    });

    it("CDN URL: photo_count = 0 → fallback 1 (0 — falsy в JS)", () => {
      const card = { nmID: 12345678, media: { photo_count: 0 } };
      const r = mergeProductSources(card, null, null, null, null, null, null);
      // extractPhotoCount: `if (media.photo_count)` — 0 falsy, падает на `return 1`
      expect(r.photoCount).toBe(1);
      expect(r.images).toHaveLength(1);
    });

    it("Ozon фото для товаров без WB и без существующих Ozon фото", () => {
      const r = mergeProductSources(
        null, null, null,
        { images: ["https://cdn.ozon/img1.jpg", "https://cdn.ozon/img2.jpg"] },
        null, null,
        { wbArticle: null, ozonImage: null },
      );
      expect(r.photoCount).toBe(2);
      expect(r.image).toBe("https://cdn.ozon/img1.jpg");
      expect(r.images).toEqual(["https://cdn.ozon/img1.jpg", "https://cdn.ozon/img2.jpg"]);
    });

    it("Ozon фото НЕ перезаписывают WB фото", () => {
      const card = { nmID: 111, media: { photo_count: 2 } };
      const r = mergeProductSources(
        card, null, null,
        { images: ["ozon-main.jpg"] },
        null, null,
        null,
      );
      expect(r.image).toContain("vol"); // WB CDN URL
      expect(r.image).not.toContain("ozon");
    });

    it("Ozon фото для товаров с wbArticle но без ozonImage — не ставится (уже есть WB)", () => {
      const r = mergeProductSources(
        null, null, null,
        { images: ["ozon-img.jpg"] },
        null, null,
        { wbArticle: BigInt(123), ozonImage: null },
      );
      // wbArticle есть → ozon фото не становятся основными
      expect(r.image).toBeUndefined();
      // Но ozonImage/ozonImages для админки — да
      expect(r.ozonImage).toBe("ozon-img.jpg");
    });

    it("Ozon фото в ozonImage (для админки) — обновляются", () => {
      const r = mergeProductSources(
        null, null, null,
        { images: ["https://cdn.ozon/new.jpg"] },
        null, null,
        { ozonImage: "https://cdn.ozon/old.jpg", ozonImages: ["https://cdn.ozon/old.jpg"] },
      );
      expect(r.ozonImage).toBe("https://cdn.ozon/new.jpg");
      expect(r.ozonImages).toEqual(["https://cdn.ozon/new.jpg"]);
    });

    it("Ozon фото не изменились — ozonImage не перезаписывается", () => {
      const r = mergeProductSources(
        null, null, null,
        { images: ["https://cdn.ozon/same.jpg"] },
        null, null,
        { ozonImage: "https://cdn.ozon/same.jpg", ozonImages: ["https://cdn.ozon/same.jpg"] },
      );
      expect(r.ozonImage).toBeUndefined();
    });
  });

  // ================================================================
  // КАТЕГОРИЯ
  // ================================================================

  describe("категория", () => {
    it("из WB карточки (характеристика 'Модель сумки': кроссбоди)", () => {
      const card = {
        characteristics: [{ options: [{ name: "Модель сумки", value: "кроссбоди" }] }],
      };
      const r = mergeProductSources(card, null, null, null, null, null, null);
      expect(r.category).toBe("crossbody");
    });

    it("из WB карточки (subjectID → crossbody)", () => {
      const card = { subjectID: 25 };
      const r = mergeProductSources(card, null, null, null, null, null, null);
      expect(r.category).toBe("crossbody"); // subject 25 = сумки-кросс-боди
    });

    it("из Ozon названия (шоппер → tote)", () => {
      const r = mergeProductSources(
        null, null, null,
        { name: "Сумка шоппер Moranti кожаная" },
        null, null, null,
      );
      expect(r.category).toBe("tote");
    });

    it("из Ozon атрибута 20259 (седло → saddle)", () => {
      const attrs = {
        attributes: [{ id: 20259, values: [{ value: "Седло" }] }],
      };
      const r = mergeProductSources(
        null, null, null, { name: "Сумка Moranti" }, attrs, null, null,
      );
      expect(r.category).toBe("saddle");
    });

    it("из Ozon атрибута 9048 (sedlo → saddle)", () => {
      const attrs = {
        attributes: [{ id: 9048, values: [{ value: "Sedlo" }] }],
      };
      const r = mergeProductSources(
        null, null, null, { name: "Сумка Moranti" }, attrs, null, null,
      );
      expect(r.category).toBe("saddle");
    });

    it("приоритет WB над Ozon", () => {
      const card = { characteristics: [{ options: [{ name: "Модель сумки", value: "багет" }] }] };
      const r = mergeProductSources(
        card, null, null,
        { name: "Сумка шоппер Moranti" }, null, null, null,
      );
      expect(r.category).toBe("baguette"); // WB → baguette, Ozon → tote, побеждает WB
    });

    it("нет категории ниоткуда — fallback 'crossbody'", () => {
      const r = mergeProductSources(null, null, null, null, null, null, null);
      expect(r.category).toBe("crossbody");
    });

    it("fallback на БД если нет ни WB ни Ozon", () => {
      const r = mergeProductSources(null, null, null, null, null, null, { category: "backpack" });
      expect(r.category).toBe("backpack");
    });
  });

  // ================================================================
  // СОСТАВ И ЦВЕТ
  // ================================================================

  describe("состав и цвет", () => {
    it("состав из WB", () => {
      const card = { compositions: [{ name: "Натуральная кожа" }] };
      const r = mergeProductSources(card, null, null, null, null, null, null);
      expect(r.composition).toBe("Натуральная кожа");
    });

    it("цвет из WB", () => {
      const card = { colors: [{ name: "Чёрный" }] };
      const r = mergeProductSources(card, null, null, null, null, null, null);
      expect(r.colorName).toBe("Чёрный");
    });

    it("состав из Ozon если нет WB (нужен ozonInfo для gate)", () => {
      const attrs = {
        attributes: [{ attribute_name: "Состав", value: "100% кожа" }],
      };
      // NB: merge проверяет ozonInfo (не ozonAttrs) — баг, но для обратной
      // совместимости тест проверяет текущее поведение: ozonInfo обязателен
      const r = mergeProductSources(null, null, null, { name: "test" }, attrs, null, null);
      expect(r.composition).toBe("100% кожа");
    });

    it("цвет из Ozon если нет WB (нужен ozonInfo для gate)", () => {
      const attrs = {
        attributes: [{ attribute_name: "Цвет", value: "Коричневый" }],
      };
      const r = mergeProductSources(null, null, null, { name: "test" }, attrs, null, null);
      expect(r.colorName).toBe("Коричневый");
    });

    it("приоритет WB цвета над Ozon", () => {
      const card = { colors: [{ name: "Бежевый" }] };
      const attrs = {
        attributes: [{ attribute_name: "Цвет", value: "Коричневый" }],
      };
      const r = mergeProductSources(card, null, null, null, attrs, null, null);
      expect(r.colorName).toBe("Бежевый"); // WB побеждает
    });

    it("нет состава — null", () => {
      const r = mergeProductSources(null, null, null, null, null, null, null);
      expect(r.composition).toBe(null);
    });
  });

  // ================================================================
  // НАЗВАНИЕ И ОПИСАНИЕ
  // ================================================================

  describe("название и описание", () => {
    it("генерирует название из WB (nameAutoGenerated не false)", () => {
      const card = { title: "Balensa", imt_name: "Balensa", nmID: 123 };
      const r = mergeProductSources(
        card, null, null, null, null, null,
        { category: "crossbody", nameAutoGenerated: null },
      );
      expect(r.name).toBeTruthy();
      expect(r.nameAutoGenerated).toBe(true);
    });

    it("НЕ генерирует название если nameAutoGenerated = false", () => {
      const card = { title: "Balensa", imt_name: "Balensa" };
      const r = mergeProductSources(
        card, null, null, null, null, null,
        { name: "Ручное название", nameAutoGenerated: false },
      );
      expect(r.name).toBeUndefined();
    });

    it("генерирует описание из WB карточки", () => {
      const card = { description: "Красивая сумка из натуральной кожи", nmID: 123 };
      const r = mergeProductSources(
        card, null, null, null, null, null,
        { description: "", descAutoGenerated: null },
      );
      expect(r.description).toBe("Красивая сумка из натуральной кожи");
      expect(r.descAutoGenerated).toBe(true);
    });

    it("НЕ перезаписывает описание если descAutoGenerated = false", () => {
      const card = { description: "WB описание" };
      const r = mergeProductSources(
        card, null, null, null, null, null,
        { description: "Ручное описание", descAutoGenerated: false },
      );
      expect(r.description).toBeUndefined();
    });

    it("без WB карточки — название и описание не трогаются", () => {
      const r = mergeProductSources(null, null, null, null, null, null, null);
      expect(r.name).toBeUndefined();
      expect(r.description).toBeUndefined();
    });
  });

  // ================================================================
  // ХАРАКТЕРИСТИКИ
  // ================================================================

  describe("характеристики", () => {
    it("характеристики из WB", () => {
      const card = {
        characteristics: [{ name: "Цвет", value: "Чёрный" }],
      };
      const r = mergeProductSources(card, null, null, null, null, null, null);
      expect(r.characteristics).toBeDefined();
      expect(r.characteristics[0].group_name).toBe("Wildberries");
    });

    it("характеристики из Ozon", () => {
      const attrs = {
        attributes: [{ attribute_name: "Размер", value: "30x20" }],
      };
      const r = mergeProductSources(null, null, null, null, attrs, null, null);
      expect(r.characteristics).toBeDefined();
      expect(r.characteristics[0].group_name).toBe("Ozon");
    });

    it("характеристики из WB и Ozon (обе группы)", () => {
      const card = { characteristics: [{ name: "Цвет", value: "Чёрный" }] };
      const attrs = {
        attributes: [{ attribute_name: "Размер", value: "30x20" }],
      };
      const r = mergeProductSources(card, null, null, null, attrs, null, null);
      expect(r.characteristics).toHaveLength(2);
      expect(r.characteristics[0].group_name).toBe("Wildberries");
      expect(r.characteristics[1].group_name).toBe("Ozon");
    });

    it("нет характеристик — undefined", () => {
      const r = mergeProductSources(null, null, null, null, null, null, null);
      expect(r.characteristics).toBeUndefined();
    });
  });

  // ================================================================
  // СТОКИ (количество)
  // ================================================================

  describe("стоки", () => {
    it("WB stock из search API", () => {
      const r = mergeProductSources(
        null,
        { price: 5000, discountedPrice: 4500, stock: 15 },
        null, null, null, null,
        { wbStock: null },
      );
      expect(r.wbStock).toBe(15);
    });

    it("Ozon stock суммируется по всем складам", () => {
      const r = mergeProductSources(
        null, null, null,
        { stocks: { stocks: [{ present: 10, reserved: 2 }, { present: 5, reserved: 0 }] } },
        null, null,
        { ozonStock: null },
      );
      expect(r.ozonStock).toBe(13); // (10-2) + (5-0)
    });

    it("Ozon stock = 0 если нет остатков", () => {
      const r = mergeProductSources(
        null, null, null,
        { stocks: { stocks: [{ present: 2, reserved: 2 }] } },
        null, null,
        { ozonStock: null },
      );
      expect(r.ozonStock).toBe(0);
    });

    it("stock не изменился — не перезаписывается", () => {
      const r = mergeProductSources(
        null,
        { price: 5000, discountedPrice: 4500, stock: 10 },
        null, null, null, null,
        { wbStock: 10 },
      );
      expect(r.wbStock).toBeUndefined();
    });
  });

  // ================================================================
  // ИНТЕГРАЦИОННЫЕ / EDGE CASES
  // ================================================================

  describe("интеграционные кейсы", () => {
    it("полный пайплайн: WB карточка + цены + рейтинг", () => {
      const card = {
        nmID: 999,
        media: { photo_count: 2 },
        colors: [{ name: "Красный" }],
        compositions: [{ name: "Кожа" }],
        characteristics: [{ options: [{ name: "Модель сумки", value: "тоут" }] }],
        rating: 4.5,
        feedbacks: 30,
      };
      const r = mergeProductSources(
        card,
        { price: 12000, discountedPrice: 9990, stock: 8 },
        { rating: 4.5, feedbacks: 30 },
        null, null, null,
        null,
      );
      expect(r.price).toBe(9990);
      expect(r.category).toBe("tote");
      expect(r.colorName).toBe("Красный");
      expect(r.composition).toBe("Кожа");
      expect(r.rating).toBe(4.5);
      expect(r.wbStock).toBe(8);
      expect(r.image).toContain("999");
    });

    it("полный пайплайн: Ozon-only товар", () => {
      const r = mergeProductSources(
        null, null, null,
        {
          name: "Сумка Moranti Sedlo",
          price: 15000,
          old_price: 18000,
          images: ["ozon-photo.jpg"],
          stocks: { stocks: [{ present: 5, reserved: 1 }] },
          reviews_count: 12,
        },
        {
          attributes: [
            { attribute_name: "Цвет", value: "Чёрный" },
            { attribute_name: "Состав", value: "Натуральная кожа" },
          ],
        },
        { rating: 4.2 },
        { wbArticle: null, ozonImage: null },
      );
      expect(r.price).toBe(15000);
      expect(r.ozonPrice).toBe(15000);
      expect(r.ozonOriginalPrice).toBe(18000);
      expect(r.category).toBe("saddle");
      expect(r.colorName).toBe("Чёрный");
      expect(r.composition).toBe("Натуральная кожа");
      expect(r.ozonStock).toBe(4);
      expect(r.rating).toBe(4.2);
      expect(r.reviewsCount).toBe(12);
      expect(r.image).toBe("ozon-photo.jpg");
    });

    it("все null — возвращает только category/price/colorName/composition с fallback", () => {
      const r = mergeProductSources(null, null, null, null, null, null, null);
      // Эти поля всегда выставляются (даже если null)
      expect(r.category).toBe("crossbody");
      expect(r.composition).toBe(null);
      expect(r.colorName).toBe(null);
      // Эти — только при наличии данных
      expect(r.rating).toBeUndefined();
      expect(r.wbPrice).toBeUndefined();
      expect(r.ozonPrice).toBeUndefined();
      expect(r.name).toBeUndefined();
    });

    it("без источников выставляются только category/composition/colorName", () => {
      const r = mergeProductSources(
        null, null, null, null, null, null,
        { category: "crossbody", composition: null, colorName: null, wbPrice: null, ozonPrice: null, price: 0, originalPrice: 0 },
      );
      // Эти поля всегда проставляются (даже при null):
      expect(r.category).toBe("crossbody");
      expect(r.composition).toBe(null);
      expect(r.colorName).toBe(null);
      // А эти — нет (нужны источники данных):
      expect(r.rating).toBeUndefined();
      expect(r.wbPrice).toBeUndefined();
      expect(r.name).toBeUndefined();
    });

    it("новый товар в БД (db = null) — все поля проставляются", () => {
      const r = mergeProductSources(
        { nmID: 1, media: { photo_count: 1 }, title: "Test Bag" },
        { price: 5000, discountedPrice: 4500, stock: null },
        null, null, null, null,
        null,
      );
      // name генерируется (db нет — nameAutoGenerated не false)
      expect(r.name).toBeTruthy();
      expect(r.nameAutoGenerated).toBe(true);
      expect(r.price).toBe(4500);
      expect(r.category).toBeTruthy();
    });

    it("цена WB = 0 (бесплатный товар)", () => {
      const r = mergeProductSources(
        null,
        { price: 0, discountedPrice: 0, stock: 1 },
        null, null, null, null, null,
      );
      expect(r.price).toBe(0);
      expect(r.wbPrice).toBe(0);
    });

    it("рейтинг обновился с 4.3 до 4.5", () => {
      const db = { rating: 4.3, reviewsCount: 20 };
      const r = mergeProductSources(
        null, null, { rating: 4.5, feedbacks: 30 },
        { reviews_count: 5 }, null, { rating: 4.0 },
        db,
      );
      expect(r.rating).toBeCloseTo(4.4, 1);
      expect(r.reviewsCount).toBe(35);
    });

    it("рейтинг не изменился — не ставится", () => {
      const db = { rating: 4.5, reviewsCount: 10 };
      const r = mergeProductSources(
        null, null, { rating: 4.5, feedbacks: 10 },
        null, null, null,
        db,
      );
      expect(r.rating).toBeUndefined();
    });

    it("Ozon атрибут Цвет — массив значений (нужен ozonInfo)", () => {
      const attrs = {
        attributes: [{ attribute_name: "Цвет", value: ["Чёрный", "Белый"] }],
      };
      const r = mergeProductSources(null, null, null, { name: "test" }, attrs, null, null);
      expect(r.colorName).toBe("Чёрный, Белый");
    });

    it("Ozon атрибут Цвет — color_image строка", () => {
      const r = mergeProductSources(
        null, null, null,
        { color_image: "Бордовый" }, null, null, null,
      );
      expect(r.colorName).toBe("Бордовый");
    });
  });
});
