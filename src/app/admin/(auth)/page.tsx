import { getCategories } from "@/data/products";
import { getWbSyncStatus } from "@/lib/wb-sync";
import { getOzonSyncStatus } from "@/lib/ozon-sync";
import Link from "next/link";
import prisma, { prismaQuery } from "@/lib/prisma";
import { cacheGet } from "@/lib/data-cache";
import { pluralRu } from "@/lib/plural";
import type { SyncRunRecord } from "@/lib/sync-history";
import UpdatedBadge from "@/components/admin/updated-badge";
import MarketplaceStats from "@/components/admin/marketplace-stats";
import styles from "./dashboard.module.css";

interface Issue {
  productId: string;
  slug: string;
  productName: string;
  updatedAt?: string;
  tags: { text: string; warn?: boolean }[];
}

function formatDate(ts: string) {
  try { return new Date(ts).toLocaleString("ru-RU"); } catch { return ts; }
}

const STALE_SYNC_DAYS = 3;

/** Человекочитаемая давность последнего синка + флаг «устарел». */
function syncAgo(ts: string): { label: string; stale: boolean } {
  const days = (Date.now() - new Date(ts).getTime()) / 86_400_000;
  if (days < 1) return { label: "сегодня", stale: false };
  if (days < 2) return { label: "вчера", stale: false };
  const n = Math.floor(days);
  return { label: `${n} ${pluralRu(n, "день", "дня", "дней")} назад`, stale: n > STALE_SYNC_DAYS };
}

function SyncSection({ label, sync, href }: { label: string; sync: SyncRunRecord | null; href: string }) {
  return (
    <section className={styles.syncSection}>
      {sync ? (
        <div className={styles.syncStatus}>
          <span className={styles.syncLabel}>{label}</span>
          <span className={styles.syncTime}>{formatDate(sync.timestamp)}</span>
          <span className={styles.syncMeta}>+{sync.stats.added} / ~{sync.stats.updated} / -{sync.stats.archived}</span>
          <span className={syncAgo(sync.timestamp).stale ? styles.syncStale : styles.syncAgo}>
            {syncAgo(sync.timestamp).label}
          </span>
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
  // 5 запросов к БД объединены в один кэш-ключ: навигация по админке
  // не дёргает БД при каждом визите. 15с свежести + 60с stale-окно —
  // после мутаций данные обновляются максимум через минуту, а
  // invalidateCache() из sync/models/products-роутов сбрасывает и раньше.
  const [allProducts, categories, models, wbSync, ozonSync] = await cacheGet(
    "dashboard-stats",
    async () =>
      Promise.all([
        prismaQuery(() => prisma.product.findMany({ orderBy: { createdAt: "asc" } })),
        getCategories(),
        prismaQuery(() => prisma.model.findMany({
          include: { variants: { where: { archivedAt: null }, select: { id: true, wbArticle: true, ozonArticle: true } } },
          orderBy: { createdAt: "desc" },
        })),
        getWbSyncStatus(),
        getOzonSyncStatus(),
      ]),
    15_000,
    60_000,
  );

  const totalProducts = allProducts.length;
  const totalModels = models.length;
  const totalCategories = categories.length;

  const inStock = allProducts.filter((p) => p.inStock && !p.archivedAt);
  const archived = allProducts.filter((p) => p.archivedAt);
  const totalSum = inStock.reduce((s, p) => s + p.price, 0);
  const avgPrice = inStock.length ? Math.round(totalSum / inStock.length) : 0;

  const onWb = allProducts.filter((p) => p.wbArticle);
  const wbInStock = onWb.filter((p) => (p.wbStock ?? 0) > 0);
  const wbNoStock = onWb.filter((p) => (p.wbStock ?? 0) <= 0);

  const onOzon = allProducts.filter((p) => p.ozonArticle);
  const ozonInStock = onOzon.filter((p) => (p.ozonStock ?? 0) > 0);
  const ozonNoStock = onOzon.filter((p) => (p.ozonStock ?? 0) <= 0);

  const withImages = inStock.filter((p) => p.images?.length).length;
  const withColorName = inStock.filter((p) => p.colorName).length;
  const linkedToModel = inStock.filter((p) => p.modelId).length;

  const issues: Issue[] = [];
  for (const p of allProducts) {
    if (p.archivedAt) continue;
    const tags: Issue["tags"] = [];
    if (!p.colorName) tags.push({ text: "Нет цвета" });
    if (!p.images?.length) tags.push({ text: "Нет фото", warn: true });
    if (!p.wbArticle && !p.ozonArticle) tags.push({ text: "Нет в продаже", warn: true });
    if (tags.length) issues.push({ productId: p.id, slug: p.slug, productName: p.name, updatedAt: p.updatedAt?.toISOString(), tags });
  }
  issues.sort((a, b) => b.tags.length - a.tags.length);

  const recentModels = models.slice(0, 5);
  const catNames = new Map(categories.map((c) => [c.slug, c.name]));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Дашборд</h1>
        <p className={styles.subtitle}>
          {totalProducts} {pluralRu(totalProducts, "товар", "товара", "товаров")} ·{" "}
          {inStock.length} в наличии · {archived.length} в архиве · средняя{" "}
          {avgPrice.toLocaleString("ru-RU")} ₽
        </p>
      </header>

      {/* ——— Marketplace comparison ——— */}
      <section className={styles.marketplaceSection}>
        <div className={styles.mpRow}>
          <MarketplaceStats
            platform="wb"
            inStock={wbInStock.length}
            noStock={wbNoStock.length}
            total={onWb.length}
          />
          <MarketplaceStats
            platform="ozon"
            inStock={ozonInStock.length}
            noStock={ozonNoStock.length}
            total={onOzon.length}
          />
        </div>
      </section>

      {/* ——— Sync status ——— */}
      <div className={styles.syncRow}>
        <SyncSection label="Wildberries" sync={wbSync} href="/admin/sync" />
        <SyncSection label="Ozon" sync={ozonSync} href="/admin/sync" />
      </div>

      {/* ——— Summary bar ——— */}
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
          {inStock.length - linkedToModel} без модели
        </span>
        <span className={styles.summaryItem}>
          <span className={`${styles.summaryDot} ${styles.summaryDotWarn}`} />
          {inStock.length - withColorName} без цвета
        </span>
        <span className={styles.summaryItem}>
          <span className={`${styles.summaryDot} ${styles.summaryDotBad}`} />
          {inStock.length - withImages} без фото
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
                  <UpdatedBadge iso={issue.updatedAt} />
                  <span className={styles.issueTags}>
                    {issue.tags.map((t) => (
                      <span key={t.text} className={`${styles.issueTag} ${t.warn ? styles.issueTagWarn : ""}`}>{t.text}</span>
                    ))}
                  </span>
                </div>
                <Link href={`/admin/products/${issue.slug}`} className={styles.issueLink}>Редактировать →</Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ——— Recent models ——— */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Последние модели</h2>
          <Link href="/admin/products?view=kanban" className={styles.issueLink}>Все модели →</Link>
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
                  <Link href={`/admin/products/models/${m.id}`} className={styles.issueLink}>Открыть →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
