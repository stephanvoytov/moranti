import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "magic_token" text;
  `)
  await db.execute(sql`
   ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "magic_token_expiry" timestamptz;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "customers" DROP COLUMN IF EXISTS "magic_token";
  `)
  await db.execute(sql`
   ALTER TABLE "customers" DROP COLUMN IF EXISTS "magic_token_expiry";
  `)
}
