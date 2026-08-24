import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })

import { getPayload } from 'payload'

const email = 'dev@moranti.local'
const password = 'DevPass123!'

const { default: config } = await import('@payload-config')
const payload = await getPayload({ config })

try {
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
  })
  if (existing.totalDocs > 0) {
    console.log('USER_EXISTS')
    process.exit(0)
  }
} catch (e) {
  // ignore
}

const user = await payload.create({
  collection: 'users',
  data: {
    email,
    password,
    name: 'Dev Verify',
    roles: ['admin'],
  },
})

console.log('CREATED', String(user.id), String(user.email))
process.exit(0)
