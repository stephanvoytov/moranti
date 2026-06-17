# Moranti

**Moranti** — премиальный бренд женских сумок из натуральной итальянской кожи. Сайт-каталог с админ-панелью, ссылками на маркетплейсы (Wildberries, Ozon), избранным, галереей и SEO.

**Стек:** Next.js 16.2.9 (App Router) · TypeScript · CSS Modules · React 19

---

## Быстрый старт

```bash
npm install
npm run dev        # → http://localhost:3001
npm run build      # продакшен-сборка (134 страницы)
npm start          # продакшен-сервер
```

### Переменные окружения

Создайте `.env.local` в корне проекта:

```env
ADMIN_PASSWORD=ваш_пароль    # обязательно
SITE_URL=https://moranti.ru  # обязательно для продакшена
```

Также можно задать через `.env.local` (запасной вариант, если не заполнено в админке):

```env
WB_API_KEY=ваш_ключ          # для живых цен Wildberries
YANDEX_METRIKA_ID=12345678   # Яндекс.Метрика
```

---

## Админ-панель

```
http://localhost:3001/admin
```

| Раздел | URL | Описание |
|--------|-----|----------|
| Вход | `/admin/login` | Авторизация по паролю |
| Дашборд | `/admin` | Статистика по товарам и категориям |
| Товары | `/admin/products` | Список, поиск, фильтр, удаление |
| Редактор товара | `/admin/products/new` | Создание |
| | `/admin/products/[id]` | Редактирование |
| Настройки | `/admin/settings` | Hero, порядок каталога, контакты, соцсети, SEO, API ключи |

### Редактор товаров

- **Фото** — загрузка файлов на сервер (JPEG/PNG/WebP/AVIF до 10 MB) или вставка URL
- **Множественная загрузка** — можно выбрать несколько файлов сразу
- **Drag-and-drop** — перетаскивание фото мышкой для изменения порядка
- **Первое фото = главное** — помечается бейджем «Главная»
- **Превью карточки** — живой просмотр того, как товар выглядит на сайте
- **Артикул WB/Ozon** — ссылки на маркетплейсы генерируются автоматически

### Управление порядком товаров

На странице `/admin/products` — кнопка **≡ Управление порядком**:
- Drag-and-drop всего каталога
- Сохранение порядка в `settings.json`
- Каталог на сайте сортируется по этому порядку

### Настройки сайта

- **Hero** — заголовок, слоган, подзаголовок, изображение (редактируются из админки)
- **Избранное на главной** — ID товаров, которые показываются в блоке «Популярные модели»
- **Порядок каталога** — ID товаров в нужном порядке (или drag-and-drop на странице товаров)
- **API ключи** — WB API Key и Яндекс.Метрика (заполняются через админку или `.env.local`)
- Форма + JSON-редактор (переключение вкладками)

### Авторизация

- Пароль из `ADMIN_PASSWORD` в `.env.local` (по умолчанию `admin`)
- Сессия в AES-256-GCM зашифрованной httpOnly cookie
- Нет серверного состояния — переживает перезагрузки dev-сервера
- Все админ-роуты защищены прокси (`src/proxy.ts`)
- Быстрый доступ с главной — плавающая кнопка (карандаш) справа снизу, видна после логина

### Данные

- Товары: `data/products.json` (113 товаров)
- Настройки: `data/settings.json`
- Фото: `public/images/products/`
- База данных не требуется

---

## Архитектура

### Путь роста: от каталога к магазину

```
Фаза 1 (сейчас)            →   Фаза 2 (магазин)
────────────────────────────────────────────────────
data/products.json         →   PostgreSQL + Prisma
Ссылки на маркетплейсы     →   Корзина + Checkout
ADMIN_PASSWORD (простой)   →   NextAuth.js
lib/wb-config.ts           →   Своя ценообразовательная система
```

### Дизайн (MASTLE-inspired)

| Токен | Значение | Назначение |
|-------|----------|------------|
| `--card-bg` | `#F4F4F3` | Фон карточек и футера |
| `--filter-bg` | `#EAE3D2` | Пиллы фильтрации |
| `--grid-gap` | `30px` | Отступы в сетке |
| `--header-height` | `86px` / `94px` | Высота шапки (desktop / mobile) |
| `--radius-pill` | `4px` | Скругление фильтров |
| `--font-serif` | Playfair Display | Заголовки |
| `--font-sans` | Montserrat | UI / навигация |
| `--font-body` | Inter | Основной текст |

- Белый фон, серые карточки, тёплый серый футер, бежевые фильтры
- Двухуровневый фиксированный хедер (логотип + иконки / навигация)
- Сетка 3/2/1 колонки с адаптивом
- Dropdown-меню «Соцсети» и «Магазины» (CSS :hover)
- Сердце избранного (localStorage + cross-tab sync)

### Страницы

| URL | Тип | Описание |
|-----|-----|----------|
| `/` | Static | Брендовый лендинг (Hero → Коллекции → Популярное → CTA) |
| `/catalog` | Static | Полный каталог с фильтрами, сортировкой, пагинацией |
| `/catalog/[slug]` | SSG (113) | Детальная страница товара + галерея |
| `/about` | Static | О бренде, философия, ценности |
| `/favorites` | Static | Избранное |
| `/admin/*` | Dynamic | Админ-панель |

### Цены

- Статические цены из `data/products.json` — работают всегда, даже офлайн
- Живые цены через Wildberries API (требуется `WB_API_KEY`)
- Клиентский хук `useLivePrice` с батчингом (80ms), TTL 5 мин, stale-while-revalidate
- Публичный эндпоинт `/api/prices?articles=...`

### Избранное

- `FavoritesProvider` (React Context) + localStorage
- Синхронизация между вкладками (storage event)
- Счётчик в хедере
- Страница `/favorites`

### SEO

- `metadataBase`, динамические `generateMetadata` для каждого товара
- `/sitemap.xml` — главная + about + catalog + 113 товаров
- `/robots.txt` — `/admin/` и `/api/` закрыты от индексации
- JSON-LD: Organization + Product (цена, рейтинг, ссылки)
- OpenGraph для соцсетей

---

## Структура проекта

```
moranti/
├── data/
│   ├── products.json          # 113 товаров (source of truth)
│   └── settings.json          # Настройки сайта
├── public/images/
│   ├── icons/                 # wb.svg, ozon.svg
│   └── products/              # Загруженные фото
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout + шрифты + метрика
│   │   ├── page.tsx           # Главная (брендовый лендинг)
│   │   ├── about/             # Страница «О бренде»
│   │   ├── catalog/
│   │   │   ├── page.tsx       # Каталог (фильтры + сетка + пагинация)
│   │   │   └── [slug]/        # Детальная страница (SSG, 113)
│   │   ├── favorites/         # Избранное
│   │   ├── admin/             # Админ-панель
│   │   │   ├── login/         # Вход
│   │   │   └── (auth)/        # Дашборд, товары, настройки
│   │   ├── api/
│   │   │   ├── admin/         # API: login, products, upload, settings
│   │   │   ├── data/          # Публичные данные (products, settings)
│   │   │   └── prices/        # Цены (WB API)
│   │   ├── robots.ts          # robots.txt
│   │   ├── sitemap.ts         # sitemap.xml
│   │   └── demo/              # MASTLE-демо (референс)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header.tsx     # Двухуровневый хедер с dropdown
│   │   │   └── footer.tsx     # Футер
│   │   ├── sections/
│   │   │   └── hero.tsx       # Hero-секция (из настроек)
│   │   └── ui/
│   │       └── product-card.tsx  # Карточка товара
│   ├── data/products.ts       # Серверный адаптер JSON → Product[]
│   ├── lib/
│   │   ├── admin-auth.ts      # Сессии в encrypted cookie
│   │   ├── favorites-context.tsx
│   │   ├── settings.ts        # readSettings / writeSettings
│   │   ├── use-live-price.ts  # Цены с батчингом + TTL
│   │   ├── use-products.ts    # Клиентский хук (/api/data/products)
│   │   └── wb-config.ts       # WB API helpers
│   ├── proxy.ts               # Защита /admin/* (Next.js 16 proxy)
│   └── styles/
│       ├── variables.css      # Дизайн-токены
│       ├── reset.css          # Нормализация
│       └── typography.css     # Типографика
├── .env.local                 # Пароль, API ключи
└── README.md
```

---

## Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер на порту 3001 |
| `npm run build` | Продакшен-сборка (134 страницы) |
| `npm start` | Продакшен-сервер |
| `npm run lint` | Проверка кода ESLint |

---

## Технологии

| Технология | Версия | Назначение |
|-----------|--------|------------|
| Next.js | 16.2.9 | Фреймворк (App Router, RSC, SSG) |
| React | 19.2.4 | UI-библиотека |
| TypeScript | 5.x | Типизация |
| CSS Modules | — | Стилизация |
| ESLint | 9.x | Качество кода |

---

## Лицензия

MIT
