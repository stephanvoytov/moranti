"use client";

import { useState } from "react";
import Hero from "@/components/sections/hero";
import ProductCard from "@/components/ui/product-card";
import { useProducts } from "@/lib/use-products";
import styles from "./page.module.css";

const ITEMS_PER_PAGE = 24;

export default function Home() {
  const { products, categories } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Filter products
  const filtered = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  // Paginate
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const safePage = Math.min(page, Math.max(totalPages, 1));
  const paginated = filtered.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const handleFilter = (cat: string | null) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  return (
    <>
      {/* ——— Hero ——— */}
      <Hero />

      {/* ——— Catalog ——— */}
      <section className={styles.catalog} id="catalog">
        <div className={styles.catalogHeader}>
          <span className={styles.catalogLabel}>Каталог</span>
          <h2 className={styles.catalogTitle}>Наши сумки</h2>
        </div>

        {/* Filter pills */}
        <div className={styles.filterRow}>
          <button
            className={`${styles.filterPill} ${selectedCategory === null ? styles.pillActive : ""}`}
            onClick={() => handleFilter(null)}
          >
            Все
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              className={`${styles.filterPill} ${selectedCategory === cat.slug ? styles.pillActive : ""}`}
              onClick={() => handleFilter(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className={styles.productGrid}>
          {paginated.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={`${styles.pageBtn} ${safePage <= 1 ? styles.pageBtnDisabled : ""}`}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
              ←
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (p === 1 || p === totalPages) return true;
                if (Math.abs(p - safePage) <= 1) return true;
                return false;
              })
              .map((p, idx, arr) => (
                <span key={p} className={styles.pageGroup}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className={styles.pageEllipsis}>…</span>
                  )}
                  <button
                    className={`${styles.pageBtn} ${p === safePage ? styles.pageBtnActive : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                </span>
              ))}

            <button
              className={`${styles.pageBtn} ${safePage >= totalPages ? styles.pageBtnDisabled : ""}`}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              →
            </button>
          </div>
        )}
      </section>

      {/* ——— Values ——— */}
      <section className={styles.values}>
        <div className="container">
          <div className={styles.valuesGrid}>
            <div className={styles.valueItem}>
              <h3 className={styles.valueTitle}>Натуральная кожа</h3>
              <p className={styles.valueDesc}>
                Отбираем материал вручную. Работаем только с проверенными
                кожевенными производствами.
              </p>
            </div>
            <div className={styles.valueItem}>
              <h3 className={styles.valueTitle}>Ручная работа</h3>
              <p className={styles.valueDesc}>
                Каждая сумка собирается вручную. Проверяем швы, фурнитуру и
                посадку перед отправкой.
              </p>
            </div>
            <div className={styles.valueItem}>
              <h3 className={styles.valueTitle}>Вне времени</h3>
              <p className={styles.valueDesc}>
                Классические формы и спокойные цвета — чтобы сумка не надоела
                через месяц.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Footer ——— */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <h3 className={styles.footerLogo}>Moranti</h3>
              <p className={styles.footerTagline}>
                Сумки, которые говорят без слов
              </p>
            </div>
            <div className={styles.footerLinks}>
              <a
                href="https://www.instagram.com/_utrends/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                Instagram
              </a>
              <a
                href="https://www.wildberries.ru/brands/moranti"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                Wildberries
              </a>
              <a
                href="https://www.ozon.ru/seller/moranti/?miniapp=seller_4205030"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                Ozon
              </a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span className={styles.footerCopy}>
              &copy; {new Date().getFullYear()} Moranti. Все права защищены.
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
