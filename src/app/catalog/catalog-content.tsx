"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ui/product-card";
import { useProducts } from "@/lib/use-products";
import styles from "./page.module.css";

const ITEMS_PER_PAGE = 24;

function sortByOrder(products: import("@/data/products").Product[], order: string[]): import("@/data/products").Product[] {
  if (!order || order.length === 0) return products;
  const orderMap = new Map(order.map((id, i) => [id, i]));
  const inOrder: import("@/data/products").Product[] = [];
  const rest: import("@/data/products").Product[] = [];
  for (const p of products) {
    if (orderMap.has(p.id)) {
      inOrder.push(p);
    } else {
      rest.push(p);
    }
  }
  inOrder.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
  return [...inOrder, ...rest];
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const { products, categories } = useProducts();
  const [catalogOrder, setCatalogOrder] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/data/settings")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.catalogOrder)) setCatalogOrder(data.catalogOrder);
      })
      .catch(() => {});
  }, []);
  const initialCat = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCat ?? null,
  );
  const [page, setPage] = useState(1);

  // Reset page when category changes from URL
  useEffect(() => {
    setSelectedCategory(initialCat ?? null);
    setPage(1);
  }, [initialCat]);

  // Filter products
  const filtered = sortByOrder(
    selectedCategory ? products.filter((p) => p.category === selectedCategory) : products,
    catalogOrder,
  );

  // Paginate
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const safePage = Math.min(page, Math.max(totalPages, 1));
  const paginated = filtered.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  const handleFilter = (cat: string | null) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  return (
    <section className={styles.catalog}>
      <div className={styles.header}>
        <span className={styles.label}>Каталог</span>
        <h1 className={styles.title}>Наши сумки</h1>
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
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className={styles.loading}>Загрузка...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
