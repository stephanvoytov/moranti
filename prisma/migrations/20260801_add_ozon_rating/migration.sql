-- AlterTable
-- Звёздный рейтинг и количество отзывов Ozon с витрины (браузерный парсинг,
-- webReviewProductScore из composer-api). Применять: npx prisma migrate deploy
ALTER TABLE "Product" ADD COLUMN "ozonRating" DOUBLE PRECISION,
ADD COLUMN "ozonReviewsCount" INTEGER;
