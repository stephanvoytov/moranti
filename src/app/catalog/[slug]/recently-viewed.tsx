"use client";

import { useSyncExternalStore } from "react";
import {
  subscribeRecentlyViewed,
  getRecentlyViewedSnapshot,
} from "@/lib/recently-viewed";
import { useAllProducts } from "@/lib/use-products";
import { useDragScroll } from "@/lib/use-drag-scroll";
import ProductCard from "@/components/ui/product-card";
import styles from "./page.module.css";

export default function RecentlyViewed() {
  const { products } = useAllProducts();
  const recentArticles = useSyncExternalStore(
    subscribeRecentlyViewed,
    getRecentlyViewedSnapshot,
    getRecentlyViewedSnapshot,
  );
  const { ref: dragRef, onMouseDown, onMouseMove, onMouseUp, onDragStart } =
    useDragScroll<HTMLDivElement>();

  const recentProducts = recentArticles
    .map((article) => products.find((p) => p.wbArticle === article))
    .filter((p): p is NonNullable<typeof p> => p != null);

  if (recentProducts.length === 0) return null;

  return (
    <section className={styles.recentlySection}>
      <h2 className={styles.recentlyTitle}>Вы недавно смотрели</h2>
      <div className={styles.recentlyRowWrap}>
        <div
          className={styles.recentlyRow}
          ref={dragRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onDragStart={onDragStart}
          style={{ cursor: "grab" }}
        >
          {recentProducts.map((product, i) => (
            <div key={product.id} className={styles.recentlyCard}>
              <ProductCard product={product} priority={i < 2} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
