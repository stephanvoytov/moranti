# Moranti

**Moranti** — премиальный бренд женских сумок из натуральной итальянской кожи.
Сайт-каталог с админ-панелью, синхронизацией с маркетплейсами (Wildberries, Ozon),
живыми ценами, системой избранного и полным SEO.

**Продакшен:** <https://morantibags.ru>
**Dev/preview:** <https://dev.morantibags.ru>

**Стек:** Next.js 16.2 (App Router, SSG) · TypeScript · CSS Modules · Prisma 7 (Postgres на своём VPS)

---

## Быстрый старт

```bash
npm install
npm run dev        # → http://localhost:3001
npm run build      # build-sync-bundle.mjs → prisma generate → next build
npm start          # продакшен-сервер
npm test           # vitest
npm run lint       # eslint .
```

### Переменные окружения

Создайте `.env.local` в корне проекта (секреты не коммитятся):

```env
ADMIN_PASSWORD=ваш_пароль          # доступ в админку (default "admin")
DATABASE_URL=...                   # Postgres (VPS)
SITE_URL=https://dev.morantibags.ru # канонический URL для dev; на проде — https://morantibags.ru
```

Опционально:

```env
WB_API_KEY=...                     # живые цены Wildberries (официальный API)
OZON_CLIENT_ID=...                 # Ozon Seller API
OZON_API_KEY=...
YANDEX_VERIFICATION=...            # Яндекс.Вебмастер
GOOGLE_SITE_VERIFICATION=...       # Google Search Console (fallback — код из layout.tsx)
BLOB_READ_WRITE_TOKEN=...          # Vercel Blob (загрузка медиа)
AUTH_SALT=...                      # соль для PBKDF2 (fallback "moranti-admin-salt-v1")
SYNC_ENABLED=...                   # включить синхронизацию
APP_ENV=production                 # "production" → sitemap/robots/index; иначе noindex
```

## Домен и деплой

| Куда | Как |
|------|-----|
| Продакшен | Vercel, проект **`moranti`**, ветка `master`, домен **`morantibags.ru`** |
| Dev/preview | Vercel preview-деплои + домен **`dev.morantibags.ru`** |
| База данных | Postgres на собственном VPS (`docker-compose.vps.yml`) |
| CI/CD | GitHub Actions: `ci.yml` (lint+test+tsc), `migrate.yml` (prisma migrate deploy), `sync-wb.yml` (расписание 5/11/17 UTC) |

### DNS (reg.ru)

Домен подключён к Vercel, но DNS-записи должны указывать на Vercel:

```
A  morantibags.ru       → 76.76.21.21
A  dev.morantibags.ru   → 76.76.21.21   # или CNAME dev.morantibags.ru → cname.vercel-dns.com
```

> Ранее фронт крутился на VPS (openresty). Теперь домен идёт напрямую на Vercel,
> VPS остаётся только для Postgres.

### Переменные окружения в Vercel

| Окружение | SITE_URL |
|-----------|----------|
| Production | `https://morantibags.ru` |
| Preview | `https://dev.morantibags.ru` |
| Development | `https://dev.morantibags.ru` |

`SITE_URL` используется для canonical/OG/sitemap. `robots.ts` и `sitemap.ts`
отдают `noindex`/пустой sitemap вне `APP_ENV=production` — dev/preview не индексируются.

---

## Админ-панель

```
https://morantibags.ru/admin
```

| Раздел | URL | Описание |
|--------|-----|----------|
| Вход | `/admin/login` | Авторизация по паролю (AES-256-GCM cookie, 24h) |
| Дашборд | `/admin` | Статистика |
| Товары | `/admin/products` | Список, поиск, drag-to-reorder, 60×80 превью + lightbox |
| Создание | `/admin/products/new` | Создание товара |
| Редактор | `/admin/products/[slug]` | Секции: Основное / Описание / Маркетплейсы / Характеристики |
| Варианты | `/admin/products/models/[id]`, `/admin/models/[id]` | Группы моделей |
| Настройки | `/admin/settings` | Hero, соцсети, API-ключи |
| SEO | `/admin/seo` | Шаблоны title/description, превью Google/Facebook/Twitter (`@power-seo/preview`) |
| Медиа | `/admin/media` | Библиотека медиа: загрузка/удаление с проверкой использования |
| Синхронизация | `/admin/sync` | Wildberries + Ozon: история, прогресс, запуск |

### Авторизация

- Пароль из `ADMIN_PASSWORD` (по умолчанию `admin`)
- Сессия AES-256-GCM в httpOnly cookie (TTL 24h), ключ из PBKDF2(AUTH_SALT, 100k итераций)
- Без серверного состояния — переживает hot reload
- Защита `/admin/*` и CORS `/api/data/*` — через `proxy.ts` (Next.js 16 proxy вместо deprecated middleware)

---

## Архитектура

### Данные: Postgres на VPS

Все чтения идут через Prisma с ретраями и кэшем; JSON-файлы — только фолбэк/бэкап:

| Слой | Файл | Роль |
|------|------|------|
| DB-адаптер | `src/lib/prisma.ts` | Singleton + `prismaQuery()` — 3 ретрая (1s→2s→4s) на ошибки соединения |
| TTL-кэш | `src/lib/data-cache.ts` | In-memory, TTL **30s** + SWR 10 мин, дедуп in-flight промисов |
| JSON-фолбэк | `data/products.json`, `data/settings.json` | Только когда БД недоступна; бэкап вручную |
| Серверный адаптер | `src/data/products.ts` | `getProducts()`, `getProduct(slug)`, `getCategories()`, `getAllSlugs()` |
| Настройки | `src/lib/settings.ts` | `readSettings()` / `writeSettings()` |

**После любой мутации** (create/update/delete/sync): `invalidateCache()` +
`revalidatePath("/")` + `revalidatePath("/catalog")`.

### Страницы

| URL | Тип | Описание |
|-----|-----|----------|
| `/` | Static (RSC) | Hero + коллекции + популярные + CTA |
| `/catalog` | Static | Каталог с фильтрами и категориями |
| `/catalog/[slug]` | SSG | Детальная страница товара |
| `/favorites` | Static | Избранное (localStorage) |
| `/care` | Static | Уход за сумками |
| `/delivery` | Static | Доставка |
| `/admin/*` | Dynamic | Админ-панель |
| `/api/*` | Dynamic | API: admin, data, prices, blob |

### Синхронизация (Wildberries + Ozon)

- Логика: `scripts/sync-all.mjs` → бандл `scripts/sync-all.bundle.mjs` (esbuild), который
  импортирует `src/lib/sync-runner.ts` (не тянет node_modules на Vercel).
- `npm run build` всегда собирает бандл первым (`build-sync-bundle.mjs`).
- Фазы: **PHASE 1** Wildberries (карточки/цены/остатки/аналитика) → **PHASE 2** Ozon →
  **PHASE 2.5** Ozon real prices (headless Chromium) → **PHASE 3** Models.
- История в таблице `SyncRun` (+ JSON-фолбэк `data/sync-history.json`).
- Эндпоинты: `POST/GET /api/admin/sync` (WB), `/api/admin/sync/ozon` (Ozon),
  прогресс `/api/admin/sync/progress?runId=...`.
- GitHub Actions `sync-wb.yml`: `xvfb-run -a node scripts/sync-all.mjs` с Chromium от patchright.

### Ozon real prices (headless-браузер)

- Реальные цены (с картой/без) парсятся с публичных страниц Ozon через headless Chromium.
- Используется **patchright** (форк Playwright) — обычный Playwright блокируется Variti
  (HTTP 403 "Antibot Challenge"), patchright проходит (проверено Jul 2026).
- Модули: `scripts/sync-modules/ozon-browser.mjs` (Chromium, Variti-pass, composer-api)
  + `ozon-price.mjs` (парсинг `webPrice`).
- На Vercel браузер отключён (`isBrowserAvailable()` → `VERCEL=1`/`NEXT_PHASE`).
- SKU без публичной страницы (редирект в поиск) пропускаются — не падаем, просто не обновляем цену.

### SEO

- `src/config/seo.ts` — центральный SEO-конфиг (страницы, категории, шаблоны title/description)
- **URL-слаги товаров** — транслитерация названия + цвета (`buildUrlSlug` в `scripts/sync-modules/transform.mjs`):
  «Сумка тоут из замши» + «серый, графит» → `/catalog/sumka-tout-iz-zamshi-seryj-grafit`.
  Старые слаги из внутреннего артикула переезжают через 301-редиректы
  (`data/slug-redirects.json` → `next.config.ts`, генератор `scripts/migrate-slugs.mjs`).
- Динамические `generateMetadata` для каждого товара
- `/sitemap.xml` — главная + категории + care + delivery + все товары (только при `APP_ENV=production`)
- `/robots.txt` — `/admin/` и `/api/` скрыты; dev/preview — полный noindex
- JSON-LD (`src/lib/seo-jsonld.ts`): Organization + WebSite + Product (цена, рейтинг) + BreadcrumbList
- OpenGraph + Twitter Card (1200×630)
- Верификация: Яндекс.Вебмастер (`YANDEX_VERIFICATION`) + Google Search Console (`GOOGLE_SITE_VERIFICATION`); Яндекс.Метрика — константа `YANDEX_METRIKA_ID` в `src/config/analytics.ts`
- SEO-превью в админке: `@power-seo/preview` (Google/Facebook/Twitter)

### Цены

- Статические цены из БД — работают всегда, даже без API
- Живые цены: `useLivePrice` (батчинг 80ms, TTL 5 мин)
- Требуется `WB_API_KEY` для официального API

### Избранное

- `FavoritesProvider` (React Context) + localStorage
- Синхронизация между вкладками (storage event)
- Счётчик в хедере, страница `/favorites`

### Дизайн

- **Нет Tailwind** — CSS Modules + CSS Custom Properties
- 3 шрифта: Playfair Display (заголовки), Montserrat (UI/цены), Inter (текст)
- Дизайн-токены: `src/styles/variables.css`
- Бренд-цвет: `#2C2420` (`--dark`)
- Рейтинг показывается при `rating >= 4`; звёзды с полушагами (4.2–4.6 → 4.5)

---

## Структура проекта

```
moranti/
├── data/                      # JSON-фолбэки и бэкапы (НЕ source of truth)
│   ├── products.json, settings.json
│   └── slug-redirects.json    # карта старый slug → новый (для 301, генерит migrate-slugs)
├── prisma/
│   └── schema.prisma          # Product, Settings, SyncRun, Media…
├── public/images/
│   ├── icons/                 # wb.svg, ozon.svg
│   └── products/              # Загруженные фото товаров
├── scripts/
│   ├── sync-all.mjs           # Синхронизация WB/Ozon (фазы)
│   ├── sync-modules/          # transform (buildUrlSlug), ozon-browser, ozon-price, merge, models…
│   ├── migrate-slugs.mjs      # Пересчёт URL-слагов + генерация slug-redirects.json
│   ├── build-sync-bundle.mjs  # esbuild → sync-all.bundle.mjs
│   └── backup.mjs, backup-fallback.mjs, update-json-fallback.mjs, wb-categories.js…
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout + шрифты + SEO + метрика
│   │   ├── page.tsx           # Главная (серверный компонент)
│   │   ├── robots.ts, sitemap.ts
│   │   ├── admin/             # Админ-панель (login, products, settings, seo, media, sync, models)
│   │   ├── api/               # API: admin/*, data/*, prices, blob/[...path]
│   │   ├── catalog/           # Каталог + [slug]/
│   │   ├── care/, delivery/, favorites/
│   ├── components/
│   │   ├── layout/            # header.tsx, footer.tsx
│   │   └── ui/                # product-card, gallery-image, rating-stars…
│   ├── config/seo.ts          # SEO-конфиг (шаблоны, категории)
│   ├── data/products.ts       # Серверный адаптер Prisma → Product[]
│   ├── lib/
│   │   ├── prisma.ts          # PrismaClient + prismaQuery (ретраи)
│   │   ├── data-cache.ts      # TTL-кэш 30s + SWR + dedup
│   │   ├── admin-auth.ts      # Сессии AES-256-GCM
│   │   ├── sync-runner.ts     # Оркестрация синхронизации
│   │   ├── settings.ts, marketplaces.ts, schemas.ts, cors.ts, csrf.ts
│   │   └── seo-jsonld.ts, favorites-context.tsx, recently-viewed.ts
│   ├── proxy.ts               # Next.js 16 proxy (защита /admin, CORS /api/data)
│   └── styles/                # variables.css, reset.css, typography.css
├── .github/workflows/         # ci.yml, migrate.yml, sync-wb.yml
├── docker-compose.vps.yml     # Postgres для VPS
├── next.config.ts
└── .env.local
```

---

## Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер на порту 3001 |
| `npm run build` | Бандл синхронизации → `prisma generate` → `next build` |
| `npm start` | Продакшен-сервер |
| `npm test` | Vitest (jsdom, 30s timeout) |
| `npm run lint` | ESLint |
| `npx vitest run --pool=threads --maxWorkers=1` | Тесты на Windows (воркер-fork падает) |
| `node scripts/migrate-slugs.mjs` | Preview пересчёта URL-слагов (после переименования товаров) |
| `node scripts/migrate-slugs.mjs --apply` | Применить новые слаги в БД + записать `data/slug-redirects.json` |
| `node scripts/backup-fallback.mjs` | Перегенерировать `data/products.json` из БД |

> На Windows дефолтный fork-пул vitest может падать с «Worker exited unexpectedly» —
> используйте threads-пул. В CI (ubuntu) всё работает и так.

---

## Технологии

| Технология | Версия | Назначение |
|-----------|--------|------------|
| Next.js | 16.2.12 | App Router, RSC, SSG, proxy |
| React | 19.2.7 | UI |
| TypeScript | ~5 | Типизация |
| CSS Modules | — | Стилизация |
| Prisma | 7.8.0 | ORM (Postgres на VPS) |
| Vitest | 4.x | Тесты |
| patchright | 1.61.x | Headless Chromium для Ozon-цен |

---

## Лицензия

MIT
