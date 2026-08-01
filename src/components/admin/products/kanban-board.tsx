"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./kanban-board.module.css";
import { CATEGORIES, getCategoryName, getCategoryColor } from "@/lib/categories";
import AdminButton from "@/components/admin/admin-button";
import AdminModal from "@/components/admin/admin-modal";
import ProductCard, { type ProductCardItem } from "@/components/admin/products/product-card";

interface ProductBrief extends ProductCardItem {
  category: string;
  modelId?: string | null;
}

interface ModelBrief {
  id: string;
  name: string;
  slug: string;
  category: string;
  composition?: string;
  dimensions?: string;
  variants: ProductBrief[];
  sortOrder: number;
}

type Column = {
  id: string;        // model id or "__unassigned"
  title: string;
  catColor: string;
  items: ProductBrief[];
};

export default function AdminProductsKanban() {
  const router = useRouter();
  const [models, setModels] = useState<ModelBrief[]>([]);
  const [unassigned, setUnassigned] = useState<ProductBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dragging state
  const [dragItem, setDragItem] = useState<{ productId: string; fromCol: string } | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  // Фильтры доски: поиск по названию/SKU + площадка
  const [search, setSearch] = useState("");
  const [mpFilter, setMpFilter] = useState<"" | "wb" | "ozon">("");

  // New model modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState("crossbody");
  const [creating, setCreating] = useState(false);
  const savingCount = useRef(0);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/models?includeUnassigned=true");
      if (res.status === 401) return router.push("/admin/login");
      if (!res.ok) {
        setError(`Ошибка загрузки: ${res.status}`);
        return;
      }
      const data = await res.json();
      setModels(
        (data.items || []).sort((a: ModelBrief, b: ModelBrief) => {
          const inStockA = a.variants.filter((v) => (v.wbStock ?? 0) > 0 || (v.ozonStock ?? 0) > 0).length;
          const inStockB = b.variants.filter((v) => (v.wbStock ?? 0) > 0 || (v.ozonStock ?? 0) > 0).length;
          return inStockB - inStockA; // больше в наличии — выше
        })
      );
      setUnassigned(data.unassigned || []);
    } catch {
      setError("Не удалось загрузить данные. Сервер БД не отвечает?");
    } finally { setLoading(false); }
  }, [router]);

  // Fetch on mount — легитимный паттерн загрузки данных при монтировании.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Build columns ───

  // Фильтр: поиск по названию/SKU + площадка (WB / Ozon)
  const matchesFilter = (item: ProductBrief): boolean => {
    if (mpFilter === "wb" && !item.wbArticle) return false;
    if (mpFilter === "ozon" && !item.ozonArticle) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return (
        (item.name || "").toLowerCase().includes(q) ||
        (item.sku || "").toLowerCase().includes(q)
      );
    }
    return true;
  };

  // Сортировка внутри столбца: в наличии (wbStock/ozonStock > 0) — сверху,
  // затем не в наличии, архивные — в самом низу. Стабильная, сохраняет
  // исходный порядок для равных.
  const sortVariantsByStock = (items: ProductBrief[]): ProductBrief[] =>
    [...items].sort((a, b) => {
      const inStockA = (a.wbStock ?? 0) > 0 || (a.ozonStock ?? 0) > 0;
      const inStockB = (b.wbStock ?? 0) > 0 || (b.ozonStock ?? 0) > 0;
      if (inStockA !== inStockB) return inStockA ? -1 : 1;
      const archivedA = a.archivedAt ? 1 : 0;
      const archivedB = b.archivedAt ? 1 : 0;
      return archivedA - archivedB;
    });

  const filterActive = search.trim() !== "" || mpFilter !== "";
  const filteredUnassigned = unassigned.filter(matchesFilter);
  const filteredModels = models
    .map((m) => ({ ...m, variants: m.variants.filter(matchesFilter) }))
    // При активном фильтре прячем модели без совпадений
    .filter((m) => !filterActive || m.variants.length > 0);

  const columns: Column[] = [
    {
      id: "__unassigned",
      title: "Без модели",
      catColor: "#aaa",
      items: sortVariantsByStock(filteredUnassigned),
    },
    ...filteredModels.map((m) => ({
      id: m.id,
      title: m.name,
      catColor: getCategoryColor(m.category),
      items: sortVariantsByStock(m.variants),
    })),
  ];

  const totalVisible = columns.reduce((s, c) => s + c.items.length, 0);

  // ─── DnD handlers ───

  function handleDragStart(productId: string, fromCol: string) {
    setDragItem({ productId, fromCol });
  }

  function handleDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault();
    setDragOverCol(colId);
  }

  function handleDragLeave(colId: string) {
    if (dragOverCol === colId) setDragOverCol(null);
  }

  async function handleDrop(e: React.DragEvent, toCol: string) {
    e.preventDefault();
    if (!dragItem) return;

    const { productId, fromCol } = dragItem;
    setDragItem(null);
    setDragOverCol(null);

    if (fromCol === toCol) return; // same column

    // Optimistic update
    const newModelId = toCol === "__unassigned" ? "" : toCol;

    if (fromCol === "__unassigned") {
      setUnassigned((prev) => prev.filter((p) => p.id !== productId));
    } else {
      setModels((prev) => prev.map((m) =>
        m.id === fromCol
          ? { ...m, variants: m.variants.filter((v) => v.id !== productId) }
          : m
      ));
    }

    if (toCol === "__unassigned") {
      // Fetch fresh unassigned later — but for instant feedback:
      setUnassigned((prev) => {
        if (prev.some((p) => p.id === productId)) return prev;
        // We don't have the full product data here easily, but we can re-fetch
        return prev;
      });
    } else {
      setModels((prev) => prev.map((m) =>
        m.id === toCol
          ? { ...m, variants: [...m.variants, { id: productId, slug: "", name: "", price: 0, category: "", image: "" }] }
          : m
      ));
    }

    // Real API call
    savingCount.current += 1;
    try {
      await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign-model",
          ids: [productId],
          modelId: newModelId || undefined,
        }),
      });
    } catch { /* ignore */ }

    // Full re-fetch to sync
    setTimeout(() => {
      savingCount.current -= 1;
      if (savingCount.current === 0) fetchData();
    }, 300);
  }

  function handleDragEnd() {
    setDragItem(null);
    setDragOverCol(null);
  }

  // ─── New model ───

  async function createModel() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const slug = "model-" + newName.trim()
        .toLowerCase()
        .replace(/[^a-zа-яё0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40);

      const res = await fetch("/api/admin/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), slug, category: newCat, description: "" }),
      });

      if (res.ok) {
        setShowNewModal(false);
        setNewName("");
        setNewCat("crossbody");
        fetchData();
      }
    } catch { /* ignore */ }
    finally { setCreating(false); }
  }

  // ─── Marketplace stats (только активные) ───
  const activeVariants = columns.flatMap((c) => c.items).filter((v) => !v.archivedAt);
  const totalVariants = activeVariants.length;
  const onWb = activeVariants.filter((v) => v.wbArticle);
  const wbInStock = onWb.filter((v) => (v.wbStock ?? 0) > 0);
  const wbNoStock = onWb.filter((v) => (v.wbStock ?? 0) <= 0);
  const onOzon = activeVariants.filter((v) => v.ozonArticle);
  const ozInStock = onOzon.filter((v) => (v.ozonStock ?? 0) > 0);
  const ozNoStock = onOzon.filter((v) => (v.ozonStock ?? 0) <= 0);

  // ─── Render ───

  if (loading) {
    return <div className={styles.page}><p className={styles.loading}>Загрузка...</p></div>;
  }

  if (error) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Канбан</h1>
        </header>
        <div className={styles.error}>
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={fetchData}>
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ─── Header ─── */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Канбан</h1>
          <p className={styles.subtitle}>
            {models.length} моделей, {models.reduce((s, m) => s + m.variants.length, 0)} товаров в моделях,
            {unassigned.length} без модели
            {search.trim() || mpFilter ? ` · показано ${totalVisible}` : ""}
          </p>
        </div>
        <div className={styles.headerActions}>
          <AdminButton variant="primary" onClick={() => setShowNewModal(true)}>
            + Новая модель
          </AdminButton>
        </div>
      </header>

      {/* ─── Фильтры доски ─── */}
      <div className={styles.boardFilters}>
        <input
          type="text"
          className={styles.boardSearch}
          placeholder="Поиск по названию или SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.mpPills}>
          {[
            { value: "", label: "Все МП" },
            { value: "wb", label: "WB" },
            { value: "ozon", label: "Ozon" },
          ].map((mp) => (
            <button
              key={mp.value}
              className={`${styles.mpPill} ${mpFilter === mp.value ? styles.mpPillActive : ""}`}
              onClick={() => setMpFilter(mp.value as "" | "wb" | "ozon")}
            >
              {mp.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Marketplace summary (компактно) ─── */}
      <div className={styles.summaryBar}>
        <span className={styles.summaryTotal}>Вариантов: {totalVariants}</span>
        <span className={styles.summaryMp} title="в наличии / без остатка / всего">
          <span className={`${styles.summaryIcon} ${styles.wbIcon}`}>WB</span>
          <span className={styles.summaryIn}>{wbInStock.length}</span>
          <span className={styles.summaryMuted}>/</span>
          <span className={styles.summaryOut}>{wbNoStock.length}</span>
          <span className={styles.summaryMuted}>· {onWb.length}</span>
        </span>
        <span className={styles.summaryMp} title="в наличии / без остатка / всего">
          <span className={`${styles.summaryIcon} ${styles.ozonIcon}`}>OZ</span>
          <span className={styles.summaryIn}>{ozInStock.length}</span>
          <span className={styles.summaryMuted}>/</span>
          <span className={styles.summaryOut}>{ozNoStock.length}</span>
          <span className={styles.summaryMuted}>· {onOzon.length}</span>
        </span>
      </div>

      {/* ─── Kanban board ─── */}
      <div className={styles.board}>
        {columns.map((col) => {
          const isOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              className={`${styles.column} ${isOver ? styles.columnOver : ""}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => handleDragLeave(col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column header */}
              <div className={styles.colHeader}>
                <div className={styles.colHeaderLeft}>
                  <span className={styles.colCatDot} style={{ background: col.catColor }} />
                  <div>
                    {col.id === "__unassigned" ? (
                      <span className={styles.colTitle}>{col.title}</span>
                    ) : (
                      <Link href={`/admin/products/models/${col.id}`} className={styles.colTitle}>
                        {col.title}
                      </Link>
                    )}
                    <span className={styles.colCount}>{col.items.length}</span>
                  </div>
                </div>
                {col.id !== "__unassigned" && col.items.length > 0 && (
                  <span className={styles.colCatName}>{getCategoryName(col.items[0].category)}</span>
                )}
              </div>

              {/* Column body */}
              <div className={styles.colBody}>
                {col.items.length === 0 && (search.trim() || mpFilter) && (
                  <div className={styles.colEmpty}>Нет совпадений</div>
                )}
                {col.items.length === 0 && !search.trim() && !mpFilter && col.id === "__unassigned" && (
                  <div className={styles.colEmpty}>Все товары распределены</div>
                )}
                {col.items.length === 0 && !search.trim() && !mpFilter && col.id !== "__unassigned" && (
                  <div className={styles.colEmpty}>Нет товаров</div>
                )}

                {col.items.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    draggable
                    isDragging={dragItem?.productId === item.id}
                    onDragStart={() => handleDragStart(item.id, col.id)}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── New model modal ─── */}
      <AdminModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="Новая модель"
        actions={[
          { label: "Отмена", onClick: () => setShowNewModal(false) },
          {
            label: "Создать",
            onClick: createModel,
            variant: "primary",
            disabled: !newName.trim() || creating,
          },
        ]}
      >
        <label className={styles.fieldLabel}>Название модели</label>
        <input
          className={styles.fieldInput}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Например: Кросс-боди 20×14×5"
          autoFocus
        />
        <label className={styles.fieldLabel} style={{ marginTop: 12 }}>Категория</label>
        <select className={styles.fieldSelect} value={newCat} onChange={(e) => setNewCat(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </AdminModal>
    </div>
  );
}
