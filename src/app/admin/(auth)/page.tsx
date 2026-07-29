import { getCategories } from "@/data/products";
import { getWbSyncStatus } from "@/lib/wb-sync";
import { getOzonSyncStatus } from "@/lib/ozon-sync";
import Link from "next/link";
import prisma, { prismaQuery } from "@/lib/prisma";
import type { SyncRunRecord } from "@/lib/sync-history";
import styles from "./dashboard.module.css";

interface Issue {
  productId: string;
  productName: string;
  tags: { text: string; warn?: boolean }[];
}

function formatDate(ts: string) {
  try { return new Date(ts).toLocaleString("ru-RU"); } catch { return ts; }
}

function SyncSection({ label, sync, href }: { label: string; sync: SyncRunRecord | null; href: string }) {
  return (
    <section className={styles.syncSection}>
      {sync ? (
        <div className={styles.syncStatus}>
          <span className={styles.syncLabel}>{label}</span>
          <span className={styles.syncTime}>{formatDate(sync.timestamp)}</span>
          <span className={styles.syncMeta}>+{sync.stats.added} / ~{sync.stats.updated} / -{sync.stats.archived}</span>
        </div>
      ) : (
        <div className={styles.syncStatus}>
          <span className={styles.syncLabel}>{label}</span>
          <span className={styles.syncNever}>Ещё не запускалась</span>
        </div>
      )}
      <Link href={href} className={styles.syncLink}>Запустить →</Link>
    </section>
  );
}

export default async function AdminDashboard() {
  const [allProducts, categories, models, wbSync, ozonSync] = await Promise.all([
    prismaQuery(() => prisma.product.findMany({ orderBy: { createdAt: "asc" } })),
    getCategories(),
    prismaQuery(() => prisma.model.findMany({
      include: { variants: { where: { archivedAt: null }, select: { id: true, wbArticle: true, ozonArticle: true } } },
      orderBy: { createdAt: "desc" },
    })),
    getWbSyncStatus(),
    getOzonSyncStatus(),
  ]);

  const totalProducts = allProducts.length;
  const totalModels = models.length;
  const totalCategories = categories.length;

  const inStock = allProducts.filter((p) => p.inStock && !p.archivedAt);
  const outOfStock = allProducts.filter((p) => !p.inStock && !p.archivedAt);
  const archived = allProducts.filter((p) => p.archivedAt);
  const totalSum = inStock.reduce((s, p) => s + p.price, 0);
  const avgPrice = inStock.length ? Math.round(totalSum / inStock.length) : 0;

  const onWb = allProducts.filter((p) => p.wbArticle);
  const wbInStock = onWb.filter((p) => (p.wbStock ?? 0) > 0);
  const wbOutOfStock = onWb.filter((p) => !(p.wbStock ?? 0) > 0);

  const onOzon = allProducts.filter((p) => p.ozonArticle);
  const ozonInStock = onOzon.filter((p) => (p.ozonStock ?? 0) > 0);
  const ozonOutOfStock = onOzon.filter((p) => !(p.ozonStock ?? 0) > 0);

  const withImages = allProducts.filter((p) => p.images?.length).length;
  const withColorName = allProducts.filter((p) => p.colorName).length;
  const linkedToModel = allProducts.filter((p) => p.modelId).length;

  const issues: Issue[] = [];
  for (const p of allProducts) {
    if (p.archivedAt) continue;
    const tags: Issue["tags"] = [];
    if (!p.colorName) tags.push({ text: "Нет цвета" });
    if (!p.composition) tags.push({ text: "Нет материала" });
    if (!p.images?.length) tags.push({ text: "Нет фото", warn: true });
    if (!p.wbArticle && !p.ozonArticle) tags.push({ text: "Нет в продаже", warn: true });
    if (p.wbArticle && !(p.wbStock ?? 0) > 0) tags.push({ text: "Нет на WB", warn: true });
    if (p.ozonArticle && !(p.ozonStock ?? 0) > 0) tags.push({ text: "Нет на Ozon", warn: true });
    if (tags.length) issues.push({ productId: p.id, productName: p.name, tags });
  }
  issues.sort((a, b) => b.tags.length - a.tags.length);

  const recentModels = models.slice(0, 5);
  const catNames = new Map(categories.map((c) => [c.slug, c.name]));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Дашборд</h1>
        <p className={styles.subtitle}>
          Всего вариантов {totalProducts} · В наличии {inStock.length} · Архив {archived.length} · Средняя цена {avgPrice.toLocaleString("ru-RU")} ₽
        </p>
      </header>

      {/* ——— Marketplace stock ——— */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <span className={styles.cardValue}>{onWb.length}</span>
          <span className={styles.cardLabel}>На WB</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>{wbInStock.length}</span>
          <span className={styles.cardLabel}>В наличии на WB</span>
        </div>
        <div className={styles.card}>
          <span className={`${styles.cardValue} ${!wbOutOfStock.length ? styles.cardValueMuted : ""}`}>
            {wbOutOfStock.length || "—"}
          </span>
          <span className={styles.cardLabel}>Нет в остатке WB</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>{onOzon.length}</span>
          <span className={styles.cardLabel}>На Ozon</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>{ozonInStock.length}</span>
          <span className={styles.cardLabel}>В наличии на Ozon</span>
        </div>
        <div className={styles.card}>
          <span className={`${styles.cardValue} ${!ozonOutOfStock.length ? styles.cardValueMuted : ""}`}>
            {ozonOutOfStock.length || "—"}
          </span>
          <span className={styles.cardLabel}>Нет в остатке Ozon</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>{inStock.length}</span>
          <span className={styles.cardLabel}>В наличии всего</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>{outOfStock.length}</span>
          <span className={styles.cardLabel}>Нет в наличии</span>
        </div>
      </div>

      {/* ——— Sync status ——— */}
      <div className={styles.syncRow}>
        <SyncSection label="Wildberries" sync={wbSync} href="/admin/sync" />
        <SyncSection label="Ozon" sync={ozonSync} href="/admin/sync" />
      </div>

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
          <span className={`${styles.summaryDot} ${styles.summaryDotInfo}`} />
          {totalModels} моделей
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
            <span className={`${styles.sectionBadge} ${styles.sectionBadgeDanger}`}>{issues.length}</span>
          </div>
          <div className={styles.table}>
            {issues.slice(0, 20).map((issue) => (
              <div key={issue.productId} className={styles.issueRow}>
                <div className={styles.issueInfo}>
                  <span className={styles.issueName}>{issue.productName}</span>
                  <span className={styles.issueTags}>
                    {issue.tags.map((t) => (
                      <span key={t.text} className={`${styles.issueTag} ${t.warn ? styles.issueTagWarn : ""}`}>{t.text}</span>
                    ))}
                  </span>
                </div>
                <Link href={`/admin/products/${issue.productId}`} className={styles.issueLink}>Редактировать →</Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ——— Recent models ——— */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Последние модели</h2>
          <Link href="/admin/models" className={styles.issueLink}>Все модели →</Link>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Модель</th>
              <th>Вариантов</th>
              <th>Категория</th>
              <th>Площадки</th>
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
                  {m.variants.some((v) => v.wbArticle) ? <span className={styles.badge}>WB</span> : ""}
                  {m.variants.some((v) => v.ozonArticle) ? <span className={styles.badgeOzon}>Ozon</span> : ""}
                </td>
                <td>
                  <Link href={`/admin/models/${m.id}`} className={styles.issueLink}>Редактировать →</Link>
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
              <th>Вариантов</th>
              <th>В наличии</th>
              <th>На WB</th>
              <th>На Ozon</th>
              <th>Средняя цена</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const catProducts = allProducts.filter((p) => p.category === cat.slug);
              const catInStock = catProducts.filter((p) => p.inStock && !p.archivedAt);
              const catAvg = catInStock.length
                ? Math.round(catInStock.reduce((s, p) => s + p.price, 0) / catInStock.length)
                : 0;
              return (
                <tr key={cat.slug}>
                  <td>{cat.name}</td>
                  <td>{catProducts.length}</td>
                  <td>{catInStock.length}</td>
                  <td>{catProducts.filter((p) => p.wbArticle).length}</td>
                  <td>{catProducts.filter((p) => p.ozonArticle).length}</td>
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
