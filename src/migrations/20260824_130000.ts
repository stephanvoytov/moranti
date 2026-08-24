import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Поле group в массиве strings глобали «Тексты сайта» (select → varchar)
  await db.execute(sql`
    ALTER TABLE "site_strings_strings" ADD COLUMN IF NOT EXISTS "group" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_strings_strings" DROP COLUMN IF EXISTS "group";
  `)
}
