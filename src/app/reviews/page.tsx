import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import { getShowcaseReviews, getBestReviews, getStoreRatingStats } from "@/data/products";
import type { Review } from "@/data/products";
import RatingStars from "@/components/ui/rating-stars";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from "@/lib/seo-jsonld";

const siteUrl = process.env.SITE_URL || "http://localhost:3001";

const SOURCE_LABEL: Record<string, string> = {
  wb: "Wildberries",
  ozon: "Ozon",
};

export const metadata: Metadata = {
  title: "Отзывы покупателей — Moranti",
  description:
    "Настоящие отзывы покупательниц о сумках Moranti с Wildberries и Ozon. Средний рейтинг магазина 4,7 из 5 по 1828 оценкам. Натуральная итальянская кожа, пошив в Италии.",
  keywords: [
    "отзывы Moranti",
    "сумки Moranti отзывы",
    "отзывы сумок из натуральной кожи",
    "Moranti Wildberries",
    "Moranti Ozon",
  ],
  alternates: {
    canonical: "/reviews",
  },
  openGraph: {
    title: "Отзывы покупателей — Moranti",
    description:
      "Настоящие отзывы покупательниц о сумках Moranti с Wildberries и Ozon. Средний рейтинг магазина 4,7 из 5 по 1828 оценкам.",
    url: "/reviews",
    type: "website",
  },
};

const FAQ = [
  {
    q: "Где читать отзывы о сумках Moranti?",
    a: "Отзывы покупательниц собраны на этой странице и на карточках товаров в каталоге, а также на Wildberries и Ozon — оттуда мы их импортируем. Мы не пишем отзывы сами и не скрываем критику.",
  },
  {
    q: "Какой средний рейтинг сумок Moranti?",
    a: "Средний рейтинг магазина Moranti на маркетплейсах — 4,7 из 5 по более чем 1800 оценкам покупателей.",
  },
  {
    q: "Из чего сделаны сумки Moranti?",
    a: "Сумки Moranti шьются из натуральной итальянской кожи; фурнитура и пошив — в Италии. Мы используем минималистичные формы без кричащих логотипов.",
  },
];

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className={styles.reviewCard}>
      <header className={styles.reviewHead}>
        <span className={styles.reviewAuthor}>{review.author || "Покупатель"}</span>
        {review.source && (
          <span className={styles.reviewSource}>{SOURCE_LABEL[review.source] ?? ""}</span>
        )}
      </header>
      {review.rating != null && (
        <div className={styles.reviewStars}>
          <RatingStars rating={review.rating} />
        </div>
      )}
      <p className={styles.reviewText}>{review.text}</p>
      {formatDate(review.reviewedAt) && (
        <footer className={styles.reviewDate}>{formatDate(review.reviewedAt)}</footer>
      )}
    </article>
  );
}

export default async function ReviewsPage() {
  const [groups, bestReviews, storeRating] = await Promise.all([
    getShowcaseReviews(),
    getBestReviews(12),
    getStoreRatingStats(),
  ]);

  const totalReviews = groups.reduce((sum, g) => sum + g.reviews.length, 0);

  // Средний рейтинг по всем показанным отзывам
  const rated = groups.flatMap((g) => g.reviews.filter((r) => r.rating));
  const avg =
    rated.length > 0
      ? Math.round((rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length) * 10) /
        10
      : null;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbJsonLd(
              [
                { name: "Главная", path: "/" },
                { name: "Отзывы", path: "/reviews" },
              ],
              siteUrl,
            ),
          ),
        }}
      />
      {/* CollectionPage JSON-LD с рейтингом магазина (общий, ~1828 оценок) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildCollectionPageJsonLd(
              "Отзывы покупателей Moranti",
              "Отзывы покупательниц о сумках Moranti с Wildberries и Ozon. Средний рейтинг магазина 4,7 из 5 по 1828 оценкам.",
              "/reviews",
              totalReviews,
              storeRating,
            ),
          ),
        }}
      />
      {/* FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className={styles.page}>
        <nav className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>
            Главная
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>Отзывы</span>
        </nav>

        <section className={styles.banner}>
          <Image
            src="/images/moranti-logo.png"
            alt="Moranti"
            width={72}
            height={72}
            className={styles.bannerLogo}
          />
          <div className={styles.ratingCol}>
            <div className={styles.scoreRow}>
              <span className={styles.score}>
                {(storeRating?.ratingValue ?? avg ?? 0).toFixed(1).replace(".", ",")}
              </span>
              <span className={styles.starsWrap}>
                <RatingStars
                  rating={storeRating?.ratingValue ?? avg ?? 0}
                  size={34}
                />
              </span>
            </div>
            <span className={styles.caption}>
              {storeRating
                ? `${storeRating.reviewCount.toLocaleString("ru-RU")} оценок`
                : `${totalReviews} отзывов`}
            </span>
          </div>
        </section>

        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>Отзывы покупателей</h1>
          <p className={styles.heroDesc}>
            Мы не пишем отзывы сами и не удаляем критику с витрины — ниже
            настоящие оценки покупательниц с маркетплейсов.
          </p>
        </section>

        {/* Кураторская подборка: лучшие и самые подробные отзывы */}
        {bestReviews.length > 0 && (
          <section className={styles.featured}>
            <h2 className={styles.sectionTitle}>Лучшие отзывы</h2>
            <div className={styles.reviewGrid}>
              {bestReviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          </section>
        )}

        {groups.length === 0 ? (
          <p className={styles.empty}>
            Отзывы скоро появятся — мы собираем их с Wildberries и Ozon.
          </p>
        ) : (
          <>
            {/* Топ-12 моделей по числу отзывов — остальное на страницах товаров */}
            {groups.slice(0, 12).map((group) => (
              <section key={group.slug} className={styles.productBlock}>
                <div className={styles.productHeader}>
                  <div className={styles.productThumb}>
                    {group.image && (
                      <Image
                        src={group.image}
                        alt={group.name}
                        fill
                        sizes="96px"
                        style={{ objectFit: "cover" }}
                      />
                    )}
                  </div>
                  <div>
                    <h2 className={styles.productName}>
                      <Link
                        href={`/catalog/${group.slug}`}
                        className={styles.productLink}
                      >
                        {group.name}
                      </Link>
                    </h2>
                    {group.rating != null && (
                      <div className={styles.ratingRow}>
                        <RatingStars rating={group.rating} />
                        <span className={styles.ratingText}>
                          {group.rating.toFixed(1)}
                          {group.reviewsCount ? ` · ${group.reviewsCount} оценок` : ""}
                        </span>
                      </div>
                    )}
                  </div>
                  <Link href={`/catalog/${group.slug}`} className={styles.viewProduct}>
                    К товару →
                  </Link>
                </div>

                <div className={styles.reviewGrid}>
                  {group.reviews.slice(0, 6).map((r) => (
                    <ReviewCard key={r.id} review={r} />
                  ))}
                </div>

                {group.reviews.length > 6 && (
                  <p className={styles.moreNote}>
                    Ещё {group.reviews.length - 6} отзывов — на странице товара.
                  </p>
                )}
              </section>
            ))}
            <p className={styles.moreNote}>
              Это модели с наибольшим числом отзывов. Отзывы конкретной сумки — на
              её странице в каталоге.
            </p>
          </>
        )}

        {/* FAQ — для SEO и удобства */}
        <section className={styles.faq}>
          <h2 className={styles.sectionTitle}>Частые вопросы</h2>
          <div className={styles.faqList}>
            {FAQ.map((item) => (
              <div key={item.q} className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>{item.q}</h3>
                <p className={styles.faqAnswer}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
