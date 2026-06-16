"use client";

import { useState, useEffect, useCallback } from "react";
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

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Товары</h1>
          <p className={styles.subtitle}>
            {pagination.total} товаров
          </p>
        </div>
        <Link href="/admin/products/new" className={styles.addBtn}>
          + Добавить товар
        </Link>
      </header>

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
          <option value="shoulder">Shoulder</option>
          <option value="tote">Tote</option>
          <option value="mini">Мини</option>
          <option value="backpack">Рюкзаки</option>
          <option value="baguette">Багет</option>
          <option value="saddle">Седло</option>
          <option value="evening">Вечерние</option>
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
    </div>
  );
}
