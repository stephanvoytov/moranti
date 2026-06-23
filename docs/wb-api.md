# WB API Reference — Moranti

Все Wildberries API, используемые в проекте. Ни один не требует официального API-ключа
(кроме опционального Content API), все используют публичные эндпоинты.

---

## Data Flow

```
search.wb.ru (поисковый)              ◄─ цены, рейтинги, остатки (всегда)
       │
card.json CDN (basket-*.wbbasket.ru) ◄─ характеристики, даты (инкрементально)
       │
       ▼
   sync-public.mjs ──────────────────► Prisma Postgres (db.prisma.io)
       │
       └── optional ──► data/products.json (--sync-json)
                        data/sync-log.json (всегда)
                        data/wb-scrape-result.json (--save-json, отладка)

Админ-панель (sync-wb.mjs)           ◄─ card.wb.ru + опц. Content API
```

---

## 1. Поисковый API — search.wb.ru

`GET https://search.wb.ru/exactmatch/ru/common/v4/search`

**Аутентификация: нет.** Требует `_wbauid` cookie + ротацию User-Agent.
Без них — 429 после 2-3 запросов.

### Параметры

| Параметр | Значение | Описание |
|----------|----------|----------|
| `query` | `Moranti` | Поисковый запрос |
| `appType` | `1` | Тип приложения (1 = сайт) |
| `curr` | `rub` | Валюта |
| `dest` | `-1257786` | Регион доставки |
| `lang` | `ru` | Язык |
| `locale` | `ru` | Локаль |
| `resultset` | `catalog` | Тип результатов |
| `spp` | `30` | Кэшбек СПП |
| `page` | `1..N` | Пагинация (100 товаров на странице) |

### Полный ответ

```json
{
  "metadata": {
    "catalog_type": "preset",
    "catalog_value": "preset=604497873&_st0=bW9yYW50aQ==~0.111111",
    "original": "Moranti",
    "normquery": "moranti сумка",
    "search_result": {},
    "name": "moranti сумка",
    "rmi": "5",
    "title": "moranti сумка",
    "rs": 60,
    "is_empty": true,
    "qv": "AQEFAQIAAS5cJLOpnSoDLZ...==",
    "kcl": "MoHba4xF4qcvmzxzkPaFxL3K...",
    "preset_normquery_map": {
      "604497873": "moranti сумка"
    }
  },
  "total": 115,
  "products": [
    {
      "id": 969178673,
      "root": 608138357,
      "kindId": 2,
      "brand": "Moranti",
      "brandId": 1487711,
      "siteBrandId": 0,
      "colors": [
        { "name": "бежевый", "id": 16119260 },
        { "name": "белый", "id": 16777215 }
      ],
      "subjectId": 50,
      "subjectParentId": 3,
      "semanticId": [165, 8, 105, 65, 57, 189, 341],
      "name": "Сумка натуральная кожа Италия",
      "entity": "",
      "matchId": 646314409,
      "supplier": "Моранти",
      "supplierId": 312222,
      "supplierRating": 4.7,
      "supplierFlags": 12240,
      "pics": 28,
      "rating": 0,
      "reviewRating": 0,
      "nmReviewRating": 0,
      "feedbacks": 0,
      "nmFeedbacks": 0,
      "panelPromoId": 1041106,
      "volume": 54,
      "weight": 0.6,
      "viewFlags": 1581072,
      "sizes": [
        {
          "name": "",
          "origName": "0",
          "rank": 0,
          "optionId": 1452647281,
          "wh": 507,
          "time1": 2,
          "time2": 22,
          "dtype": 6597069766664,
          "price": {
            "basic": 2035000,
            "product": 946100,
            "logistics": 0,
            "return": 0,
            "cashback": 0
          },
          "saleConditions": 134217728,
          "payload": "A6B0SwM/5oq2QEHVrUuWbuvb..."
        }
      ],
      "totalQuantity": 13,
      "time1": 2,
      "time2": 22,
      "wh": 507,
      "dtype": 6597069766664,
      "dist": 99,
      "meta": {
        "tokens": [],
        "presetId": 604497873
      }
    }
  ]
}
```

### Ключевые поля продукта в search.wb.ru

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | number | **nmId** — артикул WB |
| `root` | number | **imtId** — группа цветов/размеров |
| `brandId` | number | ID бренда (Moranti = 1487711) |
| `supplierId` | number | ID поставщика (Moranti = 312222) |
| `subjectId` | number | Категория WB (всегда 50 для сумок Moranti) |
| `name` | string | Название на WB |
| `sizes[].price.basic` | number | Цена без скидки **в копейках** |
| `sizes[].price.product` | number | Цена со скидкой **в копейках** |
| `rating` | number | Рейтинг (0-5) |
| `feedbacks` | number | Количество отзывов |
| `totalQuantity` | number | Остаток на складах |
| `supplierRating` | number | Рейтинг продавца |
| `pics` | number | Количество фото |
| `colors` | array | Доступные цвета (id + name) |

> **Важно:** цены в копейках. `basic: 2035000` → `20350.00 ₽`, `product: 946100` → `9461.00 ₽`.
> Делить на 100 всегда.

### 429 Rate Limit

Без _wbauid и нормального User-Agent search.wb.ru отвечает 429 после 2-3 запросов.
Решение в `randomHeaders()` — ротация UA + случайный _wbauid при каждом запросе.

---

## 2. CDN — card.json (характеристики товара)

`GET https://basket-{host}.wbbasket.ru/vol{vol}/part{part}/{article}/info/ru/card.json`

**Аутентификация: нет.** Можно бить с любого хоста, 429 бывает редко.

### Vol/Part

Артикул 969008238 → `vol = 9690` (floor / 100000), `part = 969008` (floor / 1000).

### Хосты (в порядке приоритета)

1. `kgd-basket-cdn-01bl.geobasket.ru` — основной, быстрее всех
2. `basket-01.wbbasket.ru` — 1-й запасной
3. `basket-02.wbbasket.ru` — 2-й
4. …
5. `basket-15.wbbasket.ru`

### Пример

```
GET https://kgd-basket-cdn-01bl.geobasket.ru/vol9690/part969008/969008238/info/ru/card.json
```

### Ответ (сокращённый)

```json
{
  "imt_id": 1578724105,
  "nm_id": 969008238,
  "imt_name": "Сумка натуральная кожа Италия",
  "slug": "sumka-naturalnaya-kozha-italiya",
  "subj_name": "Сумки",
  "subj_root_name": "Аксессуары",
  "vendor_code": "MiraBlack",
  "description": "Сумка Moranti из натуральной кожи — это стильное и практичное решение...",
  "options": [
    { "name": "Ширина упаковки", "value": "23 см" },
    { "name": "Высота упаковки", "value": "13 см" },
    { "name": "Длина упаковки", "value": "38 см" },
    { "name": "Цвет", "value": "черный", "charc_type": 1,
      "is_variable": true, "variable_values": ["черный"],
      "variable_value_IDs": [13600062] },
    { "name": "Состав", "value": "натуральная кожа", "charc_type": 1 },
    { "name": "Материал подкладки", "value": "текстиль", "charc_type": 1 },
    { "name": "Высота предмета", "value": "19 см", "charc_type": 4 },
    { "name": "Глубина предмета", "value": "5.5 см", "charc_type": 4 },
    { "name": "Ширина предмета", "value": "27 см", "charc_type": 4 },
    { "name": "Фактура материала", "value": "зернистая кожа", "charc_type": 1 },
    { "name": "Особенности сумки", "value": "среднего размера", "charc_type": 1 },
    { "name": "Количество отделений", "value": "1 шт.", "charc_type": 4 },
    { "name": "Карманы", "value": "внутренний на молнии", "charc_type": 1 },
    { "name": "Назначение ремня сумки", "value": "Через плечо; на плечо; на руку", "charc_type": 1 },
    { "name": "Вид застежки", "value": "клапан; магнит", "charc_type": 1 },
    { "name": "Длина плечевого ремня", "value": "131 см", "charc_type": 4 },
    { "name": "Декоративные элементы", "value": "пряжки", "charc_type": 1 },
    { "name": "Комплектация", "value": "1 шт сумка; 2 шт ремень", "charc_type": 1 },
    { "name": "Страна производства", "value": "Италия", "charc_type": 1 },
    { "name": "Вес товара без упаковки (г)", "value": "700 г", "charc_type": 4 }
  ],
  "compositions": [
    { "name": "натуральная кожа" }
  ],
  "certificate": { "verified": true },
  "nm_colors_names": "черный",
  "colors": [969020680, 969025312, 969008238],
  "contents": "1 шт сумка; 2 шт ремень",
  "full_colors": [
    { "nm_id": 969020680 },
    { "nm_id": 969025312 },
    { "nm_id": 969008238 }
  ],
  "selling": {
    "brand_name": "Moranti",
    "brand_hash": "FBF28C2FCC81AF98",
    "supplier_id": 312222
  },
  "media": { "photo_count": 17 },
  "data": {
    "subject_id": 50,
    "subject_root_id": 3,
    "chrt_ids": [1452415440],
    "tech_size": "0"
  },
  "grouped_options": [
    {
      "group_name": "Основная информация",
      "options": [
        { "name": "Цвет", "value": "черный", "charc_type": 1,
          "is_variable": true, "variable_values": ["черный"],
          "variable_value_IDs": [13600062] },
        { "name": "Состав", "value": "натуральная кожа", "charc_type": 1 }
      ]
    },
    {
      "group_name": "Особенности корпуса",
      "options": [
        { "name": "Количество отделений", "value": "1 шт.", "charc_type": 4 }
      ]
    },
    {
      "group_name": "Дополнительная информация",
      "options": [
        { "name": "Материал подкладки", "value": "текстиль", "charc_type": 1 },
        { "name": "Фактура материала", "value": "зернистая кожа", "charc_type": 1 },
        { "name": "Особенности сумки", "value": "среднего размера", "charc_type": 1 },
        { "name": "Карманы", "value": "внутренний на молнии", "charc_type": 1 },
        { "name": "Назначение ремня сумки", "value": "Через плечо; на плечо; на руку", "charc_type": 1 },
        { "name": "Вид застежки", "value": "клапан; магнит", "charc_type": 1 },
        { "name": "Длина плечевого ремня", "value": "131 см", "charc_type": 4 },
        { "name": "Декоративные элементы", "value": "пряжки", "charc_type": 1 },
        { "name": "Комплектация", "value": "1 шт сумка; 2 шт ремень", "charc_type": 1 },
        { "name": "Страна производства", "value": "Италия", "charc_type": 1 }
      ]
    },
    {
      "group_name": "Габариты",
      "options": [
        { "name": "Длина упаковки", "value": "38 см" },
        { "name": "Высота упаковки", "value": "13 см" },
        { "name": "Ширина упаковки", "value": "23 см" },
        { "name": "Высота предмета", "value": "19 см", "charc_type": 4 },
        { "name": "Глубина предмета", "value": "5.5 см", "charc_type": 4 },
        { "name": "Ширина предмета", "value": "27 см", "charc_type": 4 },
        { "name": "Вес товара без упаковки (г)", "value": "700 г", "charc_type": 4 }
      ]
    }
  ],
  "has_seller_recommendations": true,
  "need_kiz": false,
  "user_flags": 0,
  "update_date": "2026-06-04T14:04:38.279147Z",
  "create_date": "2026-04-16T09:07:31.141066Z"
}
```

### Ключевые поля card.json

| Поле | Тип | Описание |
|------|-----|----------|
| `imt_id` | number | IMT ID (группа цветов/размеров) |
| `nm_id` | number | **nmId** — артикул WB |
| `imt_name` | string | Название карточки на WB |
| `slug` | string | URL-слаг на wildberries.ru |
| `subj_name` | string | Категория («Сумки») |
| `vendor_code` | string | Артикул продавца (MiraBlack и т.д.) |
| `description` | string | HTML-описание товара |
| `options[]` | array | Плоский список характеристик (цвет, состав, размеры, …) |
| `options[].charc_type` | number | 1 = текст, 4 = число |
| `options[].is_variable` | bool | Характеристика влияет на вариант (цвет) |
| `options[].variable_values` | array | Значения варианта (для is_variable) |
| `grouped_options[]` | array | Характеристики, сгруппированные по `group_name` |
| `compositions[]` | array | Материалы (`[{name: "натуральная кожа"}]`) |
| `colors[]` | number[] | nmId других цветов этой модели |
| `full_colors[]` | array | Расширенный список цветов (`{nm_id: ...}`) |
| `selling.brand_name` | string | «Moranti» |
| `selling.supplier_id` | number | 312222 |
| `media.photo_count` | number | Количество фото |
| `data.subject_id` | number | **subj_id** — категория WB (50 для всех сумок) |
| `create_date` | string | ISO-дата создания карточки на WB |
| `update_date` | string | ISO-дата последнего обновления |

---

## 3. CDN — Изображения

`GET https://kgd-basket-cdn-01bl.geobasket.ru/vol{vol}/part{part}/{article}/images/{size}/{index}.webp`

### Размеры

| Size | Размеры |
|------|---------|
| `c246x328` | Маленькая миниатюра |
| `c516x688` | Карточка товара (используется в Moranti) |
| `big` | Оригинал / HD |

### Пример

```
https://kgd-basket-cdn-01bl.geobasket.ru/vol9690/part969008/969008238/images/c516x688/1.webp
https://kgd-basket-cdn-01bl.geobasket.ru/vol9690/part969008/969008238/images/c516x688/2.webp
```

---

## 4. card.wb.ru — детальные карточки (пакетно)

`GET https://card.wb.ru/cards/v2/detail?appType=1&curr=rub&dest=-1257786&nm={articles}`

**Аутентификация: нет.**
**Доступность: только из РФ.** С зарубежного сервера возвращает 403.
Используется в админ-панели (sync-wb.mjs) при работе из России.
429 случается при batch > 200.

### Параметры

| Параметр | Пример | Описание |
|----------|--------|----------|
| `appType` | `1` | Тип приложения |
| `curr` | `rub` | Валюта |
| `dest` | `-1257786` | Регион |
| `nm` | `969008238;969025312` | Артикулы через `;` (batch до 200) |

### Ответ

```json
{
  "data": {
    "products": [
      {
        "id": 969008238,
        "name": "Сумка кросс-боди",
        "brand": "MORANTI",
        "supplierId": 312222,
        "sizes": [
          {
            "price": {
              "basic": 399000,
              "product": 319200
            }
          }
        ],
        "rating": 4.8,
        "feedbacks": 15,
        "totalQuantity": 3,
        "pics": 7,
        "subjectId": 2,
        "colors": [
          { "id": 1, "name": "черный" }
        ]
      }
    ]
  },
  "ts": 1700000000
}
```

Используется в `sync-wb.mjs` как fallback когда нет API-ключа.

---

## 5. WB Content API (официальный)

`https://content-api.wildberries.ru/api/v3/cards/upload`
`https://content-api.wildberries.ru/api/v3/cards/filter`

**Аутентификация: `WB_API_KEY` в заголовке `Authorization`.**

Необязательный, используется только если `WB_API_KEY` задан в .env.
Работает из любой точки мира (в отличие от internal API).

### filter — список карточек продавца

```
POST /api/v3/cards/filter
Authorization: {WB_API_KEY}
Content-Type: application/json

{
  "settings": {
    "cursor": {
      "limit": 100
    },
    "filter": {
      "withPhoto": -1
    }
  }
}
```

### upload — обновление карточек

```
POST /api/v3/cards/upload
Authorization: {WB_API_KEY}
Content-Type: application/json

{
  "cards": [
    {
      "nmID": 969008238,
      "vendorCode": "mor-038",
      "characteristics": [
        { "id": 12, "value": ["Черный"] }
      ]
    }
  ]
}
```

---

## 6. Internal: Brand Filters API (категории)

`GET https://www.wildberries.ru/__internal/u-catalog/brands/v8/filters`

**Аутентификация: нет, но блокирует серверные запросы из-за РФ (498).**
Работает только из браузера в РФ.

### Параметры

| Параметр | Пример | Описание |
|----------|--------|----------|
| `brand` | `1487711` | ID бренда Moranti |
| `subject` | `50` | ID категории (сумки женские — все сумки Moranti) |

### Важно: subject=50

**Все товары Moranti имеют subjectId=50** (общая категория «Сумки»).
subcat/subj_id из card.json (1-8, 25) — это уточняющая категория внутри,
но для API фильтрации используется именно subject=50.

### Ответ (filter options)

```json
{
  "data": {
    "filters": [
      {
        "key": "f59122",
        "name": "Модель сумки",
        "values": [
          { "id": 121288, "name": "кросс-боди" },
          { "id": 66114,  "name": "на плечо" },
          { "id": 536008, "name": "багет" },
          { "id": 477557, "name": "тоут" },
          { "id": 464080, "name": "седло" }
        ]
      }
    ]
  }
}
```

> **5 моделей сумок.** Рюкзака в этом списке нет — WB не помечает Moranti рюкзаки
> отдельной моделью. В Moranti добавлена 6-я категория `backpack` вручную.

---

## 7. Internal: Catalog by Filter API

`GET https://www.wildberries.ru/__internal/u-catalog/brands/v4/catalog`

**Аутентификация: нет, но блокирует из-за РФ.** Работает из браузера.

### Параметры

| Параметр | Пример | Описание |
|----------|--------|----------|
| `brand` | `1487711` | ID бренда Moranti |
| `subject` | `50` | Категория «Сумки» |
| `f59122` | `121288` | ID модели из Filter API |

### Пример

```
GET /__internal/u-catalog/brands/v4/catalog?brand=1487711&subject=50&f59122=121288
```

### Ответ

```json
{
  "data": {
    "products": [
      {
        "id": 969008238,
        "root": 57805948,
        "colors": [
          { "id": 1, "name": "черный" }
        ],
        "sizes": [],
        "name": "Сумка кросс-боди"
      }
    ],
    "total": 19
  }
}
```

### Результаты (на момент 23.06.2026)

| model ID | Model | Count | Категория Moranti |
|----------|-------|-------|-------------------|
| 121288 | кросс-боди | 19 | crossbody |
| 66114 | на плечо | 2 | na-plecho |
| 536008 | багет | 7 | baguette |
| 477557 | тоут | 9 | tote |
| 464080 | седло | 3 | saddle |
| *нет модели* | *рюкзаки и др.* | 12 | backpack / baguette / tote / crossbody |

---

## 8. Internal: Seller Catalog API (токен)

`GET https://www.wildberries.ru/__internal/u-catalog/sellers/v4/catalog?supplier=312222`

**Аутентификация: `x_wbaas_token` cookie из браузера** (не используется в production).

Блокирует с сервера — используется только для референса через DevTools.

---

## 9. Public: Supplier API (документированный)

`GET https://suppliers-api.wildberries.ru/api/v3/cards/filter`

**Требует API-ключ из личного кабинета WB.**

Не используется (Content API предпочтительнее).

---

## Rate Limiting

| Эндпоинт | Поведение | Решение |
|----------|-----------|---------|
| search.wb.ru | 429 после 2-3 запросов | `randomHeaders()`: ротация UA + _wbauid |
| card.wb.ru | 429 при batch > 200 | Batch по 100, sleep 300ms |
| card.json CDN | почти нет | 3 retry по хостам |
| internal API | 498 из-за РФ | Только через DevTools / браузер |

---

## Идентификаторы

| ID | Описание |
|----|----------|
| `312222` | **supplierId** — ID поставщика Moranti на WB |
| `1487711` | **brandId** — ID бренда Moranti (для filter API) |
| `50` | **subjectId** — общая категория «Сумки» (все товары Moranti) |

### subj_id из card.json (уточняющая категория)

| subj_id | Категория | Название |
|:-------:|-----------|----------|
| 1 | crossbody | Сумки женские |
| 2 | na-plecho | Сумки на плечо |
| 3 | tote | Шоперы |
| 5 | backpack | Рюкзаки |
| 6 | saddle | Сумки-седло |
| 7 | crossbody | Клатчи |
| 8 | baguette | Сумки-багет |
| 25 | crossbody | Сумки-кросс-боди |

---

## Скрипты

| Скрипт | Назначение | Использует эндпоинты |
|--------|-----------|---------------------|
| `sync-public.mjs` | **(основной)** Единая синхронизация, без токена | search.wb.ru, card.json CDN |
| `apply-wb-categories.mjs` | Категории из WB filter API (разовый, по необходимости) | internal filter + catalog |
| `sync-wb.mjs` | Синхронизация для админки (из РФ) | card.wb.ru, опц. Content API |
| `scrape-wb.mjs` | Полный scrape (legacy, с токеном браузера) | internal seller API |

### Утилиты

| Файл | Назначение |
|------|-----------|
| `scripts/wb-utils.mjs` | CDN_HOSTS, getVolPart, sleep, randomHeaders, fetchCardJson, cardCdnUrl, **batchFetchCardJson** |
| `scripts/wb-categories.js` | Маппинг subj_id → категория Moranti |
| `scripts/name-generator.js` | Генерация названий (категория + материал) |
| `src/lib/wb-image.ts` | Трансформация URL изображений (c516x688 → big) |
| `src/lib/wb-prices.ts` | Живые цены (Content API + кэш) |
| `src/lib/wb-sync.ts` | Серверная обёртка sync-wb.mjs для админки |
| `src/lib/wb-config.ts` | Типы и URL (WB_CONTENT_API, WB_PRICING_API) |

### sync-public.mjs флаги

| Флаг | Описание |
|------|----------|
| *(без флагов)* | Инкрементальный: цены всегда, card.json только если устарело (24h) |
| `--full` | Полный прогон: все card.json заново |
| `--sync-json` | После синхронизации обновить `data/products.json` (для Vercel build) |
| `--save-json` | Сохранить `data/wb-scrape-result.json` для отладки |
| `--dry` | Ничего не писать в БД, только показать что будет сделано |
