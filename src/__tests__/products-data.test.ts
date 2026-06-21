import { describe, it, expect } from "vitest";
import { getProducts, getProduct, getProductsByCategory, getCategories } from "@/data/products";

describe("products data", () => {
  it("getProducts returns array of products", () => {
    const products = getProducts();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
  });

  it("each product has required fields", () => {
    const products = getProducts();
    for (const p of products) {
      expect(p.id).toBeTruthy();
      expect(p.slug).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(typeof p.price).toBe("number");
      expect(p.price).toBeGreaterThan(0);
      expect(p.wbArticle).toBeGreaterThan(0);
    }
  });

  it("getProduct returns correct product by slug", () => {
    const products = getProducts();
    const first = products[0];
    const found = getProduct(first.slug);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(first.id);
  });

  it("getProduct returns null for unknown slug", () => {
    const found = getProduct("nonexistent-slug");
    expect(found).toBeNull();
  });

  it("getProductsByCategory filters correctly", () => {
    const crossbody = getProductsByCategory("crossbody");
    for (const p of crossbody) {
      expect(p.category).toBe("crossbody");
    }
  });

  it("getCategories returns valid category objects", () => {
    const categories = getCategories();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    for (const cat of categories) {
      expect(cat.slug).toBeTruthy();
      expect(cat.name).toBeTruthy();
      expect(typeof cat.count).toBe("number");
    }
  });
});
