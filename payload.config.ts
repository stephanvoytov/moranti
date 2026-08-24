import { buildConfig } from 'payload'
import type { CustomComponent } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor, UploadFeature } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { ru } from '@payloadcms/translations/languages/ru'

import { Users } from './collections/Users.ts'
import DashboardWidgets from './src/components/admin/DashboardWidgets'
import { Media } from './collections/Media.ts'
import { Products } from './collections/Products.ts'
import { Models } from './collections/Models.ts'
import { Categories } from './collections/Categories.ts'
import { Customers } from './collections/Customers.ts'
import { Orders } from './collections/Orders.ts'
import { Subscribers } from './collections/Subscribers.ts'
import { Pages } from './collections/Pages.ts'
import { Posts } from './collections/Posts.ts'
import { SiteContent } from './collections/SiteContent.ts'
import { SiteSettings } from './collections/SiteSettings.ts'
import { SiteStrings } from './collections/SiteStrings.ts'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || '',
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      // Кнопка «Загрузить картинку» в тулбаре редактора.
      // Файлы кладутся в коллекцию «Медиа» (alt обязателен там же).
      UploadFeature({
        collections: {
          media: {
            fields: [],
          },
        },
      }),
    ],
  }),
  i18n: {
    supportedLanguages: { en, ru },
    fallbackLanguage: 'ru',
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      allowExitOnIdle: true,
    },
    // Схема Payload управляется миграциями (src/migrations). push:false, т.к.
    // при push Drizzle интерактивно спрашивает про переименование enum и
    // зависает на 3 минуты на каждом старте. Таблицы новых блоков страниц уже
    // созданы в БД; для чистоты репозитория стоит добавить миграцию вручную.
    push: false,
  }),
  /* Vercel Blob для медиа реализован хуками коллекции Media
     (collections/Media.ts): официальный плагин @payloadcms/storage-vercel-blob
     не дружит с Turbopack («plugin is not a function»). */
  admin: {
    user: 'users',
    components: {
      beforeDashboard: [DashboardWidgets as unknown as CustomComponent],
    },
  },
  collections: [
    Users,
    Media,
    Products,
    Models,
    Categories,
    Customers,
    Orders,
    Subscribers,
    Pages,
    Posts,
    SiteSettings,
  ],
  globals: [
    SiteContent,
    SiteStrings,
  ],
  typescript: {
    outputFile: 'payload-types.ts',
  },
  serverURL: process.env.SITE_URL || 'http://localhost:3001',

  // Локальная разработка идёт на localhost:3001, а SITE_URL указывает на
  // прод-домен — без этого whitelist Payload блокирует ВСЕ сохранения из
  // админки по CSRF (403 «You are not allowed to perform this action»).
  csrf: [
    'http://localhost:3001',
    'http://localhost:3000',
    'https://dev.morantibags.ru',
    'https://morantibags.ru',
  ],
  cors: [
    'http://localhost:3001',
    'http://localhost:3000',
    'https://dev.morantibags.ru',
    'https://morantibags.ru',
  ],
})
