"use client";

import { useFavorites } from "@/lib/favorites-context";
import { useProducts } from "@/lib/use-products";
import ProductCard from "@/components/ui/product-card";
import styles from "./page.module.css";

export default function FavoritesPage() {
  const { products } = useProducts();
  const { favorites, count, clearFavorites } = useFavorites();

  const favProducts = products.filter((p) => favorites.includes(p.wbArticle));

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <header className={styles.header}>
          <span className={styles.label}>Избранное</span>
          <h1 className={styles.title}>
            {count > 0
              ? `${count} ${count === 1 ? "товар" : count < 5 ? "товара" : "товаров"}`
              : "Список пуст"}
          </h1>
          {count > 0 && (
            <p className={styles.subtitle}>
              <button className={styles.clearBtn} onClick={clearFavorites}>
                Очистить список
              </button>
            </p>
          )}
        </header>

        {favProducts.length > 0 ? (
          <div className={styles.grid}>
            {favProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p>Добавьте товары в избранное, чтобы не потерять их.</p>
            <a href="/#catalog" className={styles.catalogLink}>
              Перейти в каталог
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
