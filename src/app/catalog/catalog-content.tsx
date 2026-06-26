"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import ProductCard from "@/components/ui/product-card";
import type { Product, ProductCategory } from "@/data/products";
import { useProducts } from "@/lib/use-products";
import { getRecentlyViewed } from "@/lib/recently-viewed";
import { useDragScroll } from "@/lib/use-drag-scroll";
import { resolveColor, getBasicColorName } from "@/lib/color-map";
import styles from "./page.module.css";

interface CatalogContentProps {
  initialProducts?: Product[];
  initialCategories?: ProductCategory[];
  initialCatalogOrder?: string[];
}

const ITEMS_PER_PAGE = 24;
const SEARCH_DEBOUNCE_MS = 300;

function sortByOrder(
  products: Product[],
  order: string[],
): Product[] {
  if (!order || order.length === 0) return products;
  const orderMap = new Map(order.map((id, i) => [id, i]));
  const inOrder: Product[] = [];
  const rest: Product[] = [];
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

function CatalogContent({ initialProducts, initialCategories, initialCatalogOrder }: CatalogContentProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Use server-provided initial data if available (first load), fall back to API fetch
  const hasInitialData = initialProducts && initialProducts.length > 0;
  const { products, categories } = hasInitialData
    ? { products: initialProducts, categories: initialCategories ?? [] }
    : useProducts();

  const [loaded, setLoaded] = useState(hasInitialData);
  useEffect(() => {
    if (!hasInitialData && products.length > 0) setLoaded(true);
  }, [products, hasInitialData]);

  // catalogOrder: from props (server) or fetch from API (client nav)
  const [catalogOrder, setCatalogOrder] = useState<string[]>(initialCatalogOrder ?? []);
  useEffect(() => {
    if (!hasInitialData && !initialCatalogOrder) {
      fetch("/api/data/settings")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.catalogOrder)) setCatalogOrder(data.catalogOrder);
        })
        .catch(() => {});
    }
  }, [hasInitialData, initialCatalogOrder]);

  // Read all filter state from URL
  const urlMarketplace = searchParams.get("marketplace");
  const urlCategory = searchParams.get("category");
  const urlColor = searchParams.get("color");
  const urlMaterial = searchParams.get("material");
  const urlSort = ["default", "new", "popular", "price-asc", "price-desc", "name"].includes(
    searchParams.get("sort") ?? "",
  ) ? (searchParams.get("sort") as string) : "default";
  const urlSearch = searchParams.get("q") ?? "";
  const urlPriceMin = searchParams.get("priceMin") ?? "";
  const urlPriceMax = searchParams.get("priceMax") ?? "";
  const urlPage = parseInt(searchParams.get("page") ?? "1", 10) || 1;

  const [selectedMarketplace, setSelectedMarketplace] = useState<string | null>(urlMarketplace);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(urlCategory);
  const [selectedColor, setSelectedColor] = useState<string | null>(urlColor);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(urlMaterial);
  const [page, setPage] = useState(urlPage);

  // ― Search state with debounce ―
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [searchQuery, setSearchQuery] = useState(urlSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ― Sort & price filter state — read sort from URL ―
  const [sortOption, setSortOption] = useState(urlSort);
  const [priceMin, setPriceMin] = useState(urlPriceMin);
  const [priceMax, setPriceMax] = useState(urlPriceMax);
  const [showFilters, setShowFilters] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const colorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) {
        setColorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Reset page to 1 when any filter changes
  const prevFilterKey = useRef("");
  useEffect(() => {
    const key = `${selectedMarketplace}-${selectedCategory}-${selectedColor}-${selectedMaterial}-${searchQuery}-${priceMin}-${priceMax}-${sortOption}`;
    if (prevFilterKey.current !== "" && prevFilterKey.current !== key) {
      setPage(1);
    }
    prevFilterKey.current = key;
  }, [selectedMarketplace, selectedCategory, selectedColor, selectedMaterial, searchQuery, priceMin, priceMax, sortOption]);

  // Sync filter state to URL
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (selectedMarketplace) params.set("marketplace", selectedMarketplace);
      if (selectedCategory) params.set("category", selectedCategory);
      if (selectedColor) params.set("color", selectedColor);
      if (selectedMaterial) params.set("material", selectedMaterial);
      if (sortOption && sortOption !== "default") params.set("sort", sortOption);
      if (searchInput) params.set("q", searchInput);
      if (priceMin) params.set("priceMin", priceMin);
      if (priceMax) params.set("priceMax", priceMax);
      if (page > 1) params.set("page", String(page));
      const qs = params.toString();
      const newUrl = qs ? pathname + "?" + qs : pathname;
      router.replace(newUrl, { scroll: false });
    }, 50);
    return () => { if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current); };
  }, [selectedMarketplace, selectedCategory, selectedColor, selectedMaterial, sortOption, searchInput, priceMin, priceMax, page]);

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
    setSelectedCategory(urlCategory ?? null);
    setPage(1);
  }, [urlCategory]);

  // ― Extract unique colors (normalized) and materials from products ―
  const colorOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.colorName) {
        const basic = getBasicColorName(p.colorName);
        if (basic) set.add(basic);
      }
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

  // ― Filter pipeline: marketplace → category → color → material → search → price → sort ―
  const filtered = useMemo(() => {
    let result = selectedCategory
      ? products.filter((p) => p.category === selectedCategory)
      : [...products];

    // Marketplace filter
    if (selectedMarketplace === "wb") {
      result = result.filter((p) => p.wbArticle != null);
    } else if (selectedMarketplace === "ozon") {
      result = result.filter((p) => p.ozonArticle != null);
    }

    // Color filter
    if (selectedColor) {
      result = result.filter((p) => p.colorName && getBasicColorName(p.colorName) === selectedColor);
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
      case "popular":
        result.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
        break;
      case "new":
        result.sort((a, b) => {
          const dateA = a.wbCreatedAt ? new Date(a.wbCreatedAt).getTime() : -Infinity;
          const dateB = b.wbCreatedAt ? new Date(b.wbCreatedAt).getTime() : -Infinity;
          return dateB - dateA; // newest first, products without date at the end
        });
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
  }, [products, selectedMarketplace, selectedCategory, selectedColor, selectedMaterial, searchQuery, priceMin, priceMax, sortOption, catalogOrder]);

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

  const hasActiveFilter = selectedMarketplace || selectedCategory || selectedColor || selectedMaterial;
  const clearFilters = () => {
    setSelectedMarketplace(null);
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
                <option value="popular">По популярности</option>
                <option value="new">По новинкам</option>
                <option value="price-asc">По цене: возрастание</option>
                <option value="price-desc">По цене: убывание</option>
                <option value="name">По названию</option>
              </select>
            </div>

            {colorOptions.length > 0 && (
              <div className={styles.colorPicker} ref={colorRef}>
                <button
                  className={styles.colorPickerTrigger}
                  onClick={() => setColorOpen((p) => !p)}
                >
                  <span
                    className={styles.colorPickerDot}
                    style={{
                      backgroundColor: selectedColor
                        ? resolveColor(selectedColor)
                        : "transparent",
                    }}
                  />
                  <span>{selectedColor || "Цвет"}</span>
                </button>
                {colorOpen && (
                  <div className={styles.colorPickerMenu}>
                    {!selectedColor && (
                      <div className={styles.colorPickerArrow} />
                    )}
                    <button
                      className={`${styles.colorPickerOption} ${!selectedColor ? styles.colorPickerOptionActive : ""}`}
                      onClick={() => {
                        setSelectedColor(null);
                        setColorOpen(false);
                      }}
                    >
                      <span
                        className={styles.colorPickerDot}
                        style={{
                          backgroundColor: "transparent",
                          border: "1px dashed var(--border)",
                        }}
                      />
                      Цвет
                    </button>
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        className={`${styles.colorPickerOption} ${selectedColor === color ? styles.colorPickerOptionActive : ""}`}
                        onClick={() => {
                          setSelectedColor(color);
                          setColorOpen(false);
                        }}
                      >
                        <span
                          className={styles.colorPickerDot}
                          style={{
                            backgroundColor: resolveColor(color),
                          }}
                        />
                        {color}
                      </button>
                    ))}
                  </div>
                )}
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

        {/* Marketplace pills */}
        <div className={styles.filterSection}>
          <div className={styles.filterRow}>
            <button
              className={`${styles.filterPill} ${selectedMarketplace === null ? styles.pillActive : ""}`}
              onClick={() => { setSelectedMarketplace(null); setPage(1); }}
            >
              Все площадки
            </button>
            <button
              className={`${styles.filterPill} ${selectedMarketplace === "wb" ? styles.pillActive : ""}`}
              onClick={() => { setSelectedMarketplace("wb"); setPage(1); }}
            >
              Wildberries
            </button>
            <button
              className={`${styles.filterPill} ${selectedMarketplace === "ozon" ? styles.pillActive : ""}`}
              onClick={() => { setSelectedMarketplace("ozon"); setPage(1); }}
            >
              Ozon
            </button>
          </div>
        </div>

        {/* Active filter strip */}
        {hasActiveFilter && (
          <div className={styles.activeFilters}>
            {selectedMarketplace && (
              <span className={styles.activePill}>
                {selectedMarketplace === "wb" ? "Wildberries" : "Ozon"}
                <button className={styles.activeRemove} onClick={() => setSelectedMarketplace(null)}>×</button>
              </span>
            )}
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

        {/* Loading state */}
        {!loaded ? (
          <div className={styles.loadingGrid}>
            <div className={styles.spinner} />
          </div>
        ) : paginated.length > 0 ? (
          /* Product grid */
          <div className={styles.productGrid}>
            {paginated.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 4} />
            ))}
          </div>
        ) : (
          /* Empty state */
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

export default function CatalogPage(props: CatalogContentProps) {
  return (
    <Suspense fallback={<div className={styles.loading}>Загрузка...</div>}>
      <CatalogContent {...props} />
    </Suspense>
  );
}
