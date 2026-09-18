import { describe, it, expect } from "vitest";
import {
  getProducts,
  getProduct,
  getCategories,
  applyModelRatings,
} from "@/data/products";

describe("products data", () => {
  it("getProducts returns array of products", async () => {
    const products = await getProducts();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
  });

  it("each product has required fields", async () => {
    const products = await getProducts();
    for (const p of products) {
      expect(p.id).toBeTruthy();
      expect(p.slug).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(typeof p.price).toBe("number");
      expect(p.wbArticle).toBeGreaterThan(0);
      // Некоторые товары имеют price=0 (не синхронизированы с маркетплейсом,
      // либо архивные без archivedAt в JSON fallback). Не валидируем цену
      // если товар не привязан ни к одному маркетплейсу.
      if (p.wbPrice != null || p.ozonPrice != null) {
        expect(p.price).toBeGreaterThan(0);
      }
    }
  });

  it("getProduct returns correct product by slug", async () => {
    const products = await getProducts();
    const first = products[0];
    const found = await getProduct(first.slug);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(first.id);
  });

  it("getProduct returns null for unknown slug", async () => {
    const found = await getProduct("nonexistent-slug");
    expect(found).toBeNull();
  });

  it("products of a single category have matching category field", async () => {
    const products = await getProducts();
    const crossbody = products.filter((p) => p.category === "crossbody");
    expect(crossbody.length).toBeGreaterThan(0);
    for (const p of crossbody) {
      expect(p.category).toBe("crossbody");
    }
  });

  it("getCategories returns valid category objects", async () => {
    const categories = await getCategories();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    for (const cat of categories) {
      expect(cat.slug).toBeTruthy();
      expect(cat.name).toBeTruthy();
      expect(typeof cat.count).toBe("number");
    }
  });
});

describe("applyModelRatings", () => {
  it("aggregates per-color ratings into a weighted model rating", () => {
    const colors = [
      { modelId: "m1", rating: 4.0, reviewsCount: 10 },
      { modelId: "m1", rating: 5.0, reviewsCount: 5 },
    ];
    const [a, b] = applyModelRatings(colors);
    // (4.0*10 + 5.0*5) / 15 = 65/15 ≈ 4.3333
    expect(a.rating).toBeCloseTo(65 / 15, 5);
    expect(a.reviewsCount).toBe(15);
    expect(b.rating).toBeCloseTo(65 / 15, 5);
    expect(b.reviewsCount).toBe(15);
  });

  it("assigns the model rating to variants without their own rating", () => {
    const list = [
      { modelId: "m1", rating: 4.0, reviewsCount: 2 },
      { modelId: "m1", rating: undefined, reviewsCount: undefined },
    ];
    const [a, b] = applyModelRatings(list);
    // Цвет без своего рейтинга показывает рейтинг модели (всей линейки)
    expect(a.rating).toBe(4.0);
    expect(a.reviewsCount).toBe(2);
    expect(b.rating).toBe(4.0);
    expect(b.reviewsCount).toBe(2);
  });

  it("keeps products without modelId unchanged", () => {
    const list = [
      { modelId: undefined, rating: 3.5, reviewsCount: 2 },
      { modelId: "m2", rating: 5.0, reviewsCount: 1 },
    ];
    const [a, b] = applyModelRatings(list);
    expect(a.rating).toBe(3.5);
    expect(a.reviewsCount).toBe(2);
    expect(b.rating).toBe(5.0);
  });
});
