/* =============================================
   Admin Dashboard
   ============================================= */

import { getProducts, getCategories } from "@/data/products";
import styles from "./dashboard.module.css";

export default function AdminDashboard() {
  const products = getProducts();
  const categories = getCategories();

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const avgPrice = Math.round(
    products.reduce((s, p) => s + p.price, 0) / totalProducts,
  );
  const withRatings = products.filter((p) => p.rating).length;
  const minPrice = Math.min(...products.map((p) => p.price));
  const maxPrice = Math.max(...products.map((p) => p.price));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Дашборд</h1>
        <p className={styles.subtitle}>Обзор магазина Moranti</p>
      </header>

      <div className={styles.grid}>
        <div className={styles.card}>
          <span className={styles.cardValue}>{totalProducts}</span>
          <span className={styles.cardLabel}>Товаров</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>{totalCategories}</span>
          <span className={styles.cardLabel}>Категорий</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>
            {avgPrice.toLocaleString("ru-RU")} ₽
          </span>
          <span className={styles.cardLabel}>Средняя цена</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>
            {minPrice.toLocaleString("ru-RU")} – {maxPrice.toLocaleString("ru-RU")} ₽
          </span>
          <span className={styles.cardLabel}>Диапазон цен</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>{withRatings}</span>
          <span className={styles.cardLabel}>С рейтингом</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>
            {products.filter((p) => p.reviewsCount).reduce((s, p) => s + (p.reviewsCount || 0), 0)}
          </span>
          <span className={styles.cardLabel}>Всего оценок</span>
        </div>
      </div>

      {/* Categories breakdown */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>По категориям</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Категория</th>
              <th>Кол-во</th>
              <th>Средняя цена</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const catProducts = products.filter((p) => p.category === cat.slug);
              const catAvg = catProducts.length
                ? Math.round(catProducts.reduce((s, p) => s + p.price, 0) / catProducts.length)
                : 0;
              return (
                <tr key={cat.slug}>
                  <td>{cat.name}</td>
                  <td>{catProducts.length}</td>
                  <td>{catAvg.toLocaleString("ru-RU")} ₽</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
