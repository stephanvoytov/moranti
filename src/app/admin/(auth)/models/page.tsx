"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./models.module.css";
import { CATEGORIES } from "@/lib/categories";
import AdminButton from "@/components/admin/admin-button";
import AdminModal from "@/components/admin/admin-modal";

interface ProductBrief {
  id: string;
  name: string;
  price: number;
  category: string;
  wbArticle?: number;
  ozonArticle?: number;
  colorName?: string;
  image?: string;
  modelId?: string | null;
  archivedAt?: string | null;
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

export default function AdminModelsKanban() {
  const router = useRouter();
  const [models, setModels] = useState<ModelBrief[]>([]);
  const [unassigned, setUnassigned] = useState<ProductBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dragging state
  const [dragItem, setDragItem] = useState<{ productId: string; fromCol: string } | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

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
      setModels(data.items || []);
      setUnassigned(data.unassigned || []);
    } catch {
      setError("Не удалось загрузить данные. Сервер БД холодный?");
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Build columns ───

  const catColor = (slug: string): string => {
    const map: Record<string, string> = {
      crossbody: "#8B6F5C", "na-plecho": "#5B7B6F", baguette: "#7B5B8B",
      tote: "#8B7B5B", saddle: "#8B5B5B", backpack: "#5B6F8B",
    };
    return map[slug] || "#999";
  };

  const columns: Column[] = [
    {
      id: "__unassigned",
      title: "Без модели",
      catColor: "#aaa",
      items: unassigned,
    },
    ...models.map((m) => ({
      id: m.id,
      title: m.name,
      catColor: catColor(m.category),
      items: m.variants,
    })),
  ];

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
          ? { ...m, variants: [...m.variants, { id: productId, name: "", price: 0, category: "", image: "" }] }
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

  // ─── Helpers ───

  function formatPrice(n?: number) {
    return n ? n.toLocaleString("ru-RU") + " ₽" : "";
  }

  const catName = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.name || slug;

  // ─── Render ───

  if (loading) {
    return <div className={styles.page}><p className={styles.loading}>Загрузка...</p></div>;
  }

  if (error) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Распределение товаров по моделям</h1>
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
          <h1 className={styles.title}>Распределение товаров по моделям</h1>
          <p className={styles.subtitle}>
            {models.length} моделей, {models.reduce((s, m) => s + m.variants.length, 0)} товаров в моделях,
            {unassigned.length} без модели
          </p>
        </div>
        <div className={styles.headerActions}>
          <AdminButton variant="secondary" href="/admin/products">Все товары</AdminButton>
          <AdminButton variant="primary" onClick={() => setShowNewModal(true)}>
            + Новая модель
          </AdminButton>
        </div>
      </header>

      {/* ─── Kanban board ─── */}
      <div className={styles.board}>
        {columns.map((col) => {
          const isEmpty = col.id !== "__unassigned" && col.items.length === 0;
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
                      <Link href={`/admin/models/${col.id}`} className={styles.colTitle}>
                        {col.title}
                      </Link>
                    )}
                    <span className={styles.colCount}>{col.items.length}</span>
                  </div>
                </div>
                {col.id !== "__unassigned" && col.items.length > 0 && (
                  <span className={styles.colCatName}>{catName(col.items[0].category)}</span>
                )}
              </div>

              {/* Column body */}
              <div className={styles.colBody}>
                {col.items.length === 0 && col.id === "__unassigned" && (
                  <div className={styles.colEmpty}>Все товары распределены</div>
                )}
                {col.items.length === 0 && col.id !== "__unassigned" && (
                  <div className={styles.colEmpty}>Нет товаров</div>
                )}

                {col.items.map((item) => {
                  const isArchived = !!item.archivedAt;
                  return (
                    <div
                      key={item.id}
                      className={`${styles.card} ${isArchived ? styles.cardArchived : ""} ${dragItem?.productId === item.id ? styles.cardDrag : ""}`}
                      draggable
                      onDragStart={() => handleDragStart(item.id, col.id)}
                      onDragEnd={handleDragEnd}
                    >
                      {/* Thumbnail */}
                      <Link
                        href={`/admin/products/${item.id}`}
                        className={styles.cardThumb}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.image ? (
                          <div className={styles.cardThumbWrapper}>
                            <img src={item.image} alt="" className={styles.cardImg} />
                            {isArchived && <div className={styles.cardArchiveCorner} title="В архиве" />}
                            <span className={`${styles.cardMpBadge} ${item.ozonArticle ? (item.wbArticle ? styles.cardMpBadgeBoth : styles.cardMpBadgeOzon) : styles.cardMpBadgeWb}`}>
                              {item.wbArticle && item.ozonArticle ? "W+O" : item.ozonArticle ? "OZ" : "WB"}
                            </span>
                          </div>
                        ) : (
                          <div className={styles.cardPlaceholder} />
                        )}
                      </Link>

                      {/* Info */}
                      <div className={styles.cardInfo}>
                        <div className={styles.cardNameRow}>
                          <Link href={`/admin/products/${item.id}`} className={styles.cardName}>
                            {item.name || "—"}
                          </Link>
                          {isArchived && <span className={styles.cardArchivedBadge}>A</span>}
                        </div>
                        <div className={styles.cardMeta}>
                          <span className={styles.cardPrice}>{formatPrice(item.price)}</span>
                          {item.colorName && <span className={styles.cardColor}>{item.colorName}</span>}
                        </div>
                        <div className={styles.cardArticles}>
                          {item.wbArticle && <span className={`${styles.cardArt} ${isArchived ? styles.cardArtArchived : ""}`}>WB</span>}
                          {item.ozonArticle && <span className={`${styles.cardArt} ${styles.cardArtOzon} ${isArchived ? styles.cardArtArchived : ""}`}>Ozon</span>}
                        </div>
                      </div>

                      {/* Drag handle */}
                      <span className={styles.cardDragHandle} aria-label="Перетащить">⠿</span>
                    </div>
                  );
                })}
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
