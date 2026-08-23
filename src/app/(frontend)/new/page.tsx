import type { Metadata } from "next";
import Link from "next/link";
import { getProducts } from "@/data/products";
import { buildBreadcrumbJsonLd } from "@/lib/seo-jsonld";
import ProductCard from "@/components/ui/product-card";
import styles from "./page.module.css";

export const revalidate = 3600;

const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;
// «Сейчас» фиксируется один раз при загрузке модуля (окно новинок — 90 дней).
const NOW = Date.now();

export const metadata: Metadata = {
  title: "Новинки — Moranti",
  description:
    "Свежие поступления кожаных сумок Moranti. Натуральная итальянская кожа, новые формы и расцветки.",
  alternates: { canonical: "/new" },
  openGraph: {
    title: "Новинки — Moranti",
    description:
      "Свежие поступления кожаных сумок Moranti из натуральной итальянской кожи.",
    url: "/new",
  },
};

export default async function NewArrivalsPage() {
  const products = await getProducts();

  const newArrivals = [...products]
    .filter(
      (p) =>
        p.wbCreatedAt &&
        NOW - new Date(p.wbCreatedAt).getTime() <= THREE_MONTHS_MS,
    )
    .sort(
      (a, b) =>
        new Date(b.wbCreatedAt!).getTime() - new Date(a.wbCreatedAt!).getTime(),
    );

  const siteUrl = process.env.SITE_URL || "http://localhost:3001";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbJsonLd(
              [
                { name: "Главная", path: "/" },
                { name: "Новинки", path: "/new" },
              ],
              siteUrl,
            ),
          ),
        }}
      />

      <div className={styles.page}>
        <section className={styles.intro}>
          <div className="container">
            <p className={styles.eyebrow}>Свежие поступления</p>
            <h1 className={styles.title}>Новинки</h1>
            <p className={styles.lead}>
              То, что появилось в коллекции за последние три месяца. Натуральная
              итальянская кожа, новые силуэты и оттенки — успейте заметить
              первыми.
            </p>
          </div>
        </section>

        <section className={styles.gridSection}>
          <div className="container">
            {newArrivals.length > 0 ? (
              <div className={styles.grid}>
                {newArrivals.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={i < 4}
                  />
                ))}
              </div>
            ) : (
              <p className={styles.empty}>
                Пока нет свежих поступлений.{" "}
                <Link href="/catalog" className={styles.emptyLink}>
                  Смотреть весь каталог →
                </Link>
              </p>
            )}

            <div className={styles.actions}>
              <Link href="/catalog" className={styles.catalogBtn}>
                Смотреть весь каталог
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
