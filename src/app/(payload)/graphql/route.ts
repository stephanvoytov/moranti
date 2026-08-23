import config from '@payload-config'
import {
  GRAPHQL_POST as POST,
  GRAPHQL_PLAYGROUND_GET as GET,
} from '@payloadcms/next/routes'

export const POST = POST(config)
export const GET = GET(config)
