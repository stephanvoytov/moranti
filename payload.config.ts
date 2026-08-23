import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'

import { Users } from './collections/Users.ts'
import { Subscribers } from './collections/Subscribers.ts'
import { SiteSettings } from './collections/SiteSettings.ts'
import { Products } from './collections/Products.ts'
import { Models } from './collections/Models.ts'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || '',
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    // Не удаляем и не трогаем существующие Prisma-таблицы (Product/Model/Subscriber/...)
    // при старте дев-сервера. Схема Payload управляется миграциями (src/migrations).
    push: false,
  }),
  admin: {
    user: 'users',
  },
  collections: [Users, Subscribers, SiteSettings, Products, Models],
  typescript: {
    outputFile: 'payload-types.ts',
  },
  serverURL: process.env.SITE_URL || 'http://localhost:3001',
})
