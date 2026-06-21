import { describe, it, expect, beforeEach } from "vitest";
import {
  getRecentlyViewed,
  addRecentlyViewed,
  clearRecentlyViewed,
} from "@/lib/recently-viewed";

const STORAGE_KEY = "moranti_recently_viewed";

beforeEach(() => {
  localStorage.clear();
});

describe("recently-viewed", () => {
  it("returns empty array initially", () => {
    expect(getRecentlyViewed()).toEqual([]);
  });

  it("adds a single article", () => {
    addRecentlyViewed(100);
    expect(getRecentlyViewed()).toEqual([100]);
  });

  it("prepends new articles", () => {
    addRecentlyViewed(100);
    addRecentlyViewed(200);
    expect(getRecentlyViewed()).toEqual([200, 100]);
  });

  it("deduplicates and moves to front", () => {
    addRecentlyViewed(100);
    addRecentlyViewed(200);
    addRecentlyViewed(100);
    expect(getRecentlyViewed()).toEqual([100, 200]);
  });

  it("caps at 10 items", () => {
    for (let i = 1; i <= 12; i++) {
      addRecentlyViewed(i);
    }
    expect(getRecentlyViewed()).toHaveLength(10);
    expect(getRecentlyViewed()[0]).toBe(12);
    expect(getRecentlyViewed()[9]).toBe(3);
  });

  it("clears all items", () => {
    addRecentlyViewed(100);
    addRecentlyViewed(200);
    clearRecentlyViewed();
    expect(getRecentlyViewed()).toEqual([]);
  });
});
