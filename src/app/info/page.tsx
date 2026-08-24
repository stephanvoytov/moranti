import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import { getStoreRatingStats } from "@/data/products";
import RatingStars from "@/components/ui/rating-stars";
import { buildBreadcrumbJsonLd } from "@/lib/seo-jsonld";

const siteUrl = process.env.SITE_URL || "http://localhost:3001";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Информация — Moranti",
  description:
    "Вся информация о бренде Moranti: о бренде, отзывы покупательниц, доставка и оплата, уход за сумками, контакты и политика конфиденциальности.",
  alternates: {
    canonical: "/info",
  },
  openGraph: {
    title: "Информация — Moranti",
    description:
      "О бренде, отзыв. Доставка, уход, контакты и политика конфиденциальности Moranti.",
    url: "/info",
    type: "website",
  },
};

const SECTIONS = [
  {
    title: "О бренде",
    href: "/about",
    text: "Философия Moranti: сдержанный дизайн, натуральная итальянская кожа и ручная работа.",
    cta: "О бренде →",
  },
  {
    title: "Отзывы",
    href: "/reviews",
    text: "Настоящие отзывы покупательниц с Wildberries и Ozon. Мы не пишем их сами и не скрываем критику.",
    cta: "Читать отзывы →",
  },
  {
    title: "Доставка и оплата",
    href: "/delivery",
    text: "Сроки и способы доставки, варианты оплаты и условия возврата.",
    cta: "Подробнее →",
  },
  {
    title: "Уход за сумками",
    href: "/care",
    text: "Как сохранить натуральную кожу и замшу, чтобы сумка служила годами.",
    cta: "Советы по уходу →",
  },
  {
    title: "Контакты",
    href: "/contacts",
    text: "Телефон, почта и соцсети — мы на связи и помогаем с любыми вопросами.",
    cta: "Связаться →",
  },
  {
    title: "Политика конфиденциальности",
    href: "/privacy",
    text: "Как мы собираем, используем и защищаем ваши данные.",
    cta: "Открыть →",
  },
];

export default async function InfoPage() {
  const storeRating = await getStoreRatingStats();

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: SECTIONS.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.title,
      url: `${siteUrl}${s.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbJsonLd(
              [
                { name: "Главная", path: "/" },
                { name: "Информация", path: "/info" },
              ],
              siteUrl,
            ),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <div className={styles.page}>
        <nav className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>
            Главная
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>Информация</span>
        </nav>

        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>Информация</h1>
          <p className={styles.heroDesc}>
            Всё, что полезно знать о бренде Moranti: материалы и философия,
            отзывы покупательниц, доставка, уход за сумками и контакты.
          </p>
        </section>

        {storeRating && storeRating.ratingValue != null && (
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
                  {storeRating.ratingValue.toFixed(1).replace(".", ",")}
                </span>
                <span className={styles.starsWrap}>
                  <RatingStars rating={storeRating.ratingValue} size={34} />
                </span>
              </div>
              <span className={styles.caption}>
                {storeRating.reviewCount.toLocaleString("ru-RU")} оценок
              </span>
            </div>
          </section>
        )}

        <section className={styles.cards}>
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} className={styles.card}>
              <h2 className={styles.cardTitle}>{s.title}</h2>
              <p className={styles.cardText}>{s.text}</p>
              <span className={styles.cardCta}>{s.cta}</span>
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}
