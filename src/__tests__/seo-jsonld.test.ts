import { describe, it, expect } from "vitest";
import type { Product } from "@/data/products";
import {
  buildProductJsonLd,
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildGlobalJsonLd,
  buildItemListJsonLd,
} from "@/lib/seo-jsonld";

const SITE_URL = "https://morantibags.ru";

/** Минимальный товар для тестов микроразметки */
function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    slug: "sumka-tout",
    name: "Сумка тоут",
    price: 12000,
    originalPrice: 14000,
    currency: "RUB",
    category: "tote",
    description: "Классический тоут из натуральной кожи",
    image: "https://cdn.example.com/img.jpg",
    images: ["https://cdn.example.com/img.jpg"],
    marketplaces: [],
    wbArticle: 0,
    inStock: true,
    isDirectSale: false,
    photoCount: 1,
    ...overrides,
  };
}

describe("buildProductJsonLd", () => {
  it("builds base Product entity", () => {
    const p = makeProduct();
    const ld = buildProductJsonLd(p, SITE_URL);
    expect(ld["@type"]).toBe("Product");
    expect(ld.name).toBe("Сумка тоут");
    expect(ld.image).toEqual(["https://cdn.example.com/img.jpg"]);
  });

  it("uses marketplace offers when any is in stock", () => {
    const p = makeProduct({
      marketplaces: [
        { name: "Wildberries", url: "https://wildberries.ru/123", icon: "/wb.svg" },
        { name: "Ozon", url: "https://ozon.ru/456", icon: "/ozon.svg" },
      ],
      wbStock: 5,
      ozonStock: 0,
    });
    const ld = buildProductJsonLd(p, SITE_URL);
    const offers = ld.offers as Record<string, unknown>[];
    // Ozon с нулевым остатком — отфильтрован
    expect(offers).toHaveLength(1);
    expect(offers[0].name).toBe("Купить на Wildberries");
    expect(offers[0].price).toBe(12000);
    expect(offers[0].priceCurrency).toBe("RUB");
  });

  it("falls back to own offer when no marketplace in stock", () => {
    const p = makeProduct({
      marketplaces: [
        { name: "Wildberries", url: "https://wildberries.ru/123", icon: "/wb.svg" },
      ],
      wbStock: 0,
    });
    const ld = buildProductJsonLd(p, SITE_URL);
    const offers = ld.offers as Record<string, unknown>;
    expect(offers["@type"]).toBe("Offer");
    expect(offers.url).toBe(`${SITE_URL}/catalog/sumka-tout`);
  });

  it("includes aggregateRating only when rating >= 3.5 (Google star threshold)", () => {
    const ld = buildProductJsonLd(makeProduct({ rating: 4.8, reviewsCount: 23 }), SITE_URL);
    expect(ld.aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: 4.8,
      reviewCount: 23,
    });

    // Ровно 3.5 — порог входит
    const threshold = buildProductJsonLd(makeProduct({ rating: 3.5, reviewsCount: 2 }), SITE_URL);
    expect(threshold.aggregateRating).toBeDefined();

    // Ниже 3.5 — звёзды в разметке не показываем
    const low = buildProductJsonLd(makeProduct({ rating: 3.2, reviewsCount: 10 }), SITE_URL);
    expect(low.aggregateRating).toBeUndefined();

    const noRating = buildProductJsonLd(makeProduct(), SITE_URL);
    expect(noRating.aggregateRating).toBeUndefined();
  });

  it("includes brand (Merchant listings global identifier)", () => {
    const ld = buildProductJsonLd(makeProduct(), SITE_URL);
    expect(ld.brand).toEqual({ "@type": "Brand", name: "Moranti" });
  });

  it("includes shippingDetails + return policy in every offer (Merchant listings)", () => {
    const ld = buildProductJsonLd(makeProduct(), SITE_URL);
    const raw = ld.offers as Record<string, unknown>[] | Record<string, unknown>;
    const offer = (Array.isArray(raw) ? raw[0] : raw) as Record<string, Record<string, unknown>>;
    expect(offer.shippingDetails["@type"]).toBe("OfferShippingDetails");
    const dest = offer.shippingDetails["shippingDestination"] as Record<string, unknown>;
    expect(dest.addressCountry).toBe("RU");
    expect(offer.hasMerchantReturnPolicy["@type"]).toBe("MerchantReturnPolicy");
    expect(offer.hasMerchantReturnPolicy["merchantReturnDays"]).toBe(14);
  });

  it("includes sku (WB/Ozon article) as global identifier in offers and Product", () => {
    const p = makeProduct({ wbArticle: 1234567, ozonArticle: 8901234 });
    const ld = buildProductJsonLd(p, SITE_URL);
    // WB приоритетнее Ozon
    expect(ld.sku).toBe(1234567);
    const raw = ld.offers as Record<string, unknown>[] | Record<string, unknown>;
    const offer = (Array.isArray(raw) ? raw[0] : raw) as Record<string, unknown>;
    expect(offer.sku).toBe(1234567);
    expect(offer.itemCondition).toBe("https://schema.org/NewCondition");
  });

  it("omits sku when no WB/Ozon article", () => {
    const ld = buildProductJsonLd(makeProduct(), SITE_URL);
    expect(ld.sku).toBeUndefined();
    const raw = ld.offers as Record<string, unknown>;
    expect(raw.sku).toBeUndefined();
  });
});

describe("buildBreadcrumbJsonLd", () => {
  it("builds positions and absolute URLs", () => {
    const ld = buildBreadcrumbJsonLd(
      [
        { name: "Главная", path: "/" },
        { name: "Каталог", path: "/catalog" },
        { name: "Кросс-боди", path: "/catalog/crossbody" },
      ],
      SITE_URL,
    );
    expect(ld["@type"]).toBe("BreadcrumbList");
    const items = ld.itemListElement as Record<string, unknown>[];
    expect(items).toHaveLength(3);
    expect(items[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      name: "Главная",
      item: "https://morantibags.ru/",
    });
    expect(items[2].item).toBe("https://morantibags.ru/catalog/crossbody");
  });
});

describe("buildCollectionPageJsonLd", () => {
  it("fills all fields", () => {
    const ld = buildCollectionPageJsonLd(
      "Кросс-боди",
      "Сумки через плечо.",
      "/catalog/crossbody",
      12,
    );
    expect(ld["@type"]).toBe("CollectionPage");
    expect(ld.name).toBe("Кросс-боди");
    expect(ld.url).toBe("/catalog/crossbody");
    expect(ld.numberOfItems).toBe(12);
  });
});

describe("buildGlobalJsonLd", () => {
  it("returns Organization + WebSite with absolute urls", () => {
    const [org, site] = buildGlobalJsonLd(SITE_URL);
    expect(org["@type"]).toBe("Organization");
    expect(org.url).toBe(SITE_URL);
    expect(org.logo).toBe(`${SITE_URL}/images/moranti-logo.png`);
    expect(site["@type"]).toBe("WebSite");
    expect(site.url).toBe(SITE_URL);
    expect(site.inLanguage).toBe("ru");
    // Без storeRating aggregateRating не добавляется
    expect(org.aggregateRating).toBeUndefined();
  });

  it("adds store aggregateRating when provided", () => {
    const [org] = buildGlobalJsonLd(SITE_URL, {
      ratingValue: 4.7,
      reviewCount: 287,
    });
    expect(org.aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: 4.7,
      reviewCount: 287,
      bestRating: 5,
      worstRating: 1,
    });
  });
});

describe("buildItemListJsonLd", () => {
  it("builds items with positions and product urls", () => {
    const ld = buildItemListJsonLd(
      [
        { slug: "a", name: "Сумка A", image: "https://cdn.example.com/a.jpg" },
        { slug: "b", name: "Сумка B", image: "https://cdn.example.com/b.jpg" },
      ],
      SITE_URL,
    );
    expect(ld["@type"]).toBe("ItemList");
    const items = ld.itemListElement as Record<string, unknown>[];
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Product",
        name: "Сумка A",
        image: "https://cdn.example.com/a.jpg",
        url: "https://morantibags.ru/catalog/a",
      },
    });
    expect(items[1].position).toBe(2);
  });

  it("adds aggregateRating for products with rating >= 3.5 only", () => {
    const ld = buildItemListJsonLd(
      [
        { slug: "a", name: "A", image: "", rating: 4.5, reviewsCount: 155 },
        { slug: "b", name: "B", image: "", rating: 3.0 },
      ],
      SITE_URL,
    );
    const items = ld.itemListElement as Record<string, unknown>[];
    const a = (items[0].item as Record<string, unknown>).aggregateRating;
    const b = (items[1].item as Record<string, unknown>).aggregateRating;
    expect(a).toEqual({
      "@type": "AggregateRating",
      ratingValue: 4.5,
      reviewCount: 155,
    });
    expect(b).toBeUndefined();
  });

  it("handles empty list", () => {
    const ld = buildItemListJsonLd([], SITE_URL);
    expect((ld.itemListElement as unknown[]).length).toBe(0);
  });
});
