import configPromise from '@payload-config'
import { getPayload } from 'payload'

const config = await configPromise
config.secret = process.env.PAYLOAD_SECRET

const payload = await getPayload({ config })

const existing = await payload.find({
  collection: 'users',
  where: { email: { equals: 'admin@moranti.local' } },
})

if (existing.totalDocs > 0) {
  console.log('admin already exists')
} else {
  await payload.create({
    collection: 'users',
    data: {
      email: 'admin@moranti.local',
      password: 'Admin123!',
      name: 'Admin',
      roles: ['admin'],
    },
  })
  console.log('admin created')
}
