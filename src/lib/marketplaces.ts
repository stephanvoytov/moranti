/* =============================================
   Moranti — Marketplace Links
   Единственный источник правды для ссылок
   на маркетплейсы. Импортируется везде.
   ============================================= */

/** Favicon URLs для бейджей на фото */
export const MARKETPLACE_FAVICONS = {
  wb: "https://www.wildberries.ru/favicon.ico",
  ozon: "https://www.ozon.ru/favicon.ico",
} as const;

export const MARKETPLACE_URLS = {
  /** Страница продавца Moranti на Wildberries */
  wbSeller: "https://www.wildberries.ru/seller/312222",

  /** Бренд-страница Moranti на Wildberries (включает товары других продавцов) */
  wbBrand: "https://www.wildberries.ru/brands/moranti",

  /** Страница продавца Moranti на Ozon */
  ozonSeller: "https://www.ozon.ru/seller/moranti/?miniapp=seller_4205030",

  /** Шаблон ссылки на карточку товара WB — подставить wbArticle */
  wbProduct: (article: number) =>
    `https://www.wildberries.ru/catalog/${article}/detail.aspx`,

  /** Шаблон ссылки на карточку товара Ozon — подставить ozonArticle */
  ozonProduct: (article: number) =>
    `https://www.ozon.ru/product/${article}/`,
} as const;
