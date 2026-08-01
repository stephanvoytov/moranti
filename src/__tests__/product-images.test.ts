import { describe, it, expect } from "vitest";
import { selectProductImages, pickDisplayImage } from "@/lib/product-images";

describe("selectProductImages", () => {
  const wbImages = { image: "wb.jpg", images: ["wb.jpg", "wb2.jpg"] };
  const ozonImages = { ozonImage: "oz.jpg", ozonImages: ["oz.jpg", "oz2.jpg"] };

  it("WB в наличии — сохраняются сохранённые (WB) фото", () => {
    const res = selectProductImages({ wbStock: 5, ...wbImages, ...ozonImages });
    expect(res).toEqual(wbImages);
  });

  it("wbStock = 0 — берутся Ozon-фото", () => {
    const res = selectProductImages({ wbStock: 0, ...wbImages, ...ozonImages });
    expect(res.image).toBe("oz.jpg");
    expect(res.images).toEqual(["oz.jpg", "oz2.jpg"]);
  });

  it("wbStock = null — берутся Ozon-фото", () => {
    const res = selectProductImages({ wbStock: null, ...wbImages, ...ozonImages });
    expect(res.image).toBe("oz.jpg");
    expect(res.images).toEqual(["oz.jpg", "oz2.jpg"]);
  });

  it("нет в наличии и нет ozonImages — сохраняются сохранённые фото", () => {
    const res = selectProductImages({ wbStock: 0, ...wbImages });
    expect(res).toEqual(wbImages);
  });

  it("нет фото — fallback-генерация из артикула WB", () => {
    const res = selectProductImages({ wbStock: 3, wbArticle: 1234567, photoCount: 2 });
    expect(res.image).toContain("1234567");
    expect(res.images.length).toBe(2);
  });

  it("ozonImage без ozonImages — одно фото", () => {
    const res = selectProductImages({ wbStock: 0, image: "wb.jpg", ozonImage: "oz.jpg" });
    expect(res).toEqual({ image: "oz.jpg", images: ["oz.jpg"] });
  });
});

describe("pickDisplayImage", () => {
  it("WB в наличии — сохранённое фото", () => {
    expect(pickDisplayImage({ wbStock: 5, image: "wb.jpg", ozonImage: "oz.jpg" })).toBe("wb.jpg");
  });

  it("wbStock = 0 — Ozon-фото", () => {
    expect(pickDisplayImage({ wbStock: 0, image: "wb.jpg", ozonImage: "oz.jpg" })).toBe("oz.jpg");
  });

  it("wbStock = null — Ozon-фото", () => {
    expect(pickDisplayImage({ wbStock: null, image: "wb.jpg", ozonImage: "oz.jpg" })).toBe("oz.jpg");
  });

  it("нет Ozon-фото — сохранённое фото", () => {
    expect(pickDisplayImage({ wbStock: 0, image: "wb.jpg" })).toBe("wb.jpg");
  });

  it("ничего нет — null", () => {
    expect(pickDisplayImage({ wbStock: 0, image: null, ozonImage: null })).toBeNull();
  });
});
