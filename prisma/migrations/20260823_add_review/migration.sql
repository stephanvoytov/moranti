-- Отзывы с маркетплейсов (единоразовый импорт)
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "author" TEXT,
    "rating" INTEGER,
    "text" TEXT NOT NULL,
    "pros" TEXT,
    "cons" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- FK с каскадом: товар удалён → отзывы удалены
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Уникальность отзыва в рамках источника (идемпотентный импорт)
CREATE UNIQUE INDEX "Review_source_externalId_key" ON "Review"("source", "externalId");
CREATE INDEX "Review_productId_idx" ON "Review"("productId");
