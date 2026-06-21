"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./products.module.css";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  wbArticle: number;
  image: string;
  rating?: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  // Reorder state
  const [reorderMode, setReorderMode] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderSaved, setOrderSaved] = useState(false);
  const dragNode = useRef<HTMLElement | null>(null);

  const fetchProducts = useCallback(
    async (page = 1) => {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (search) params.set("search", search);
      if (category) params.set("category", category);

      const res = await fetch(`/api/admin/products?${params}`);
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setProducts(data.items);
      setPagination(data.pagination);
      setLoading(false);
    },
    [search, category, router],
  );

  useEffect(() => {
    async function load() {
      const params = new URLSearchParams();
      params.set("page", "1");

      try {
        const res = await fetch(`/api/admin/products?${params}`);
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        const data = await res.json();
        setProducts(data.items);
        setPagination(data.pagination);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function handleDelete(id: string) {
    if (!confirm("Удалить товар?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) fetchProducts(pagination.page);
  }

  // ─── Reorder mode ───

  async function enterReorderMode() {
    setLoading(true);
    setReorderMode(true);

    // Fetch all products
    const [productsRes, settingsRes] = await Promise.all([
      fetch("/api/admin/products?page=1&limit=200"),
      fetch("/api/admin/settings"),
    ]);

    if (productsRes.status === 401 || settingsRes.status === 401) {
      router.push("/admin/login");
      return;
    }

    const productsData = await productsRes.json();
    const settingsData = await settingsRes.json();
    const catalogOrder: string[] = settingsData.catalogOrder || [];

    // Sort by catalogOrder
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
    if (dragNode.current) {
      dragNode.current.classList.remove(styles.dragging);
    }
    setDragIndex(null);
  }

  async function saveOrder() {
    setSavingOrder(true);
    setOrderSaved(false);

    const order = allProducts.map((p) => p.id);

    try {
      // Fetch current settings first, merge with new order
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

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Товары</h1>
          {!reorderMode && (
            <p className={styles.subtitle}>
              {pagination.total} товаров
            </p>
          )}
        </div>
        <div className={styles.headerActions}>
          {reorderMode ? (
            <>
              {orderSaved && <span className={styles.savedBadge}>Сохранено</span>}
              <button
                className={styles.saveOrderBtn}
                onClick={saveOrder}
                disabled={savingOrder}
              >
                {savingOrder ? "Сохранение..." : "Сохранить порядок"}
              </button>
              <button
                className={styles.cancelReorderBtn}
                onClick={exitReorderMode}
              >
                Закрыть
              </button>
            </>
          ) : (
            <>
              <button
                className={styles.reorderBtn}
                onClick={enterReorderMode}
              >
                ≡ Управление порядком
              </button>
              <Link href="/admin/products/new" className={styles.addBtn}>
                + Добавить товар
              </Link>
            </>
          )}
        </div>
      </header>

      {reorderMode ? (
        <>
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
                <span className={styles.reorderHandle} aria-label="Перетащить">
                  ⋮⋮
                </span>
                <span className={styles.reorderNum}>{idx + 1}</span>
                {p.image && (
                  <img src={p.image} alt="" className={styles.reorderThumb} />
                )}
                <span className={styles.reorderName}>{p.name}</span>
                <span className={styles.reorderPrice}>
                  {p.price.toLocaleString("ru-RU")} ₽
                </span>
                <span className={styles.reorderBadge}>{p.category}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Filters */}
          <div className={styles.filters}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Поиск по названию, ID или артикулу..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className={styles.categorySelect}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Все категории</option>
              <option value="crossbody">Кросс-боди</option>
              <option value="na-plecho">На плечо</option>
              <option value="baguette">Багет</option>
              <option value="tote">Тоут</option>
              <option value="saddle">Седло</option>
              <option value="backpack">Рюкзаки</option>
            </select>
          </div>

          {/* Table */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th></th>
                  <th>Название</th>
                  <th>Цена</th>
                  <th>Категория</th>
                  <th>Артикул</th>
                  <th>Рейтинг</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className={styles.loading}>
                      Загрузка...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.empty}>
                      Нет товаров
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {p.image && (
                          <img
                            src={p.image}
                            alt=""
                            className={styles.thumb}
                          />
                        )}
                      </td>
                      <td>
                        <Link
                          href={`/admin/products/${p.id}`}
                          className={styles.productName}
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td className={styles.price}>
                        {p.price.toLocaleString("ru-RU")} ₽
                      </td>
                      <td>
                        <span className={styles.categoryBadge}>{p.category}</span>
                      </td>
                      <td className={styles.article}>{p.wbArticle}</td>
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    className={`${styles.pageBtn} ${p === pagination.page ? styles.pageActive : ""}`}
                    onClick={() => fetchProducts(p)}
                  >
                    {p}
                  </button>
                ),
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
