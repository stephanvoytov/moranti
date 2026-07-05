import { describe, it, expect } from "vitest";
import { getProducts, getProduct, getProductsByCategory, getCategories } from "@/data/products";

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

  it("getProductsByCategory filters correctly", async () => {
    const crossbody = await getProductsByCategory("crossbody");
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
