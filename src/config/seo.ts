/* =============================================
   Moranti — SEO config
   Единственный источник SEO-данных: страницы,
   категории, шаблоны товаров и сайт-дефолты.
   Просмотр с превью: /admin/seo
   ============================================= */

export interface SeoPageMeta {
  /** Шаблон title; плейсхолдеры {name} {color} {price} {count} {minPrice} */
  title: string;
  /** Шаблон description; те же плейсхолдеры */
  description: string;
  /** Закрыть от индексации (robots: index: false) */
  noindex?: boolean;
}

export interface SeoCategoryMeta extends SeoPageMeta {
  /** Название для breadcrumb («Кросс-боди») */
  name: string;
}

export interface SeoConfig {
  site: {
    siteName: string;
    locale: string;
    defaultTitle: string;
    defaultDescription: string;
    keywords: string[];
    ogImage: string;
    ogImageAlt: string;
    twitterImage: string;
    /** Шаблон суффикса title: "%s — Moranti" */
    titleTemplate: string;
  };
  pages: Record<
    "home" | "catalog" | "care" | "delivery" | "favorites" | "admin" | "notFound",
    SeoPageMeta
  >;
  categories: Record<string, SeoCategoryMeta>;
  product: {
    /** "{name}{color} — купить | Moranti". Без цены: динамика вредит сниппету (Google кеширует) */
    titleTemplate: string;
    /** "{name}{color} — Moranti" (для openGraph) */
    ogTitleTemplate: string;
    /** "Женская {name} из {composition}.{colorPart} Доставка по России — Moranti." */
    descriptionTemplate: string;
  };
  catalog: {
    /** "Каталог кожаных сумок — купить | Moranti" */
    title: string;
    /** Статично: без счётчиков и цен (динамика кешируется Google и устаревает) */
    description: string;
  };
  /** Разделитель breadcrumb в URL-строке превью */
  breadcrumbSeparator: string;
  /** Склонённые названия категорий для описаний товаров */
  categoryNames: Record<string, string>;
}

export const seoConfig: SeoConfig = {
  site: {
    siteName: "Moranti",
    locale: "ru_RU",
    defaultTitle: "Moranti — Сумки из итальянской кожи",
    defaultDescription:
      "Moranti — женские сумки из натуральной итальянской кожи. Минималистичные формы, без кричащих логотипов. Доставка по всей России.",
    keywords: [
      "сумки", "Moranti", "кожаные сумки", "натуральная итальянская кожа",
      "женские сумки", "сумки через плечо", "сумки из замши", "классические сумки",
      "кросс-боди", "тоут", "багет", "рюкзак кожаный",
    ],
    ogImage: "/opengraph-image.png",
    ogImageAlt: "Moranti — сумки из итальянской кожи",
    twitterImage: "/twitter-image.png",
    titleTemplate: "%s — Moranti",
  },

  pages: {
    home: {
      title: "Moranti — Сумки из итальянской кожи",
      description:
        "Moranti — женские сумки из натуральной итальянской кожи. Минималистичные формы, без кричащих логотипов. Доставка по всей России.",
    },
    catalog: {
      title: "Каталог кожаных сумок — купить | Moranti",
      description:
        "Каталог {count} кожаных сумок Moranti: кросс-боди, тоуты, багеты, седла, рюкзаки из натуральной кожи и замши. От {minPrice} ₽. Доставка по России.",
    },
    care: {
      title: "Уход за сумками",
      description:
        "Рекомендации по уходу за сумками Moranti из натуральной итальянской кожи и замши. Как чистить, хранить и продлить срок службы.",
    },
    delivery: {
      title: "Доставка",
      description: "Как заказать и получить сумку Moranti. Доставка через Wildberries и Ozon.",
    },
    favorites: {
      title: "Избранное",
      description: "Сохранённые сумки Moranti — натуральная итальянская кожа и замша.",
      noindex: true,
    },
    admin: {
      title: "",
      description: "",
      noindex: true,
    },
    notFound: {
      title: "Товар не найден",
      description: "",
    },
  },

  categories: {
    crossbody: {
      name: "Кросс-боди",
      title: "Сумки кросс-боди из натуральной кожи — Moranti",
      description:
        "Сумки кросс-боди из натуральной кожи и замши: руки свободны, а образ собран. Компактные и вместительные модели на каждый день.",
    },
    "na-plecho": {
      name: "На плечо",
      title: "Сумки на плечо из натуральной кожи — Moranti",
      description:
        "Классические сумки на плечо из натуральной кожи: повседневные модели, которые сочетаются с любым гардеробом — от офиса до прогулки.",
    },
    baguette: {
      name: "Багет",
      title: "Сумки-багет из кожи и замши — Moranti",
      description:
        "Компактные сумки-багет из натуральной кожи и замши: городской шик с ремешком через плечо. Модели, которые не выходят из моды.",
    },
    tote: {
      name: "Тоут",
      title: "Сумки-тоуты из натуральной кожи — Moranti",
      description:
        "Вместительные шоперы и тоуты из натуральной кожи и замши: для работы, учёбы и шопинга. Не теряют форму и служат годами.",
    },
    saddle: {
      name: "Седло",
      title: "Сумки-седло из натуральной кожи — Moranti",
      description:
        "Сумки-седло из натуральной кожи с характерным изгибом: casual-модель, которая выделяет образ. Минимализм без логотипов.",
    },
    backpack: {
      name: "Рюкзаки",
      title: "Кожаные рюкзаки — Moranti",
      description:
        "Кожаные рюкзаки: компактные городские и вместительные для прогулок. Удобно носить каждый день.",
    },
  },

  product: {
    /**
     * "Moranti — {name}{color}". Бренд в начале: при обрезке длинного title
     * (55-60 символов) бренд не теряется. Без цены: динамика вредит сниппету
     * (Google кеширует).
     */
    titleTemplate: "Moranti — {name}{color}",
    /** "Moranti — {name}{color}" (для openGraph) */
    ogTitleTemplate: "Moranti — {name}{color}",
    /**
     * "Женская {name}{compositionPart}.{colorPart} Минимализм без логотипов —
     * сумка, которая дополнит любой образ."
     * compositionPart: " из натуральной кожи" или "" — материал уже в названии
     * («Сумка тоут из замши»), дублировать его нельзя.
     * УТП «минимализм без логотипов» — вместо шаблонной «Доставка по России».
     */
    descriptionTemplate:
      "Женская {name}{compositionPart}.{colorPart} Минимализм без логотипов — сумка, которая дополнит любой образ.",
  },
  catalog: {
    /** "Каталог кожаных сумок — Moranti" */
    title: "Каталог кожаных сумок — Moranti",
    /** Статично: без счётчиков и цен (динамика кешируется Google и устаревает) */
    description:
      "Каталог кожаных сумок Moranti: кросс-боди, тоуты, багеты, седла, рюкзаки из натуральной кожи и замши. Большой выбор моделей. Доставка по России.",
  },

  breadcrumbSeparator: " › ",

  categoryNames: {
    crossbody: "кросс-боди",
    "na-plecho": "на плечо",
    baguette: "багет",
    tote: "тоут",
    saddle: "седло",
    backpack: "рюкзак",
  },
};

/* ─── Хелперы ─── */

/** Подставить плейсхолдеры {name} в шаблон; неизвестные ключи остаются как есть */
export function applyTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? vars[key] : match,
  );
}

/** Русская плюрализация: 1 модель, 2 модели, 5 моделей */
export function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/** Собрать URL-строку превью: https://домен › сегмент1 › сегмент2 */
export function buildCiteUrl(domain: string, segments: string[]): string {
  return `https://${domain}${segments
    .map((s) => `${seoConfig.breadcrumbSeparator}${s}`)
    .join("")}`;
}

/* ─── Генерация меты товара ─── */

/** Структурный тип — конфиг не зависит от data-слоя */
export interface ProductSeoInput {
  name: string;
  /** string | undefined в некоторых источниках data-слоя */
  composition?: string | null;
  colorName?: string | null;
}

export interface ProductSeoMeta {
  title: string;
  ogTitle: string;
  description: string;
}

/**
 * Мета карточки товара по шаблонам из конфига.
 * Без динамики (цена/остатки): Google кеширует сниппеты, цена меняется.
 * Цвет — первый из colorName («песочный, бежевый» → «песочный»).
 * Материал: если он уже в названии («Сумка тоут из замши») — не дублируем.
 */
export function buildProductSeoMeta(product: ProductSeoInput): ProductSeoMeta {
  const name = product.name.toLowerCase();
  // Материал в названии? Тогда composition из карточки не добавляем.
  // «Сумка кросс-боди из хлопок 92%…» и «Сумка кросс-боди» (без материала) — добавляем.
  const materialInName = / из /.test(name);
  const compositionPart = materialInName
    ? ""
    : ` из ${genitive(product.composition?.trim() || "натуральной кожи")}`;

  const color = (product.colorName ?? "").split(",")[0].trim();
  const colorPart = color ? ` (${color})` : "";
  const colorSentence = color ? ` Цвет: ${color}.` : "";

  return {
    title: applyTemplate(seoConfig.product.titleTemplate, {
      name: product.name,
      color: colorPart,
    }),
    ogTitle: applyTemplate(seoConfig.product.ogTitleTemplate, {
      name: product.name,
      color: colorPart,
    }),
    description: applyTemplate(seoConfig.product.descriptionTemplate, {
      name,
      compositionPart,
      colorPart: colorSentence,
    }),
  };
}

/** Родительный падеж для материалов («натуральная итальянская кожа» → «натуральной итальянской кожи»).
 *  Внимание: \b не работает с кириллицей (JS word chars — только ASCII), поэтому границы — через lookahead. */
function genitive(s: string): string {
  return s
    .replace(/натуральная(?![а-яё])/g, "натуральной")
    .replace(/итальянская(?![а-яё])/g, "итальянской")
    .replace(/кожа(?![а-яё])/g, "кожи")
    .replace(/замша(?![а-яё])/g, "замши");
}

/** Рекомендованные пороги длины (замеры Google 2025-2026, Semrush + живые данные) */
export const SEO_LIMITS = {
  // Десктоп режет title по ширине ~580-600px в ОДНУ строку.
  // Кириллица шире латиницы: в 600px влезает ~50-55 символов (проверено рендером:
  // 55 влезает, 58 уже обрезается). Перенос на 2-ю строку — только мобайл (~920px, до ~78 символов).
  titleRecommended: 55,
  // Выше — обрезка многоточием гарантирована даже на мобильном
  titleHardMax: 70,
  descriptionRecommended: 135, // средняя длина сниппета: 146 десктоп / 136 мобайл
} as const;
