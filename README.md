# Moranti

**Moranti** — премиальный бренд женских сумок из натуральной итальянской кожи.
Сайт-каталог с админ-панелью, ссылками на маркетплейсы (Wildberries, Ozon),
системой избранного, галереей и SEO.

**Стек:** Next.js 16.2.9 (App Router) · TypeScript · CSS Modules · Prisma (Prisma Postgres)

---

## Быстрый старт

```bash
npm install
npm run dev        # → http://localhost:3001
npm run build      # продакшен-сборка (81 страница, 54 SSG товаров)
npm start          # продакшен-сервер
```

### Переменные окружения

Создайте `.env.local` в корне проекта:

```env
ADMIN_PASSWORD=ваш_пароль          # обязательно
DATABASE_URL=...                   # Prisma datasource (db.prisma.io:5432)
SITE_URL=https://moranti.ru        # для sitemap/canonical
```

Опционально:

```env
WB_API_KEY=ваш_ключ                # для живых цен Wildberries
YANDEX_METRIKA_ID=12345678         # Яндекс.Метрика
YANDEX_VERIFICATION=               # Яндекс.Вебмастер
```

---

## Админ-панель

```
http://localhost:3001/admin
```

| Раздел | URL | Описание |
|--------|-----|----------|
| Вход | `/admin/login` | Авторизация по паролю |
| Дашборд | `/admin` | Статистика, статус WB sync |
| Товары | `/admin/products` | Список, поиск, drag-to-reorder |
| Редактор товара | `/admin/products/new` | Создание |
| | `/admin/products/[id]` | Редактирование |
| Настройки | `/admin/settings` | Hero, SEO, соцсети, API ключи |
| WB Sync | `/admin/sync` | Синхронизация с Wildberries |

### Редактор товаров

- **Фото** — загрузка файлов (JPEG/PNG/WebP до 10 MB) или URL
- **Множественная загрузка + drag-and-drop** для порядка фото
- **Первое фото = главное** — бейдж «Главная»
- **Живое превью** карточки товара в редакторе
- **Артикулы WB/Ozon** — ссылки на маркетплейсы генерируются автоматически

### Авторизация

- Пароль из `ADMIN_PASSWORD` (по умолчанию `admin`)
- Сессия AES-256-GCM в httpOnly cookie (24h TTL)
- Без серверного состояния — переживает hot reload
- Прокси (`proxy.ts`) вместо deprecated middleware

---

## Архитектура

### Данные: Prisma Postgres

Все данные читаются через Prisma из Postgres (db.prisma.io).
JSON-файлы — только бекап, не source of truth.

| Функция | Описание |
|---------|----------|
| `getProducts()` | Все неархивированные товары (с TTL-кэшем) |
| `getProduct(slug)` | Один товар (из кэша all-products) |
| `getCategories()` | Категории с количеством товаров |
| `readSettings()` | Настройки сайта |

Кэш в памяти: `src/lib/data-cache.ts` — TTL 300s, дедикап in-flight промисов.
Ретрай: `prismaQuery()` — 2 попытки, 500ms→1000ms (холодный старт Prisma Postgres).

### Страницы

| URL | Тип | Описание |
|-----|-----|----------|
| `/` | Static (RSC) | Hero + коллекции + популярные + CTA |
| `/catalog` | Static | Каталог с фильтрами, initial data с сервера |
| `/catalog/[slug]` | SSG (54) | Детальная страница товара |
| `/favorites` | Static | Избранное |
| `/care` | Static | Уход за сумками |
| `/delivery` | Static | Доставка |
| `/demo` | Static | MASTLE-демо (референс) |
| `/admin/*` | Dynamic | Админ-панель |

### SEO

- Динамические `generateMetadata` для каждого товара
- `/sitemap.xml` — главная + care + delivery + catalog + 54 товара
- `/robots.txt` — `/admin/` и `/api/` скрыты
- JSON-LD: Organization + WebSite + Product (цена, рейтинг)
- OpenGraph + Twitter Card (1200×630)
- Favicon chain: 16×16, 32×32, apple-touch-icon 180×180, .ico
- Яндекс.Метрика + Вебмастер (через админку / .env)

### Цены

- Статические цены из БД — работают всегда, даже офлайн
- Живые цены через `useLivePrice` (батчинг 80ms, TTL 5 мин)
- Требуется `WB_API_KEY` для официального API

### Избранное

- `FavoritesProvider` (React Context) + localStorage
- Синхронизация между вкладками (storage event)
- Счётчик в хедере, страница `/favorites`

### Дизайн (MASTLE-inspired)

- **Нет Tailwind** — CSS Modules + CSS Custom Properties
- 3 шрифта: Playfair Display (заголовки), Montserrat (UI), Inter (текст)
- Дизайн-токены: `src/styles/variables.css`
- Бренд-цвет: `#2C2420` (`--dark`)

---

## Структура проекта

```
moranti/
├── data/                     # JSON (sync-log, backup — НЕ source of truth)
├── prisma/
│   └── schema.prisma         # Product + Settings модели
├── public/images/
│   ├── icons/                # wb.svg, ozon.svg, ym.svg
│   └── products/             # Загруженные фото товаров
├── scripts/                  # sync-wb.mjs, wb-categories.js
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout + шрифты + SEO + метрика
│   │   ├── page.tsx          # Главная (серверный компонент)
│   │   ├── home-client.tsx   # Только кнопка админки
│   │   ├── icon.png          # Favicon 32×32
│   │   ├── apple-icon.png    # iOS touch icon 180×180
│   │   ├── opengraph-image.png + twitter-image.png
│   │   ├── robots.ts
│   │   ├── sitemap.ts
│   │   ├── admin/            # Админ-панель
│   │   ├── api/              # API: admin/*, data/products, prices
│   │   ├── catalog/          # Каталог + [slug]/
│   │   ├── care/ + delivery/ + favorites/ + demo/
│   ├── components/
│   │   ├── layout/           # header.tsx, footer.tsx
│   │   ├── sections/         # hero.tsx
│   │   └── ui/               # product-card, gallery-image, scroll-to-top, etc.
│   ├── data/products.ts      # Серверный адаптер Prisma → Product[]
│   ├── lib/
│   │   ├── prisma.ts         # PrismaClient + prismaQuery (retry)
│   │   ├── data-cache.ts     # TTL-кэш + dedup
│   │   ├── admin-auth.ts     # Сессии AES-256-GCM
│   │   ├── settings.ts       # Чтение/запись в Prisma Postgres
│   │   ├── favorites-context.tsx
│   │   └── ...utils
│   ├── proxy.ts              # Next.js 16 proxy (/admin protection)
│   └── styles/               # variables.css, reset.css, typography.css
├── next.config.ts
└── .env.local
```

---

## Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер на порту 3001 |
| `npm run build` | Продакшен-сборка (81 страница) |
| `npm start` | Продакшен-сервер |

---

## Технологии

| Технология | Версия | Назначение |
|-----------|--------|------------|
| Next.js | 16.2.9 | App Router, RSC, SSG |
| React | 19.2.4 | UI |
| TypeScript | ~5 | Типизация |
| CSS Modules | — | Стилизация |
| Prisma | 6.19.3 | ORM (Prisma Postgres — db.prisma.io) |

---

## Лицензия

MIT
