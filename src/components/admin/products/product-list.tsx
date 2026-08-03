"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES, getCategoryName } from "@/lib/categories";
import { pickDisplayImage } from "@/lib/product-images";
import { blobUrl } from "@/lib/blob";
import AdminModal from "@/components/admin/admin-modal";
import AdminButton from "@/components/admin/admin-button";
import AdminPageHeader from "@/components/admin/admin-page-header";
import ProductCard, { type ProductCardItem } from "@/components/admin/products/product-card";
import { formatPrice } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import styles from "./product-list.module.css";

interface Product extends ProductCardItem {
  originalPrice?: number;
  category: string;
  rating?: number;
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

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "wbStock", label: "Наличие WB" },
  { value: "ozonStock", label: "Наличие Ozon" },
  { value: "price", label: "Цена" },
  { value: "updatedAt", label: "Обновлён" },
  { value: "name", label: "Название" },
];

export default function AdminProductList() {
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
  const modelsFetchedRef = useRef(false);

  // Sorting — по умолчанию сортируем по наличию на WB
  const [sortBy, setSortBy] = useState("wbStock");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Reorder mode
  const [reorderMode, setReorderMode] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderSaved, setOrderSaved] = useState(false);
  const dragNode = useRef<HTMLElement | null>(null);

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
      if (sortBy) params.set("sortBy", sortBy);
      if (sortOrder) params.set("sortOrder", sortOrder);

      const res = await fetch(`/api/admin/products?${params}`);
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      setProducts(data.items);
      setPagination(data.pagination);
      setSelectedIds(new Set());
      setLoading(false);
    },
    [search, category, archivedParam, marketplaceParam, sortBy, sortOrder, router],
  );

  // Fetch on mount — легитимный паттерн: загрузка списка при монтировании.
  // Первый setState (setLoading) здесь синхронный по определению; React 19
  // автоматически батчит повторные рендеры, каскада нет.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchProducts(1); }, [fetchProducts]);

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

  async function fetchModelsOnce() {
    if (modelsFetchedRef.current && models.length > 0) return;
    modelsFetchedRef.current = true;
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

  function toggleSortDirection() {
    setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
  }

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
              {pickDisplayImage(p) && <img src={blobUrl(pickDisplayImage(p)!)} alt="" className={styles.reorderThumb} />}
              <span className={styles.reorderName}>{p.name}</span>
              <span className={styles.reorderPrice}>{formatPrice(p.price)}</span>
              <span className={styles.reorderBadge}>{getCategoryName(p.category)}</span>
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
        title="Список"
        subtitle={`${pagination.total} товаров${selectedIds.size > 0 ? ` · выбрано ${selectedIds.size}` : ""}`}
      >
        <AdminButton variant="secondary" onClick={enterReorderMode}>
          ≡ Управление порядком
        </AdminButton>
        <AdminButton variant="primary" href="/admin/products/new">
          + Добавить товар
        </AdminButton>
      </AdminPageHeader>

      {/* ─── Filters ─── */}
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
        <div className={styles.sortGroup}>
          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            title="Сортировка"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            className={styles.sortDirBtn}
            onClick={toggleSortDirection}
            title={sortOrder === "asc" ? "По возрастанию" : "По убыванию"}
          >
            {sortOrder === "asc" ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {/* ─── Bulk toolbar ─── */}
      {selectedIds.size > 0 && (
        <div className={styles.bulkToolbar}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={products.length > 0 && selectedIds.size === products.length}
            onChange={toggleSelectAll}
            title="Выбрать все"
          />
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

      {/* ─── Карточки (лента) ─── */}
      <div className={styles.list}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.skeletonRow}>
              <div className={`${styles.skeleton} ${styles.skeletonPhoto}`} />
              <div className={styles.skeletonInfo}>
                <div className={`${styles.skeleton}`} style={{ height: 14, width: "55%", borderRadius: 3 }} />
                <div className={`${styles.skeleton}`} style={{ height: 12, width: "30%", borderRadius: 3 }} />
                <div className={`${styles.skeleton}`} style={{ height: 16, width: 70, borderRadius: 3 }} />
                <div className={`${styles.skeleton}`} style={{ height: 24, width: 120, borderRadius: 4 }} />
              </div>
            </div>
          ))
        ) : products.length === 0 ? (
          <p className={styles.empty}>
            {statusTab === "archived" ? "Нет архивных товаров" : "Нет товаров"}
          </p>
        ) : (
          products.map((p) => {
            const isSelected = selectedIds.has(p.id);
            const wbInStock = p.wbStock != null && p.wbStock > 0;
            const ozonInStock = p.ozonStock != null && p.ozonStock > 0;
            return (
              <div
                key={p.id}
                className={`${styles.row} ${isSelected ? styles.rowSelected : ""}`}
              >
                <label className={styles.rowCheckWrap} title="Выбрать">
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={isSelected}
                    onChange={() => toggleSelect(p.id)}
                  />
                </label>
                <div className={styles.rowCard}>
                  <ProductCard item={p} />
                </div>

                {/* Наличие, рейтинг, модель */}
                <div className={styles.rowAside}>
                  <div className={styles.stockLine} title="Наличие на WB">
                    <span className={`${styles.stockDot} ${p.wbArticle ? (wbInStock ? styles.stockDotIn : styles.stockDotOut) : styles.stockDotNone}`} />
                    <span className={styles.stockMp}>WB</span>
                    {p.wbArticle ? (
                      <span className={wbInStock ? styles.stockValue : styles.stockValueOut}>
                        {wbInStock ? `${p.wbStock} шт` : "нет"}
                      </span>
                    ) : (
                      <span className={styles.stockValueNone}>—</span>
                    )}
                  </div>
                  <div className={styles.stockLine} title="Наличие на Ozon">
                    <span className={`${styles.stockDot} ${p.ozonArticle ? (ozonInStock ? styles.stockDotIn : styles.stockDotOut) : styles.stockDotNone}`} />
                    <span className={`${styles.stockMp} ${styles.stockMpOzon}`}>Ozon</span>
                    {p.ozonArticle ? (
                      <span className={ozonInStock ? styles.stockValue : styles.stockValueOut}>
                        {ozonInStock ? `${p.ozonStock} шт` : "нет"}
                      </span>
                    ) : (
                      <span className={styles.stockValueNone}>—</span>
                    )}
                  </div>
                  {p.rating != null && p.rating >= 4 ? (
                    <div className={styles.rowRating} title="Рейтинг">
                      {p.rating.toFixed(1)} ★
                    </div>
                  ) : null}
                  {p.model ? (
                    <Link
                      href={`/admin/products/models/${p.model.id}`}
                      className={styles.rowModel}
                      title="Открыть модель"
                    >
                      {p.model.name}
                    </Link>
                  ) : null}
                  <button
                    className={styles.rowDelete}
                    onClick={() => handleDelete(p.id)}
                    title="Удалить"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        )}
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
    </div>
  );
}
