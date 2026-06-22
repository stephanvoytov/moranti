"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ui/product-card";
import { useProducts } from "@/lib/use-products";
import { getRecentlyViewed } from "@/lib/recently-viewed";
import { useDragScroll } from "@/lib/use-drag-scroll";
import { normalizeColorName } from "@/lib/color-map";
import styles from "./page.module.css";

const ITEMS_PER_PAGE = 24;
const SEARCH_DEBOUNCE_MS = 300;

function sortByOrder(
  products: import("@/data/products").Product[],
  order: string[],
): import("@/data/products").Product[] {
  if (!order || order.length === 0) return products;
  const orderMap = new Map(order.map((id, i) => [id, i]));
  const inOrder: import("@/data/products").Product[] = [];
  const rest: import("@/data/products").Product[] = [];
  for (const p of products) {
    if (orderMap.has(p.id)) {
      inOrder.push(p);
    } else {
      rest.push(p);
    }
  }
  inOrder.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
  return [...inOrder, ...rest];
}

function normalizeMaterial(composition: string | undefined): string | null {
  if (!composition) return null;
  const c = composition.toLowerCase();
  const hasLeather = c.includes("кожа");
  const hasSuede = c.includes("замша");
  if (hasLeather && hasSuede) return "Кожа + Замша";
  if (hasLeather) return "Кожа";
  if (hasSuede) return "Замша";
  return null;
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const { products, categories } = useProducts();
  const [catalogOrder, setCatalogOrder] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/data/settings")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.catalogOrder)) setCatalogOrder(data.catalogOrder);
      })
      .catch(() => {});
  }, []);

  const initialCat = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCat ?? null,
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // ― Search state with debounce ―
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ― Sort & price filter state — read sort from URL ―
  const initialSort = ["default", "new", "price-asc", "price-desc", "name"].includes(
    searchParams.get("sort") ?? "",
  )
    ? (searchParams.get("sort") as string)
    : "default";
  const [sortOption, setSortOption] = useState(initialSort);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Reset page to 1 when any filter changes
  const prevFilterKey = useRef("");
  useEffect(() => {
    const key = `${selectedCategory}-${selectedColor}-${selectedMaterial}-${searchQuery}-${priceMin}-${priceMax}-${sortOption}`;
    if (prevFilterKey.current !== "" && prevFilterKey.current !== key) {
      setPage(1);
    }
    prevFilterKey.current = key;
  }, [selectedCategory, selectedColor, selectedMaterial, searchQuery, priceMin, priceMax, sortOption]);

  // ― Recently viewed ―
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([]);
  const drag = useDragScroll<HTMLDivElement>();

  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed());
  }, []);

  const recentProducts = recentlyViewed
    .map((article) => products.find((p) => p.wbArticle === article))
    .filter((p): p is NonNullable<typeof p> => p != null);

  // Reset category when URL changes
  useEffect(() => {
    setSelectedCategory(initialCat ?? null);
    setPage(1);
  }, [initialCat]);

  // ― Extract unique colors (normalized) and materials from products ―
  const colorOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.colorName) set.add(normalizeColorName(p.colorName));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ru"));
  }, [products]);

  const materialOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      const m = normalizeMaterial(p.composition);
      if (m) set.add(m);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ru"));
  }, [products]);

  // ― Filter pipeline: category → color → material → search → price → sort ―
  const filtered = useMemo(() => {
    let result = selectedCategory
      ? products.filter((p) => p.category === selectedCategory)
      : [...products];

    // Color filter
    if (selectedColor) {
      result = result.filter((p) => p.colorName && normalizeColorName(p.colorName) === selectedColor);
    }

    // Material filter
    if (selectedMaterial) {
      result = result.filter((p) => normalizeMaterial(p.composition) === selectedMaterial);
    }

    // Search filter (case-insensitive)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Price range filter
    const min = priceMin !== "" ? parseFloat(priceMin) : undefined;
    const max = priceMax !== "" ? parseFloat(priceMax) : undefined;
    if (min !== undefined && !isNaN(min)) {
      result = result.filter((p) => p.price >= min);
    }
    if (max !== undefined && !isNaN(max)) {
      result = result.filter((p) => p.price <= max);
    }

    // Sort
    switch (sortOption) {
      case "new":
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name, "ru"));
        break;
      default:
        result = sortByOrder(result, catalogOrder);
    }

    return result;
  }, [products, selectedCategory, selectedColor, selectedMaterial, searchQuery, priceMin, priceMax, sortOption, catalogOrder]);

  // ― Paginate ―
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const safePage = Math.min(page, Math.max(totalPages, 1));
  const paginated = filtered.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  const handleFilter = (cat: string | null) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  const hasActiveFilter = selectedCategory || selectedColor || selectedMaterial;
  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedColor(null);
    setSelectedMaterial(null);
    setPage(1);
  };

  return (
    <div className={styles.page}>
      {/* Recently viewed — above catalog */}
      {recentProducts.length > 0 && (
        <section className={styles.recentlySection}>
          <h2 className={styles.recentlyTitle}>Вы недавно смотрели</h2>
          <div className={styles.recentlyRow}
            ref={drag.ref}
            onMouseDown={drag.onMouseDown}
            onMouseMove={drag.onMouseMove}
            onMouseUp={drag.onMouseUp}
            onDragStart={drag.onDragStart}
            style={{ cursor: "grab" }}
          >
            {recentProducts.map((product, i) => (
              <div key={product.id} className={styles.recentlyCard}>
                <ProductCard product={product} priority={i < 2} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={styles.catalog}>
        <div className={styles.header}>
          <span className={styles.label}>Каталог</span>
          <h1 className={styles.title}>Наши сумки</h1>
        </div>

        {/* Toolbar: search + toggle button + filter panel */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarMain}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Поиск..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button
              className={styles.filterToggle}
              onClick={() => setShowFilters((p) => !p)}
            >
              {showFilters ? "Скрыть" : "Фильтры"}
            </button>
          </div>

          <div
            className={`${styles.filterPanel} ${showFilters ? styles.filterPanelVisible : ""}`}
          >
            <div className={styles.filterSelectWrapper}>
              <select
                className={styles.filterSelect}
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="default">По умолчанию</option>
                <option value="new">По новинкам</option>
                <option value="price-asc">По цене: возрастание</option>
                <option value="price-desc">По цене: убывание</option>
                <option value="name">По названию</option>
              </select>
            </div>

            {colorOptions.length > 0 && (
              <div className={styles.filterSelectWrapper}>
                <select
                  className={styles.filterSelect}
                  value={selectedColor || ""}
                  onChange={(e) =>
                    setSelectedColor(e.target.value || null)
                  }
                >
                  <option value="">Цвет</option>
                  {colorOptions.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {materialOptions.length > 0 && (
              <div className={styles.filterSelectWrapper}>
                <select
                  className={styles.filterSelect}
                  value={selectedMaterial || ""}
                  onChange={(e) =>
                    setSelectedMaterial(e.target.value || null)
                  }
                >
                  <option value="">Материал</option>
                  {materialOptions.map((mat) => (
                    <option key={mat} value={mat}>
                      {mat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={styles.priceGroup}>
              <input
                type="number"
                className={styles.priceInput}
                placeholder="от"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                min={0}
              />
              <span className={styles.priceDash}>—</span>
              <input
                type="number"
                className={styles.priceInput}
                placeholder="до"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                min={0}
              />
            </div>
          </div>
        </div>

        {/* Category pills — always visible */}
        <div className={styles.filterSection}>
          <div className={styles.filterRow}>
            <button
              className={`${styles.filterPill} ${selectedCategory === null ? styles.pillActive : ""}`}
              onClick={() => { setSelectedCategory(null); setPage(1); }}
            >
              Все
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                className={`${styles.filterPill} ${selectedCategory === cat.slug ? styles.pillActive : ""}`}
                onClick={() => handleFilter(cat.slug)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active filter strip */}
        {hasActiveFilter && (
          <div className={styles.activeFilters}>
            {selectedCategory && (
              <span className={styles.activePill}>
                {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                <button className={styles.activeRemove} onClick={() => setSelectedCategory(null)}>×</button>
              </span>
            )}
            {selectedColor && (
              <span className={styles.activePill}>
                {selectedColor}
                <button className={styles.activeRemove} onClick={() => setSelectedColor(null)}>×</button>
              </span>
            )}
            {selectedMaterial && (
              <span className={styles.activePill}>
                {selectedMaterial}
                <button className={styles.activeRemove} onClick={() => setSelectedMaterial(null)}>×</button>
              </span>
            )}
            <button className={styles.clearBtn} onClick={clearFilters}>Сбросить всё</button>
          </div>
        )}

        {/* Product grid or empty state */}
        {paginated.length > 0 ? (
          <div className={styles.productGrid}>
            {paginated.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 4} />
            ))}
          </div>
        ) : (
          <p className={styles.noResults}>Ничего не найдено</p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={`${styles.pageBtn} ${safePage <= 1 ? styles.pageBtnDisabled : ""}`}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
              ←
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (p === 1 || p === totalPages) return true;
                if (Math.abs(p - safePage) <= 1) return true;
                return false;
              })
              .map((p, idx, arr) => (
                <span key={p} className={styles.pageGroup}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className={styles.pageEllipsis}>…</span>
                  )}
                  <button
                    className={`${styles.pageBtn} ${p === safePage ? styles.pageBtnActive : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                </span>
              ))}

            <button
              className={`${styles.pageBtn} ${safePage >= totalPages ? styles.pageBtnDisabled : ""}`}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className={styles.loading}>Загрузка...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
