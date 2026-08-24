import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import config from '@payload-config'
import { invalidateCache } from '@/lib/data-cache'
import { defaultStrings, siteContentData } from '../seed-products/seed-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const payload = await getPayload({ config })

  await payload.updateGlobal(
    { slug: 'site-strings', data: { strings: defaultStrings }, overrideAccess: true },
  )

  await payload.updateGlobal(
    { slug: 'site-content', data: siteContentData, overrideAccess: true },
  )

  invalidateCache()
  return NextResponse.json({ ok: true })
}
