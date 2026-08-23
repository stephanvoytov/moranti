import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Блоки «Страниц»: отдельные таблицы на каждый тип блока (+ вложенные массивы).
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE IF EXISTS "pages_blocks_cta_buttons";
   DROP TABLE IF EXISTS "pages_blocks_cta";
   DROP TABLE IF EXISTS "pages_blocks_cards_cards";
   DROP TABLE IF EXISTS "pages_blocks_cards";
   DROP TABLE IF EXISTS "pages_blocks_images_images";
   DROP TABLE IF EXISTS "pages_blocks_images";
   DROP TABLE IF EXISTS "pages_blocks_statement";
   DROP TABLE IF EXISTS "pages_blocks_section_items";
   DROP TABLE IF EXISTS "pages_blocks_section";
   DROP TABLE IF EXISTS "pages_blocks_hero";
   DROP TYPE IF EXISTS "enum_pages_blocks_cta_buttons_style";

   CREATE TYPE "public"."enum_pages_blocks_cta_buttons_style" AS ENUM('primary', 'secondary');

   CREATE TABLE IF NOT EXISTS "pages_blocks_hero" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text DEFAULT '' NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "title" varchar,
    "subtitle" text,
    "image_id" integer,
    "image_url" varchar,
    "image_caption" varchar,
    "block_name" varchar
   );

   CREATE TABLE IF NOT EXISTS "pages_blocks_section" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text DEFAULT '' NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "number" varchar,
    "title" varchar,
    "paragraphs" text,
    "image_id" integer,
    "image_url" varchar,
    "block_name" varchar
   );

   CREATE TABLE IF NOT EXISTS "pages_blocks_section_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "text" text
   );

   CREATE TABLE IF NOT EXISTS "pages_blocks_statement" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text DEFAULT '' NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "text" text,
    "paragraphs" text,
    "image_id" integer,
    "image_url" varchar,
    "block_name" varchar
   );

   CREATE TABLE IF NOT EXISTS "pages_blocks_images" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text DEFAULT '' NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
   );

   CREATE TABLE IF NOT EXISTS "pages_blocks_images_images" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "image_id" integer,
    "image_url" varchar,
    "caption" varchar
   );

   CREATE TABLE IF NOT EXISTS "pages_blocks_cards" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text DEFAULT '' NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "outro" text,
    "block_name" varchar
   );

   CREATE TABLE IF NOT EXISTS "pages_blocks_cards_cards" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "name" varchar,
    "subtitle" varchar,
    "text" text,
    "href" varchar
   );

   CREATE TABLE IF NOT EXISTS "pages_blocks_cta" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text DEFAULT '' NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "text" text,
    "block_name" varchar
   );

   CREATE TABLE IF NOT EXISTS "pages_blocks_cta_buttons" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "href" varchar,
    "style" "enum_pages_blocks_cta_buttons_style" DEFAULT 'primary'
   );

   ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "pages"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_image_id_fk" FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE set null ON UPDATE no action;

   ALTER TABLE "pages_blocks_section" ADD CONSTRAINT "pages_blocks_section_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "pages"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "pages_blocks_section" ADD CONSTRAINT "pages_blocks_section_image_id_fk" FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE set null ON UPDATE no action;
   ALTER TABLE "pages_blocks_section_items" ADD CONSTRAINT "pages_blocks_section_items_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "pages_blocks_section"("id") ON DELETE cascade ON UPDATE no action;

   ALTER TABLE "pages_blocks_statement" ADD CONSTRAINT "pages_blocks_statement_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "pages"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "pages_blocks_statement" ADD CONSTRAINT "pages_blocks_statement_image_id_fk" FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE set null ON UPDATE no action;

   ALTER TABLE "pages_blocks_images" ADD CONSTRAINT "pages_blocks_images_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "pages"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "pages_blocks_images_images" ADD CONSTRAINT "pages_blocks_images_images_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "pages_blocks_images"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "pages_blocks_images_images" ADD CONSTRAINT "pages_blocks_images_images_image_id_fk" FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE set null ON UPDATE no action;

   ALTER TABLE "pages_blocks_cards" ADD CONSTRAINT "pages_blocks_cards_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "pages"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "pages_blocks_cards_cards" ADD CONSTRAINT "pages_blocks_cards_cards_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "pages_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;

   ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "pages"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "pages_blocks_cta_buttons" ADD CONSTRAINT "pages_blocks_cta_buttons_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;

   -- Ручная миграция 150000 добавила бесполезную jsonb-колонку; блоки хранятся в таблицах выше.
   ALTER TABLE "pages" DROP COLUMN IF EXISTS "layout";
   -- Старый richText больше не используется (контент переехал в блоки).
   ALTER TABLE "pages" DROP COLUMN IF EXISTS "content";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "layout" jsonb;
   ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "content" jsonb;
   DROP TABLE IF EXISTS "pages_blocks_cta_buttons";
   DROP TABLE IF EXISTS "pages_blocks_cta";
   DROP TABLE IF EXISTS "pages_blocks_cards_cards";
   DROP TABLE IF EXISTS "pages_blocks_cards";
   DROP TABLE IF EXISTS "pages_blocks_images_images";
   DROP TABLE IF EXISTS "pages_blocks_images";
   DROP TABLE IF EXISTS "pages_blocks_statement";
   DROP TABLE IF EXISTS "pages_blocks_section_items";
   DROP TABLE IF EXISTS "pages_blocks_section";
   DROP TABLE IF EXISTS "pages_blocks_hero";
   DROP TYPE IF EXISTS "enum_pages_blocks_cta_buttons_style";
  `)
}
