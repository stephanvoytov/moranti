/* ============================================================
   Moranti — JSON-LD (Schema.org) builders
   Единый источник микроразметки: страницы товара, каталога и
   превью в админке (/admin/seo) используют одни и те же функции,
   поэтому расхождений между «что отдаём» и «что показываем» нет.
   ============================================================ */

import type { Product } from "@/data/products";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

/** Offer'ы: маркетплейсы с ненулевым остатком, иначе — собственный offer */
function buildOffers(
  product: Product,
  siteUrl: string,
): Record<string, unknown>[] | Record<string, unknown> {
  const mpInStock = (name: string): boolean =>
    name === "Wildberries"
      ? (product.wbStock ?? 0) > 0
      : name === "Ozon"
        ? (product.ozonStock ?? 0) > 0
        : true;

  const available = (product.marketplaces ?? []).filter((mp) =>
    mpInStock(mp.name),
  );

  // Идентификатор для Google: артикул WB приоритетнее Ozon.
  const sku = product.wbArticle || product.ozonArticle || undefined;

  return available.length
    ? available.map((mp) => ({
        "@type": "Offer",
        name: `Купить на ${mp.name}`,
        url: mp.url,
        price: product.price,
        priceCurrency: "RUB",
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        sku,
        ...merchantFields(),
      }))
    : {
        "@type": "Offer",
        url: `${siteUrl}/catalog/${product.slug}`,
        price: product.price,
        priceCurrency: "RUB",
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        sku,
        ...merchantFields(),
      };
}

/**
 * Поля, которые Google требует для Merchant listings:
 * доставка (shippingDetails) и политика возврата (hasMerchantReturnPolicy).
 * Доставка по России, бесплатно, 1–2 дня на обработку, 1–5 дней в пути.
 * Возврат — 14 дней (по правилам Wildberries/Ozon).
 */
function merchantFields(): Record<string, unknown> {
  return {
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "RUB" },
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "RU" },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: {
          "@type": "QuantitativeValue",
          minValue: 1,
          maxValue: 2,
          unitCode: "DAY",
        },
        transitTime: {
          "@type": "QuantitativeValue",
          minValue: 1,
          maxValue: 5,
          unitCode: "DAY",
        },
      },
    },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "RU",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 14,
      returnMethod: "https://schema.org/ReturnByMail",
    },
  };
}

/** Product JSON-LD: название, описание, фото, офферы (цена + наличие), рейтинг */
export function buildProductJsonLd(
  product: Product,
  siteUrl: string,
): Record<string, unknown> {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: "Moranti" },
    // Глобальный идентификатор (нет GTIN — используем артикул WB/Ozon)
    sku: product.wbArticle || product.ozonArticle || undefined,
    image: product.images?.length ? product.images : [product.image],
    offers: buildOffers(product, siteUrl),
  };

  // Google показывает звёзды рейтинга в сниппете только для рейтинга >= 3.5;
  // ниже порога разметку не добавляем, чтобы не путать Google.
  if (product.rating && product.rating >= 3.5) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewsCount || 0,
    };
  }

  return jsonLd;
}

/** BreadcrumbList: Главная › Каталог › [страница] */
export function buildBreadcrumbJsonLd(
  items: BreadcrumbItem[],
  siteUrl: string,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}

/** CollectionPage: каталог целиком или отдельная категория */
export function buildCollectionPageJsonLd(
  name: string,
  description: string,
  url: string,
  numberOfItems: number,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    numberOfItems,
  };
}

/**
 * Глобальная микроразметка для layout.tsx: Organization + WebSite.
 * Единственный источник — админ-превью (/admin/seo) показывает то же самое.
 */
export function buildGlobalJsonLd(siteUrl: string): Record<string, unknown>[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Moranti",
      alternateName: "Моранти",
      url: siteUrl,
      logo: `${siteUrl}/images/moranti-logo.png`,
      description:
        "Женские сумки из натуральной итальянской кожи. Минималистичные формы, без кричащих логотипов.",
      contactPoint: { "@type": "ContactPoint", contactType: "sales" },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Moranti",
      alternateName: "Моранти",
      url: siteUrl,
      description: "Премиальные кожаные сумки ручной работы",
      inLanguage: "ru",
    },
  ];
}

/** ItemList: сетка товаров (популярные модели на главной) */
export function buildItemListJsonLd(
  products: Pick<Product, "slug" | "name" | "image">[],
  siteUrl: string,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteUrl}/catalog/${p.slug}`,
      name: p.name,
      image: p.image,
    })),
  };
}