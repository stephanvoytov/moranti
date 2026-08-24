import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })

import { getPayload } from 'payload'

const id = Number(process.argv[2] || 1)
const stock = Number(process.argv[3] || 5)
const directPrice = Number(process.argv[4] || 5000)

const { default: config } = await import('@payload-config')
const payload = await getPayload({ config })

await payload.update({
  collection: 'products',
  id,
  overrideAccess: true,
  data: { isDirectSale: true, stockQuantity: stock, directPrice },
})

console.log(`SET product ${id} -> isDirectSale=true, stockQuantity=${stock}, directPrice=${directPrice}`)
process.exit(0)
