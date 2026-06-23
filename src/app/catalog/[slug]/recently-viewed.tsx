"use client";

import { useState, useEffect } from "react";
import { getRecentlyViewed } from "@/lib/recently-viewed";
import { useProducts } from "@/lib/use-products";
import { useDragScroll } from "@/lib/use-drag-scroll";
import ProductCard from "@/components/ui/product-card";
import styles from "./page.module.css";

export default function RecentlyViewed() {
  const { products } = useProducts();
  const [recentArticles, setRecentArticles] = useState<number[]>([]);
  const drag = useDragScroll<HTMLDivElement>();

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
      <div className={styles.recentlyRowWrap}>
        <div
          className={styles.recentlyRow}
          ref={drag.ref}
          onMouseDown={drag.onMouseDown}
          onMouseMove={drag.onMouseMove}
          onMouseUp={drag.onMouseUp}
          onDragStart={drag.onDragStart}
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
