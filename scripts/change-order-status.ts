import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })

import { getPayload } from 'payload'

const id = Number(process.argv[2] || 4)
const status = process.argv[3] || 'processing'

const { default: config } = await import('@payload-config')
const payload = await getPayload({ config })

await payload.update({
  collection: 'orders',
  id,
  overrideAccess: true,
  data: { status: status as any },
})

console.log(`order ${id} -> status ${status}`)
process.exit(0)
