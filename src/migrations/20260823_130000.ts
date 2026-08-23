import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "footer_about_text" jsonb;

   CREATE TABLE IF NOT EXISTS "site_strings" (
    "id" serial PRIMARY KEY NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );

   CREATE TABLE IF NOT EXISTS "site_strings_strings" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "key" varchar,
    "label" varchar,
    "value" varchar
   );

   ALTER TABLE "site_strings_strings" ADD CONSTRAINT "site_strings_strings_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "site_strings"("id") ON DELETE CASCADE;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_strings_strings" DROP CONSTRAINT IF EXISTS "site_strings_strings_parent_fk";
   DROP TABLE IF EXISTS "site_strings_strings";
   DROP TABLE IF EXISTS "site_strings";
   ALTER TABLE "site_content" DROP COLUMN IF EXISTS "footer_about_text";
  `)
}
