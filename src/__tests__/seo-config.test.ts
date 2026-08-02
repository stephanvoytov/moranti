import { describe, it, expect } from "vitest";
import {
  seoConfig,
  applyTemplate,
  pluralRu,
  buildCiteUrl,
  buildProductSeoMeta,
  SEO_LIMITS,
} from "@/config/seo";

describe("applyTemplate", () => {
  it("substitutes placeholders", () => {
    expect(
      applyTemplate("Купить {name}{color} — {price}", {
        name: "Сумка тоут",
        color: " (песочный)",
        price: "12 000 ₽",
      }),
    ).toBe("Купить Сумка тоут (песочный) — 12 000 ₽");
  });

  it("leaves unknown placeholders as-is", () => {
    expect(applyTemplate("{name} {unknown}", { name: "X" })).toBe("X {unknown}");
  });

  it("handles empty vars", () => {
    expect(applyTemplate("Текст {name} без плейсхолдера", {})).toBe(
      "Текст {name} без плейсхолдера",
    );
  });
});

describe("pluralRu", () => {
  it("handles 1/few/many", () => {
    expect(pluralRu(1, "модель", "модели", "моделей")).toBe("модель");
    expect(pluralRu(2, "модель", "модели", "моделей")).toBe("модели");
    expect(pluralRu(5, "модель", "модели", "моделей")).toBe("моделей");
  });

  it("handles teens (11-14) as many", () => {
    expect(pluralRu(11, "модель", "модели", "моделей")).toBe("моделей");
    expect(pluralRu(12, "модель", "модели", "моделей")).toBe("моделей");
    expect(pluralRu(14, "модель", "модели", "моделей")).toBe("моделей");
  });

  it("handles 21/22/25", () => {
    expect(pluralRu(21, "модель", "модели", "моделей")).toBe("модель");
    expect(pluralRu(22, "модель", "модели", "моделей")).toBe("модели");
    expect(pluralRu(25, "модель", "модели", "моделей")).toBe("моделей");
  });

  it("handles 0 as many", () => {
    expect(pluralRu(0, "модель", "модели", "моделей")).toBe("моделей");
  });
});

describe("buildCiteUrl", () => {
  it("builds cite without segments", () => {
    expect(buildCiteUrl("moranti.ru", [])).toBe("https://moranti.ru");
  });

  it("builds cite with breadcrumb segments", () => {
    expect(buildCiteUrl("moranti.ru", ["Каталог", "Кросс-боди"])).toBe(
      "https://moranti.ru › Каталог › Кросс-боди",
    );
  });
});

describe("buildProductSeoMeta", () => {
  const base = {
    name: "Сумка тоут",
    composition: "натуральная итальянская кожа",
    colorName: "песочный, бежевый",
  };

  it("uses first color as discriminator part in title", () => {
    const meta = buildProductSeoMeta(base);
    expect(meta.title).toBe("Moranti — Сумка тоут (песочный)");
    expect(meta.ogTitle).toBe("Moranti — Сумка тоут (песочный)");
  });

  it("builds natural description without price/counters", () => {
    const meta = buildProductSeoMeta(base);
    expect(meta.description).toBe(
      "Женская сумка тоут из натуральной итальянской кожи. Цвет: песочный. Минимализм без логотипов — сумка, которая дополнит любой образ.",
    );
  });

  it("no price part for title even with duplicates", () => {
    // Цена и остатки — динамика, в сниппетах не участвует
    const meta = buildProductSeoMeta(base);
    expect(meta.title).not.toContain("₽");
    expect(meta.description).not.toContain("₽");
  });

  it("falls back to default composition", () => {
    const meta = buildProductSeoMeta({ ...base, composition: null });
    expect(meta.description).toContain("из натуральной кожи.");
  });

  it("handles missing colorName", () => {
    const meta = buildProductSeoMeta({ ...base, colorName: null });
    expect(meta.title).toBe("Moranti — Сумка тоут");
    expect(meta.description).toBe(
      "Женская сумка тоут из натуральной итальянской кожи. Минимализм без логотипов — сумка, которая дополнит любой образ.",
    );
  });

  it("does not duplicate material already in the name", () => {
    // Реальный кейс: «Сумка тоут из замши» + composition из карточки.
    // Иначе Google видит «…из замши из замши натуральной, натуральной кожи».
    const meta = buildProductSeoMeta({
      name: "Сумка тоут из замши",
      composition: "замша натуральная, натуральная кожа",
      colorName: "тауп, капучино",
    });
    expect(meta.description).toBe(
      "Женская сумка тоут из замши. Цвет: тауп. Минимализм без логотипов — сумка, которая дополнит любой образ.",
    );
    expect(meta.description).not.toContain("из замши из замши");
  });

  it("adds composition when name has no material", () => {
    const meta = buildProductSeoMeta({
      name: "Сумка кросс-боди",
      composition: "100% натуральная кожа",
      colorName: null,
    });
    expect(meta.description).toBe(
      "Женская сумка кросс-боди из 100% натуральной кожи. Минимализм без логотипов — сумка, которая дополнит любой образ.",
    );
  });
});

describe("SEO_LIMITS and config sanity", () => {
  it("has sane limits (title 55/70, desc 135)", () => {
    expect(SEO_LIMITS.titleRecommended).toBe(55);
    expect(SEO_LIMITS.titleHardMax).toBe(70);
    expect(SEO_LIMITS.descriptionRecommended).toBe(135);
  });

  it("all static page titles fit recommended limit", () => {
    const titles = [
      seoConfig.site.defaultTitle,
      seoConfig.pages.catalog.title,
      seoConfig.pages.care.title,
      seoConfig.pages.delivery.title,
      seoConfig.pages.favorites.title,
      seoConfig.pages.notFound.title,
      seoConfig.catalog.title,
      ...Object.values(seoConfig.categories).map((c) => c.title),
    ];
    for (const t of titles) {
      expect(t.length, t).toBeLessThanOrEqual(SEO_LIMITS.titleRecommended);
    }
  });

  it("has 6 categories and matching categoryNames", () => {
    expect(Object.keys(seoConfig.categories).sort()).toEqual(
      Object.keys(seoConfig.categoryNames).sort(),
    );
    expect(Object.keys(seoConfig.categories)).toHaveLength(6);
  });

  it("product title template fits limits for realistic input", () => {
    const meta = buildProductSeoMeta({
      name: "Сумка кросс-боди из замши",
      composition: "замша",
      colorName: "пыльная роза",
    });
    // Бренд в начале: даже при обрезке длинного title бренд не теряется.
    // Продуктовые title с цветом-дискриминатором влезают в рекомендованные 55.
    expect(meta.title.length).toBeLessThanOrEqual(SEO_LIMITS.titleRecommended);
    expect(meta.description.length).toBeLessThanOrEqual(
      SEO_LIMITS.descriptionRecommended, // без цены и счётчиков описание не разрастается
    );
  });
});
