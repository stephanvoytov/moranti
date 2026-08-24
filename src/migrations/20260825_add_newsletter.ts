import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "newsletter" (
      "id" serial PRIMARY KEY,
      "subject" varchar,
      "message" jsonb,
      "updated_at" timestamp(3) NOT NULL DEFAULT now(),
      "created_at" timestamp(3) NOT NULL DEFAULT now()
    )
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "newsletter"`)
}
