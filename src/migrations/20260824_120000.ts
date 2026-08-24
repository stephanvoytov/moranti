import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Новый enum для поля source блока «Товары»
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typtype = 'e' AND n.nspname = 'public' AND t.typname = 'enum_pages_blocks_products_source') THEN
        CREATE TYPE "enum_pages_blocks_products_source" AS ENUM ('new', 'popular', 'manual');
      END IF;
    END$$;
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_home_hero" (
      "_order" int4 NOT NULL,
      "_parent_id" int4 NOT NULL,
      "_path" text NOT NULL DEFAULT '',
      "id" varchar NOT NULL,
      "eyebrow" varchar,
      "title" varchar,
      "tagline" text,
      "subtitle" text,
      "button_label" varchar,
      "button_href" varchar,
      "image_id" int4,
      "image_url" varchar,
      "image_mobile_id" int4,
      "image_mobile_url" varchar,
      "caption" varchar,
      "block_name" varchar,
      CONSTRAINT "pages_blocks_home_hero_pkey" PRIMARY KEY ("id")
    );
  `)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "pages_blocks_home_hero_parent_id_idx" ON "pages_blocks_home_hero" ("_parent_id");`)
  await db.execute(sql`
    ALTER TABLE "pages_blocks_home_hero"
      ADD CONSTRAINT "pages_blocks_home_hero_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "pages" ("id") ON DELETE CASCADE;
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_products" (
      "_order" int4 NOT NULL,
      "_parent_id" int4 NOT NULL,
      "_path" text NOT NULL DEFAULT '',
      "id" varchar NOT NULL,
      "title" varchar,
      "subtitle" text,
      "source" "enum_pages_blocks_products_source",
      "limit" int4,
      "block_name" varchar,
      CONSTRAINT "pages_blocks_products_pkey" PRIMARY KEY ("id")
    );
  `)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "pages_blocks_products_parent_id_idx" ON "pages_blocks_products" ("_parent_id");`)
  await db.execute(sql`
    ALTER TABLE "pages_blocks_products"
      ADD CONSTRAINT "pages_blocks_products_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "pages" ("id") ON DELETE CASCADE;
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_categories" (
      "_order" int4 NOT NULL,
      "_parent_id" int4 NOT NULL,
      "_path" text NOT NULL DEFAULT '',
      "id" varchar NOT NULL,
      "title" varchar,
      "subtitle" text,
      "block_name" varchar,
      CONSTRAINT "pages_blocks_categories_pkey" PRIMARY KEY ("id")
    );
  `)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "pages_blocks_categories_parent_id_idx" ON "pages_blocks_categories" ("_parent_id");`)
  await db.execute(sql`
    ALTER TABLE "pages_blocks_categories"
      ADD CONSTRAINT "pages_blocks_categories_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "pages" ("id") ON DELETE CASCADE;
  `)

  // Таблица связей для hasMany-отношения manualProducts → products
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_rels" (
      "id" serial PRIMARY KEY,
      "order" int4,
      "parent_id" int4 NOT NULL,
      "path" varchar NOT NULL DEFAULT '',
      "products_id" int4
    );
  `)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "pages_rels_parent_id_idx" ON "pages_rels" ("parent_id");`)
  await db.execute(sql`
    ALTER TABLE "pages_rels"
      ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "pages" ("id") ON DELETE CASCADE;
  `)
  await db.execute(sql`
    ALTER TABLE "pages_rels"
      ADD CONSTRAINT "pages_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "products" ("id") ON DELETE CASCADE;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "pages_blocks_home_hero";`)
  await db.execute(sql`DROP TABLE IF EXISTS "pages_blocks_products";`)
  await db.execute(sql`DROP TABLE IF EXISTS "pages_blocks_categories";`)
  await db.execute(sql`DROP TABLE IF EXISTS "pages_rels";`)
  await db.execute(sql`DROP TYPE IF EXISTS "enum_pages_blocks_products_source";`)
}
