/* =============================================
   Admin Dashboard
   ============================================= */

import { getProducts, getCategories } from "@/data/products";
import { getWbSyncStatus } from "@/lib/wb-sync";
import Link from "next/link";
import prisma, { prismaQuery } from "@/lib/prisma";
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

function SyncSection({ sync }: { sync: ReturnType<typeof getWbSyncStatus> }) {

  return (
    <section className={styles.syncSection}>
      {sync ? (
        <>
          <div className={styles.syncStatus}>
            <span className={styles.syncLabel}>Синхронизация с WB</span>
            <span className={styles.syncTime}>{formatDate(sync.timestamp)}</span>
            <span className={styles.syncMeta}>
              +{sync.stats.added} / ~{sync.stats.updated} / -{sync.stats.archived}
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

export default async function AdminDashboard() {
  const [products, categories, models] = await Promise.all([
    getProducts(),
    getCategories(),
    prismaQuery(() => prisma.model.findMany({
      include: { variants: { where: { archivedAt: null }, select: { id: true } } },
    })),
  ]);
  const syncStatus = getWbSyncStatus();

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalModels = models.length;
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
  const linkedToModel = products.filter((p) => p.modelId).length;

  // Variants per model stats
  const modelsWithSingle = models.filter((m) => m.variants.length === 1).length;
  const modelsWithMultiple = models.filter((m) => m.variants.length > 1).length;

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

  // ─── Recent models ───
  const recentModels = [...models]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
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
          <span className={styles.cardValue}>{totalModels}</span>
          <span className={styles.cardLabel}>Моделей</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>{totalProducts}</span>
          <span className={styles.cardLabel}>Вариантов (цветов)</span>
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
          <span className={styles.cardValue}>{totalCategories}</span>
          <span className={styles.cardLabel}>Категорий</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>
            {modelsWithMultiple} / {totalModels}
          </span>
          <span className={styles.cardLabel}>Моделей с 2+ цветами</span>
        </div>
      </div>

      {/* ——— Sync status ——— */}
      <SyncSection sync={syncStatus} />

      {/* ——— Summary ——— */}
      <div className={styles.summaryBar}>
        <span className={styles.summaryItem}>
          <span className={`${styles.summaryDot} ${styles.summaryDotGood}`} />
          {totalCategories} категорий
        </span>
        <span className={styles.summaryItem}>
          <span className={`${styles.summaryDot} ${styles.summaryDotGood}`} />
          {linkedToModel} привязано к моделям
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

      {/* ——— Recent models ——— */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Последние модели</h2>
          <Link href="/admin/models" className={styles.issueLink}>
            Все модели →
          </Link>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Модель</th>
              <th>Вариантов</th>
              <th>Категория</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {recentModels.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.variants.length}</td>
                <td>{catNames.get(m.category) || m.category}</td>
                <td>
                  <Link
                    href={`/admin/models/${m.id}`}
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
              <th>Моделей</th>
              <th>Вариантов</th>
              <th>Средняя цена</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const catProducts = products.filter((p) => p.category === cat.slug);
              const catModels = models.filter((m) => m.category === cat.slug);
              const catAvg = catProducts.length
                ? Math.round(catProducts.reduce((s, p) => s + p.price, 0) / catProducts.length)
                : 0;
              return (
                <tr key={cat.slug}>
                  <td>{cat.name}</td>
                  <td>{catModels.length}</td>
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
