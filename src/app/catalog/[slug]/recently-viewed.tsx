"use client";

import { useState, useEffect } from "react";
import { getRecentlyViewed } from "@/lib/recently-viewed";
import { useProducts } from "@/lib/use-products";
import ProductCard from "@/components/ui/product-card";
import styles from "./page.module.css";

export default function RecentlyViewed() {
  const { products } = useProducts();
  const [recentArticles, setRecentArticles] = useState<number[]>([]);

  useEffect(() => {
    setRecentArticles(getRecentlyViewed());
  }, []);

  const recentProducts = recentArticles
    .map((article) => products.find((p) => p.wbArticle === article))
    .filter((p): p is NonNullable<typeof p> => p != null);

  if (recentProducts.length === 0) return null;

  return (
    <section className={styles.recentlySection}>
      <h2 className={styles.recentlyTitle}>Вы недавно смотрели</h2>
      <div className={styles.recentlyRow}>
        {recentProducts.map((product) => (
          <div key={product.id} className={styles.recentlyCard}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
