"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import AdminModal from "@/components/admin/admin-modal";
import AdminButton from "@/components/admin/admin-button";
import AdminPageHeader from "@/components/admin/admin-page-header";
import { useToast } from "@/lib/toast-context";
import { MARKETPLACE_URLS } from "@/lib/marketplaces";
import styles from "./products.module.css";

interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  sku?: string;
  wbArticle?: number;
  ozonArticle?: number;
  image?: string;
  ozonImage?: string;
  rating?: number;
  archivedAt?: string | null;
  colorName?: string;
  model?: { id: string; name: string } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type StatusTab = "active" | "archived" | "all";
type ConfirmAction = "archive" | "unarchive" | "delete" | "assign-model" | null;

interface ModelBrief {
  id: string;
  name: string;
  category: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 20, total: 0, totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [marketplace, setMarketplace] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("active");

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  // Assign model modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignModelId, setAssignModelId] = useState("");
  const [models, setModels] = useState<ModelBrief[]>([]);

  // Reorder mode
  const [reorderMode, setReorderMode] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderSaved, setOrderSaved] = useState(false);
  const dragNode = useRef<HTMLElement | null>(null);

  // Lightbox
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const archivedParam = statusTab === "all" ? undefined : statusTab === "archived" ? "true" : "false";
  const marketplaceParam = marketplace || undefined;

  const fetchProducts = useCallback(
    async (page = 1) => {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (archivedParam) params.set("archived", archivedParam);
      if (marketplaceParam) params.set("marketplace", marketplaceParam);

      const res = await fetch(`/api/admin/products?${params}`);
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      setProducts(data.items);
      setPagination(data.pagination);
      setSelectedIds(new Set());
      setLoading(false);
    },
    [search, category, archivedParam, marketplaceParam, router],
  );

  useEffect(() => { fetchProducts(1); }, [fetchProducts]);

  // ─── Lightbox keyboard ───
  useEffect(() => {
    if (!lightboxImage) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxImage(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [lightboxImage]);

  // ─── Bulk actions ───

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  }

  async function executeBulk(action: "archive" | "unarchive" | "delete" | "assign-model", extra?: Record<string, unknown>) {
    setBulkProcessing(true);
    setConfirmAction(null);
    setShowAssignModal(false);
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: Array.from(selectedIds), ...extra }),
      });
      if (res.ok) {
        setSelectedIds(new Set());
        fetchProducts(pagination.page);
        const labels = { archive: "Архивировано", unarchive: "Разархивировано", delete: "Удалено", "assign-model": "Модель назначена" };
        toast.success(`${labels[action]} ${selectedIds.size} товаров`);
      } else {
        toast.error("Ошибка при выполнении операции");
      }
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setBulkProcessing(false);
    }
  }

  // ─── Assign model ───

  let modelsFetched = false;
  async function fetchModelsOnce() {
    if (modelsFetched && models.length > 0) return;
    modelsFetched = true;
    try {
      const res = await fetch("/api/admin/models");
      if (res.ok) {
        const data = await res.json();
        setModels((data.items || []).map((m: { id: string; name: string; category: string }) => ({
          id: m.id, name: m.name, category: m.category,
        })));
      }
    } catch { /* ignore */ }
  }

  // ─── Single delete ───

  async function handleDelete(id: string) {
    if (!confirm("Удалить товар?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchProducts(pagination.page);
      toast.success("Товар удалён");
    } else {
      toast.error("Ошибка при удалении");
    }
  }

  // ─── Reorder mode ───

  async function enterReorderMode() {
    setLoading(true);
    setReorderMode(true);

    const [productsRes, settingsRes] = await Promise.all([
      fetch("/api/admin/products?page=1&limit=200&archived=false"),
      fetch("/api/admin/settings"),
    ]);

    if (productsRes.status === 401 || settingsRes.status === 401) {
      router.push("/admin/login");
      return;
    }

    const productsData = await productsRes.json();
    const settingsData = await settingsRes.json();
    const catalogOrder: string[] = settingsData.catalogOrder || [];

    const orderMap = new Map(catalogOrder.map((id: string, i: number) => [id, i]));
    const sorted = [...productsData.items].sort((a: Product, b: Product) => {
      const ai = orderMap.get(a.id);
      const bi = orderMap.get(b.id);
      if (ai !== undefined && bi !== undefined) return ai - bi;
      if (ai !== undefined) return -1;
      if (bi !== undefined) return 1;
      return 0;
    });

    setAllProducts(sorted);
    setLoading(false);
  }

  function exitReorderMode() {
    setReorderMode(false);
    fetchProducts(1);
  }

  function handleDragStart(e: React.DragEvent, index: number) {
    dragNode.current = e.currentTarget as HTMLElement;
    dragNode.current.classList.add(styles.dragging);
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const items = [...allProducts];
    const [moved] = items.splice(dragIndex, 1);
    items.splice(index, 0, moved);
    setAllProducts(items);
    setDragIndex(index);
  }

  function handleDragEnd() {
    if (dragNode.current) dragNode.current.classList.remove(styles.dragging);
    setDragIndex(null);
  }

  async function saveOrder() {
    setSavingOrder(true);
    setOrderSaved(false);
    const order = allProducts.map((p) => p.id);

    try {
      const settingsRes = await fetch("/api/admin/settings");
      const settingsData = await settingsRes.json();

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settingsData, catalogOrder: order }),
      });

      if (res.ok) {
        setOrderSaved(true);
        setTimeout(() => setOrderSaved(false), 3000);
      }
    } catch {
      // ignore
    } finally {
      setSavingOrder(false);
    }
  }

  // ─── Helpers ───

  function formatPrice(n?: number) {
    return n != null ? n.toLocaleString("ru-RU") + " ₽" : "—";
  }

  const catName = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.name || slug;

  // ─── Render ───

  if (reorderMode) {
    return (
      <div className={styles.page}>
        <AdminPageHeader
          title="Порядок товаров"
          subtitle={`${allProducts.length} активных товаров`}
        >
          {orderSaved && <span className={styles.savedBadge}>Сохранено</span>}
          <AdminButton variant="primary" onClick={saveOrder} disabled={savingOrder} loading={savingOrder}>
            Сохранить порядок
          </AdminButton>
          <AdminButton variant="ghost" onClick={exitReorderMode}>
            Закрыть
          </AdminButton>
        </AdminPageHeader>
        <p className={styles.reorderHint}>
          Перетащите товары в нужном порядке и нажмите «Сохранить порядок»
        </p>
        <div className={styles.reorderList}>
          {allProducts.map((p, idx) => (
            <div
              key={p.id}
              className={`${styles.reorderItem} ${dragIndex === idx ? styles.reorderItemActive : ""}`}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
            >
              <span className={styles.reorderHandle} aria-label="Перетащить">⋮⋮</span>
              <span className={styles.reorderNum}>{idx + 1}</span>
              {p.image && <img src={p.image} alt="" className={styles.reorderThumb} />}
              <span className={styles.reorderName}>{p.name}</span>
              <span className={styles.reorderPrice}>{formatPrice(p.price)}</span>
              <span className={styles.reorderBadge}>{catName(p.category)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ─── Header ─── */}
      <AdminPageHeader
        title="Товары"
        subtitle={`${pagination.total} товаров${selectedIds.size > 0 ? ` · выбрано ${selectedIds.size}` : ""}`}
      >
        <AdminButton variant="secondary" onClick={enterReorderMode}>
          ≡ Управление порядком
        </AdminButton>
        <AdminButton variant="primary" href="/admin/products/new">
          + Добавить товар
        </AdminButton>
      </AdminPageHeader>

      {/* ─── Status tabs ─── */}
      <div className={styles.filters}>
        <div className={styles.statusTabs}>
          {(["active", "all", "archived"] as const).map((tab) => (
            <button
              key={tab}
              className={`${styles.statusTab} ${statusTab === tab ? styles.statusTabActive : ""}`}
              onClick={() => { setStatusTab(tab); setSelectedIds(new Set()); }}
            >
              {tab === "active" ? "Активные" : tab === "archived" ? "Архивные" : "Все"}
            </button>
          ))}
        </div>
        <div className={styles.mpPills}>
          {[
            { value: "", label: "Любой МП" },
            { value: "wb", label: "WB" },
            { value: "ozon", label: "Ozon" },
            { value: "both", label: "Оба" },
          ].map((mp) => (
            <button
              key={mp.value}
              className={`${styles.mpPill} ${marketplace === mp.value ? styles.mpPillActive : ""}`}
              onClick={() => setMarketplace(mp.value)}
            >
              {mp.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Поиск по названию или ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.categorySelect}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Все категории</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* ─── Bulk toolbar ─── */}
      {selectedIds.size > 0 && (
        <div className={styles.bulkToolbar}>
          <span className={styles.bulkCount}>
            Выбрано: {selectedIds.size}
          </span>
          <span className={styles.bulkSeparator} />
          <div className={styles.bulkActions}>
            {statusTab !== "archived" && (
              <AdminButton variant="secondary" size="sm" onClick={() => setConfirmAction("archive")} disabled={bulkProcessing}>
                Архивировать
              </AdminButton>
            )}
            {statusTab === "archived" && (
              <AdminButton variant="secondary" size="sm" onClick={() => setConfirmAction("unarchive")} disabled={bulkProcessing}>
                Разархивировать
              </AdminButton>
            )}
            <AdminButton variant="secondary" size="sm" onClick={() => { fetchModelsOnce(); setShowAssignModal(true); }} disabled={bulkProcessing}>
              Назначить модель
            </AdminButton>
            <AdminButton variant="danger" size="sm" onClick={() => setConfirmAction("delete")} disabled={bulkProcessing}>
              Удалить
            </AdminButton>
            {bulkProcessing && <span className={styles.bulkProgress}>Обработка...</span>}
          </div>
        </div>
      )}

      {/* ─── Table ─── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkboxCol}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={products.length > 0 && selectedIds.size === products.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th></th>
              <th>Название</th>
              <th>Модель</th>
              <th>Цена</th>
              <th>Категория</th>
              <th>SKU</th>
              <th>Артикулы</th>
              <th>Рейтинг</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className={styles.skeletonRow}>
                  <td><div className={`${styles.skeleton}`} style={{ width: 16, height: 16 }} /></td>
                  <td><div className={`${styles.skeleton} ${styles.skeletonPhoto}`} /></td>
                  <td><div className={`${styles.skeleton}`} style={{ height: 14, width: '55%', borderRadius: 3 }} /></td>
                  <td><div className={`${styles.skeleton}`} style={{ height: 14, width: '40%', borderRadius: 3 }} /></td>
                  <td><div className={`${styles.skeleton}`} style={{ height: 14, width: 50, borderRadius: 3 }} /></td>
                  <td><div className={`${styles.skeleton} ${styles.skeletonBadge}`} /></td>
                  <td><div className={`${styles.skeleton}`} style={{ height: 14, width: 60, borderRadius: 3 }} /></td>
                  <td><div className={`${styles.skeleton}`} style={{ height: 14, width: '45%', borderRadius: 3 }} /></td>
                  <td><div className={`${styles.skeleton}`} style={{ height: 14, width: 35, borderRadius: 3 }} /></td>
                  <td><div style={{ width: 24, height: 24 }} /></td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr><td colSpan={10} className={styles.empty}>
                {statusTab === "archived" ? "Нет архивных товаров" : "Нет товаров"}
              </td></tr>
            ) : (
              products.map((p) => {
                const isSelected = selectedIds.has(p.id);
                const isArchived = !!p.archivedAt;

                return (
                  <tr key={p.id} className={isArchived ? styles.archivedRow : ""}>
                    <td className={styles.checkboxCol}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={isSelected}
                        onChange={() => toggleSelect(p.id)}
                      />
                    </td>
                    <td>
                      <div className={styles.photoPair}>
                        <AdminProductPhoto
                          src={p.image}
                          label="WB"
                          hasArticle={!!p.wbArticle}
                          onLightbox={() => setLightboxImage(p.image ?? null)}
                        />
                        <AdminProductPhoto
                          src={p.ozonImage}
                          label="Ozon"
                          hasArticle={!!p.ozonArticle}
                          onLightbox={() => setLightboxImage(p.ozonImage ?? null)}
                        />
                        {!p.image && !p.ozonImage && (
                          <div className={styles.photoPlaceholder}>—</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <Link href={`/admin/products/${p.slug}`} className={styles.productName}>
                        {p.name}
                      </Link>
                      {isArchived && <span className={styles.archivedBadge}>Архив</span>}
                    </td>
                    <td>
                      {p.model ? (
                        <Link href={`/admin/models/${p.model.id}`} className={styles.modelLink}>
                          {p.model.name}
                        </Link>
                      ) : (
                        <span className={styles.noModel}>—</span>
                      )}
                    </td>
                    <td className={styles.price}>{formatPrice(p.price)}</td>
                    <td><span className={styles.categoryBadge}>{catName(p.category)}</span></td>
                    <td className={styles.sku}>{p.sku || <span className={styles.muted}>—</span>}</td>
                    <td className={styles.article}>
                      {p.wbArticle && (
                        <a
                          href={MARKETPLACE_URLS.wbProduct(p.wbArticle)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.articleLink}
                        >
                          WB: {p.wbArticle} ↗
                        </a>
                      )}
                      {p.wbArticle && p.ozonArticle && <br />}
                      {p.ozonArticle && (
                        <a
                          href={MARKETPLACE_URLS.ozonProduct(p.ozonArticle)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.articleLink}
                        >
                          OZ: {p.ozonArticle} ↗
                        </a>
                      )}
                      {!p.wbArticle && !p.ozonArticle && <span className={styles.muted}>—</span>}
                    </td>
                    <td>{p.rating ? `${p.rating.toFixed(1)} ★` : "—"}</td>
                    <td>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(p.id)}
                        title="Удалить"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Pagination ─── */}
      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`${styles.pageBtn} ${p === pagination.page ? styles.pageActive : ""}`}
              onClick={() => fetchProducts(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* ─── Confirmation modal ─── */}
      <AdminModal
        open={confirmAction !== null}
        onClose={() => !bulkProcessing && setConfirmAction(null)}
        title={
          confirmAction === "archive" ? "Архивировать товары" :
          confirmAction === "unarchive" ? "Разархивировать товары" :
          "Удалить товары"
        }
        actions={[
          { label: "Отмена", onClick: () => setConfirmAction(null), disabled: bulkProcessing },
          {
            label:
              confirmAction === "archive" ? "Архивировать" :
              confirmAction === "unarchive" ? "Разархивировать" :
              "Удалить",
            onClick: () => executeBulk(confirmAction!),
            variant: confirmAction === "delete" ? "danger" : "primary",
            disabled: bulkProcessing,
          },
        ]}
      >
        <p>
          {confirmAction === "archive"
            ? `Вы уверены, что хотите архивировать ${selectedIds.size} товаров? Они исчезнут из каталога, но данные сохранятся.`
            : confirmAction === "unarchive"
              ? `Разархивировать ${selectedIds.size} товаров? Они снова появятся в каталоге.`
              : `Вы уверены, что хотите удалить ${selectedIds.size} товаров? Это действие необратимо.`}
        </p>
      </AdminModal>

      {/* ─── Assign model modal ─── */}
      <AdminModal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Назначить модель"
        actions={[
          { label: "Отмена", onClick: () => setShowAssignModal(false) },
          {
            label: "Назначить",
            onClick: () => executeBulk("assign-model", { modelId: assignModelId }),
            variant: "primary",
            disabled: !assignModelId || bulkProcessing,
          },
        ]}
      >
        <p style={{ marginBottom: 12 }}>
          Выберите модель для {selectedIds.size} товаров:
        </p>
        <select
          className={styles.assignSelect}
          value={assignModelId}
          onChange={(e) => setAssignModelId(e.target.value)}
        >
          <option value="">— выберите модель —</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.category})
            </option>
          ))}
        </select>
      </AdminModal>

      {/* ─── Lightbox ─── */}
      {lightboxImage && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setLightboxImage(null)}
        >
          <img src={lightboxImage} alt="" className={styles.lightboxImage} />
          <button
            className={styles.lightboxClose}
            onClick={() => setLightboxImage(null)}
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Фото товара с обработкой ошибок загрузки ─── */

function AdminProductPhoto({
  src,
  label,
  hasArticle,
  onLightbox,
}: {
  src?: string | null;
  label: string;
  hasArticle: boolean;
  onLightbox: () => void;
}) {
  const [failed, setFailed] = useState(false);

  // Показываем только если есть article и src
  if (!hasArticle || !src) return null;
  if (failed) return null; // не показываем битое фото

  return (
    <div className={styles.photoItem}>
      <img
        src={src}
        alt=""
        className={styles.photoImg}
        onClick={onLightbox}
        onError={() => setFailed(true)}
        title="Увеличить"
      />
      <span className={styles.photoLabel}>{label}</span>
    </div>
  );
}
