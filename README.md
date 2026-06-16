# Moranti — Сумки, которые говорят без слов

**Moranti** — премиальный бренд женских сумок. Сайт работает как каталог со ссылками на маркетплейсы (Wildberries, Ozon) и спроектирован для плавного перехода в полноценный интернет-магазин.

**Стек:** Next.js 16.2.9 (App Router) · TypeScript · CSS Modules · React 19

---

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev
# → http://localhost:3001

# Сборка для продакшена
npm run build

# Старт продакшен-сервера
npm start
```

### Переменные окружения

Создайте файл `.env.local` в корне проекта:

```env
# Админ-панель (обязательно)
ADMIN_PASSWORD=ваш_пароль

# Яндекс.Метрика (опционально)
YANDEX_METRIKA_ID=12345678

# Адрес сайта для sitemap и canonical (обязательно для продакшена)
SITE_URL=https://moranti.ru

# Wildberries Content API (опционально — для живых цен)
# WB_API_KEY=ваш_ключ
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
| Редактор | `/admin/products/new` | Создание товара |
| | `/admin/products/[id]` | Редактирование товара |
| Настройки | `/admin/settings` | Hero, контакты, соцсети, SEO |

### Возможности редактора товаров

- **Фото:** загрузка файлов на сервер (JPEG/PNG/WebP/AVIF до 10 MB) или вставка URL
- **Несколько фото:** первое = главное, остальные в галерее на детальной странице
- **Артикул WB:** ссылка на Wildberries генерируется автоматически
- **Артикул Ozon:** ссылка на Ozon генерируется автоматически
- **Без артикулов:** товар создаётся без ссылок на маркетплейсы

### Авторизация

- Пароль из `ADMIN_PASSWORD` в `.env.local` (по умолчанию `admin`)
- Сессия в AES-256-GCM зашифрованной httpOnly cookie
- Нет серверного состояния — переживает перезагрузки dev-сервера
- Все админ-роуты защищены (кроме `/admin/login`)

### Данные

- Товары хранятся в `data/products.json` — редактируется через админку или напрямую
- Настройки сайта в `data/settings.json`
- Загруженные фото в `public/images/products/`
- Никакой базы данных не требуется

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
| `--card-bg` | `#F4F4F3` | Фон карточек товаров |
| `--filter-bg` | `#EAE3D2` | Пиллы фильтрации |
| `--grid-gap` | `30px` | Отступы в сетке |
| `--header-height` | `86px` / `94px` | Высота шапки (desktop / mobile) |
| `--radius-pill` | `4px` | Скругление фильтров |
| `--font-serif` | Playfair Display | Заголовки |
| `--font-sans` | Montserrat | UI / навигация |
| `--font-body` | Inter | Основной текст |

- Белый фон, серые карточки, бежевые фильтры
- Двухуровневый фиксированный хедер
- Сетка 3/2/1 колонки с адаптивом
- Бургер-меню на мобильных
- Сердце избранного (localStorage + cross-tab sync)

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
- `/sitemap.xml` — главная + 113 товаров
- `/robots.txt` — `/admin/` и `/api/` закрыты от индексации
- JSON-LD: Organization + Product (цена, рейтинг, ссылки)
- OpenGraph для соцсетей (title, description, image)

---

## Структура проекта

```
moranti/
├── data/
│   ├── products.json        # 113 товаров (source of truth)
│   └── settings.json        # Настройки сайта
├── public/
│   └── images/
│       ├── icons/           # Иконки маркетплейсов (wb, ozon)
│       └── products/        # Загруженные фото товаров
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout + шрифты + метрика
│   │   ├── page.tsx         # Главная (каталог + фильтр + пагинация)
│   │   ├── globals.css      # Импорт дизайн-системы
│   │   ├── robots.ts        # robots.txt
│   │   ├── sitemap.ts       # sitemap.xml
│   │   ├── admin/           # Админ-панель
│   │   │   ├── layout.tsx
│   │   │   ├── login/       # Страница входа
│   │   │   └── (auth)/      # Дашборд, товары, настройки
│   │   ├── api/
│   │   │   └── admin/       # API: login, products, upload, settings
│   │   ├── catalog/
│   │   │   └── [slug]/      # Детальная страница + галерея
│   │   ├── favorites/       # Избранное
│   │   └── demo/            # MASTLE-демо (референс)
│   ├── components/
│   │   ├── layout/
│   │   │   └── header.tsx   # Двухуровневый хедер
│   │   └── ui/
│   │       └── product-card.tsx  # Карточка товара
│   ├── data/
│   │   └── products.ts      # Серверный адаптер (читает JSON)
│   ├── lib/
│   │   ├── admin-auth.ts    # Сессии в encrypted cookie
│   │   ├── favorites-context.tsx
│   │   ├── settings.ts      # readSettings / writeSettings
│   │   ├── use-live-price.ts
│   │   ├── use-products.ts  # Клиентский хук (/api/data/products)
│   │   └── wb-config.ts     # WB API types + helpers
│   ├── proxy.ts             # Защита /admin/* (Next.js 16 proxy)
│   └── styles/
│       ├── variables.css    # Дизайн-токены
│       ├── reset.css        # Нормализация
│       └── typography.css   # Типографика
├── .env.local               # Пароль админки, ключи API
├── .gitignore
├── next.config.ts
├── package.json
└── README.md
```

---

## Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер на порту 3001 |
| `npm run build` | Продакшен-сборка (129+ страниц) |
| `npm start` | Продакшен-сервер |
| `npm run lint` | Проверка кода ESLint |

---

## Технологии

| Технология | Версия | Назначение |
|-----------|--------|------------|
| Next.js | 16.2.9 | Фреймворк (App Router, RSC) |
| React | 19.2.4 | UI-библиотека |
| TypeScript | 5.x | Типизация |
| CSS Modules | — | Стилизация |
| ESLint | 9.x | Качество кода |

---

## Лицензия

MIT
