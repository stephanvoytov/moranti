/* =============================================
   Admin Dashboard
   ============================================= */

import { getProducts, getCategories } from "@/data/products";
import { getSyncStatus } from "@/lib/wb-sync";
import Link from "next/link";
import styles from "./dashboard.module.css";

interface Issue {
  productId: string;
  productName: string;
  tags: { text: string; warn?: boolean }[];
}

function formatDate(ts: string) {
  try {
    return new Date(ts).toLocaleString("ru-RU");
  } catch {
    return ts;
  }
}

function SyncSection() {
  const sync = getSyncStatus();

  return (
    <section className={styles.syncSection}>
      {sync ? (
        <>
          <div className={styles.syncStatus}>
            <span className={styles.syncLabel}>Синхронизация с WB</span>
            <span className={styles.syncTime}>{formatDate(sync.timestamp)}</span>
            <span className={styles.syncMeta}>
              +{sync.added} / ~{sync.updated} / -{sync.archived}
            </span>
          </div>
          <Link href="/admin/sync" className={styles.syncLink}>
            Запустить →
          </Link>
        </>
      ) : (
        <>
          <div className={styles.syncStatus}>
            <span className={styles.syncLabel}>Синхронизация с WB</span>
            <span className={styles.syncNever}>Ещё не запускалась</span>
          </div>
          <Link href="/admin/sync" className={styles.syncLink}>
            Запустить →
          </Link>
        </>
      )}
    </section>
  );
}

export default function AdminDashboard() {
  const products = getProducts();
  const categories = getCategories();

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const avgPrice = Math.round(
    products.reduce((s, p) => s + p.price, 0) / totalProducts,
  );
  const totalSum = products.reduce((s, p) => s + p.price, 0);
  const withWb = products.filter((p) => p.wbArticle).length;
  const withImages = products.filter((p) => p.images?.length).length;
  const withColorName = products.filter((p) => p.colorName).length;
  const withComposition = products.filter((p) => p.composition).length;
  const fullyComplete = products.filter(
    (p) => p.colorName && p.composition && p.images?.length && p.wbArticle,
  ).length;

  // ─── Issues (products needing attention) ───
  const issues: Issue[] = [];

  for (const p of products) {
    const tags: Issue["tags"] = [];
    if (!p.colorName) tags.push({ text: "Нет цвета" });
    if (!p.composition) tags.push({ text: "Нет материала" });
    if (!p.images?.length) tags.push({ text: "Нет фото", warn: true });
    if (!p.wbArticle) tags.push({ text: "Нет WB", warn: true });
    if (tags.length) issues.push({ productId: p.id, productName: p.name, tags });
  }

  // Sort: most issues first
  issues.sort((a, b) => b.tags.length - a.tags.length);

  // ─── Recent products (by id desc) ───
  const recent = [...products]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 5);

  // ─── Category completeness ───
  const catNames = new Map(categories.map((c) => [c.slug, c.name]));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Дашборд</h1>
        <p className={styles.subtitle}>Обзор магазина Moranti</p>
      </header>

      {/* ——— Stats ——— */}
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
            {totalSum.toLocaleString("ru-RU")} ₽
          </span>
          <span className={styles.cardLabel}>Сумма каталога</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>
            {withWb} / {totalProducts}
          </span>
          <span className={styles.cardLabel}>На Wildberries</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>{avgPrice.toLocaleString("ru-RU")} ₽</span>
          <span className={styles.cardLabel}>Средняя цена</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>
            {fullyComplete} / {totalProducts}
          </span>
          <span className={styles.cardLabel}>Полностью заполнено</span>
        </div>
      </div>

      {/* ——— Sync status ——— */}
      <SyncSection />

      {/* ——— Summary ——— */}
      <div className={styles.summaryBar}>
        <span className={styles.summaryItem}>
          <span className={`${styles.summaryDot} ${styles.summaryDotGood}`} />
          {withColorName} с цветом
        </span>
        <span className={styles.summaryItem}>
          <span className={`${styles.summaryDot} ${styles.summaryDotGood}`} />
          {withComposition} с материалом
        </span>
        <span className={styles.summaryItem}>
          <span className={`${styles.summaryDot} ${styles.summaryDotGood}`} />
          {withImages} с фото
        </span>
        <span className={styles.summaryItem}>
          <span className={`${styles.summaryDot} ${styles.summaryDotWarn}`} />
          {totalProducts - withColorName} без цвета
        </span>
        <span className={styles.summaryItem}>
          <span className={`${styles.summaryDot} ${styles.summaryDotBad}`} />
          {totalProducts - withImages} без фото
        </span>
      </div>

      {/* ——— Needs attention ——— */}
      {issues.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Требуют внимания</h2>
            <span className={`${styles.sectionBadge} ${styles.sectionBadgeDanger}`}>
              {issues.length}
            </span>
          </div>

          <div className={styles.table}>
            {issues.slice(0, 10).map((issue) => (
              <div key={issue.productId} className={styles.issueRow}>
                <div className={styles.issueInfo}>
                  <span className={styles.issueName}>{issue.productName}</span>
                  <span className={styles.issueTags}>
                    {issue.tags.map((t) => (
                      <span
                        key={t.text}
                        className={`${styles.issueTag} ${t.warn ? styles.issueTagWarn : ""}`}
                      >
                        {t.text}
                      </span>
                    ))}
                  </span>
                </div>
                <Link
                  href={`/admin/products/${issue.productId}`}
                  className={styles.issueLink}
                >
                  Редактировать →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ——— Recent products ——— */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Последние добавленные</h2>
          <Link href="/admin/products" className={styles.issueLink}>
            Все товары →
          </Link>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Название</th>
              <th>Цена</th>
              <th>Категория</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {recent.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.price.toLocaleString("ru-RU")} ₽</td>
                <td>{catNames.get(p.category) || p.category}</td>
                <td>
                  <Link
                    href={`/admin/products/${p.id}`}
                    className={styles.issueLink}
                  >
                    Редактировать →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ——— Categories breakdown ——— */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>По категориям</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Категория</th>
              <th>Кол-во</th>
              <th>%</th>
              <th>Средняя цена</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const catProducts = products.filter((p) => p.category === cat.slug);
              const catAvg = catProducts.length
                ? Math.round(catProducts.reduce((s, p) => s + p.price, 0) / catProducts.length)
                : 0;
              const pct = ((catProducts.length / totalProducts) * 100).toFixed(1);
              return (
                <tr key={cat.slug}>
                  <td>{cat.name}</td>
                  <td>{catProducts.length}</td>
                  <td>{pct}%</td>
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
