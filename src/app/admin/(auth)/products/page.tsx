"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES, getCategoryName } from "@/lib/categories";
import AdminModal from "@/components/admin/admin-modal";
import AdminButton from "@/components/admin/admin-button";
import AdminPageHeader from "@/components/admin/admin-page-header";
import UpdatedBadge from "@/components/admin/updated-badge";
import { useToast } from "@/lib/toast-context";
import { formatPrice } from "@/lib/format";
import { MARKETPLACE_URLS, MARKETPLACE_FAVICONS } from "@/lib/marketplaces";
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
  wbStock?: number;
  ozonStock?: number;
  image?: string;
  ozonImage?: string;
  rating?: number;
  archivedAt?: string | null;
  updatedAt?: string;
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
  const modelsFetchedRef = useRef(false);

  // Sorting вЂ” РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ СЃРѕСЂС‚РёСЂСѓРµРј РїРѕ РЅР°Р»РёС‡РёСЋ РЅР° WB
  const [sortBy, setSortBy] = useState("wbStock");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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

  // Fetch on mount вЂ” Р»РµРіРёС‚РёРјРЅС‹Р№ РїР°С‚С‚РµСЂРЅ: Р·Р°РіСЂСѓР·РєР° СЃРїРёСЃРєР° РїСЂРё РјРѕРЅС‚РёСЂРѕРІР°РЅРёРё.
  // РџРµСЂРІС‹Р№ setState (setLoading) Р·РґРµСЃСЊ СЃРёРЅС…СЂРѕРЅРЅС‹Р№ РїРѕ РѕРїСЂРµРґРµР»РµРЅРёСЋ; React 19
  // Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё Р±Р°С‚С‡РёС‚ РїРѕРІС‚РѕСЂРЅС‹Рµ СЂРµРЅРґРµСЂС‹, РєР°СЃРєР°РґР° РЅРµС‚.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchProducts(1); }, [fetchProducts]);

  // в”Ђв”Ђв”Ђ Lightbox keyboard в”Ђв”Ђв”Ђ
  useEffect(() => {
    if (!lightboxImage) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxImage(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [lightboxImage]);

  // в”Ђв”Ђв”Ђ Bulk actions в”Ђв”Ђв”Ђ

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
        const labels = { archive: "РђСЂС…РёРІРёСЂРѕРІР°РЅРѕ", unarchive: "Р Р°Р·Р°СЂС…РёРІРёСЂРѕРІР°РЅРѕ", delete: "РЈРґР°Р»РµРЅРѕ", "assign-model": "РњРѕРґРµР»СЊ РЅР°Р·РЅР°С‡РµРЅР°" };
        toast.success(`${labels[action]} ${selectedIds.size} С‚РѕРІР°СЂРѕРІ`);
      } else {
        toast.error("РћС€РёР±РєР° РїСЂРё РІС‹РїРѕР»РЅРµРЅРёРё РѕРїРµСЂР°С†РёРё");
      }
    } catch {
      toast.error("РћС€РёР±РєР° СЃРѕРµРґРёРЅРµРЅРёСЏ");
    } finally {
      setBulkProcessing(false);
    }
  }

  // в”Ђв”Ђв”Ђ Assign model в”Ђв”Ђв”Ђ

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

  // в”Ђв”Ђв”Ђ Single delete в”Ђв”Ђв”Ђ

  async function handleDelete(id: string) {
    if (!confirm("РЈРґР°Р»РёС‚СЊ С‚РѕРІР°СЂ?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchProducts(pagination.page);
      toast.success("РўРѕРІР°СЂ СѓРґР°Р»С‘РЅ");
    } else {
      toast.error("РћС€РёР±РєР° РїСЂРё СѓРґР°Р»РµРЅРёРё");
    }
  }

  // в”Ђв”Ђв”Ђ Reorder mode в”Ђв”Ђв”Ђ

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

  // в”Ђв”Ђв”Ђ Helpers в”Ђв”Ђв”Ђ

  function toggleSort(field: string) {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  }

  // в”Ђв”Ђв”Ђ Render в”Ђв”Ђв”Ђ

  if (reorderMode) {
    return (
      <div className={styles.page}>
        <AdminPageHeader
          title="РџРѕСЂСЏРґРѕРє С‚РѕРІР°СЂРѕРІ"
          subtitle={`${allProducts.length} Р°РєС‚РёРІРЅС‹С… С‚РѕРІР°СЂРѕРІ`}
        >
          {orderSaved && <span className={styles.savedBadge}>РЎРѕС…СЂР°РЅРµРЅРѕ</span>}
          <AdminButton variant="primary" onClick={saveOrder} disabled={savingOrder} loading={savingOrder}>
            РЎРѕС…СЂР°РЅРёС‚СЊ РїРѕСЂСЏРґРѕРє
          </AdminButton>
          <AdminButton variant="ghost" onClick={exitReorderMode}>
            Р—Р°РєСЂС‹С‚СЊ
          </AdminButton>
        </AdminPageHeader>
        <p className={styles.reorderHint}>
          РџРµСЂРµС‚Р°С‰РёС‚Рµ С‚РѕРІР°СЂС‹ РІ РЅСѓР¶РЅРѕРј РїРѕСЂСЏРґРєРµ Рё РЅР°Р¶РјРёС‚Рµ В«РЎРѕС…СЂР°РЅРёС‚СЊ РїРѕСЂСЏРґРѕРєВ»
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
              <span className={styles.reorderHandle} aria-label="РџРµСЂРµС‚Р°С‰РёС‚СЊ">в‹®в‹®</span>
              <span className={styles.reorderNum}>{idx + 1}</span>
              {p.image && <img src={p.image} alt="" className={styles.reorderThumb} />}
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
      {/* в”Ђв”Ђв”Ђ Header в”Ђв”Ђв”Ђ */}
      <AdminPageHeader
        title="РўРѕРІР°СЂС‹"
        subtitle={`${pagination.total} С‚РѕРІР°СЂРѕРІ${selectedIds.size > 0 ? ` В· РІС‹Р±СЂР°РЅРѕ ${selectedIds.size}` : ""}`}
      >
        <AdminButton variant="secondary" onClick={enterReorderMode}>
          в‰Ў РЈРїСЂР°РІР»РµРЅРёРµ РїРѕСЂСЏРґРєРѕРј
        </AdminButton>
        <AdminButton variant="primary" href="/admin/products/new">
          + Р”РѕР±Р°РІРёС‚СЊ С‚РѕРІР°СЂ
        </AdminButton>
      </AdminPageHeader>

      {/* в”Ђв”Ђв”Ђ Status tabs в”Ђв”Ђв”Ђ */}
      <div className={styles.filters}>
        <div className={styles.statusTabs}>
          {(["active", "all", "archived"] as const).map((tab) => (
            <button
              key={tab}
              className={`${styles.statusTab} ${statusTab === tab ? styles.statusTabActive : ""}`}
              onClick={() => { setStatusTab(tab); setSelectedIds(new Set()); }}
            >
              {tab === "active" ? "РђРєС‚РёРІРЅС‹Рµ" : tab === "archived" ? "РђСЂС…РёРІРЅС‹Рµ" : "Р’СЃРµ"}
            </button>
          ))}
        </div>
        <div className={styles.mpPills}>
          {[
            { value: "", label: "Р›СЋР±РѕР№ РњРџ" },
            { value: "wb", label: "WB" },
            { value: "ozon", label: "Ozon" },
            { value: "both", label: "РћР±Р°" },
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
          placeholder="РџРѕРёСЃРє РїРѕ РЅР°Р·РІР°РЅРёСЋ РёР»Рё ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.categorySelect}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Р’СЃРµ РєР°С‚РµРіРѕСЂРёРё</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* в”Ђв”Ђв”Ђ Bulk toolbar в”Ђв”Ђв”Ђ */}
      {selectedIds.size > 0 && (
        <div className={styles.bulkToolbar}>
          <span className={styles.bulkCount}>
            Р’С‹Р±СЂР°РЅРѕ: {selectedIds.size}
          </span>
          <span className={styles.bulkSeparator} />
          <div className={styles.bulkActions}>
            {statusTab !== "archived" && (
              <AdminButton variant="secondary" size="sm" onClick={() => setConfirmAction("archive")} disabled={bulkProcessing}>
                РђСЂС…РёРІРёСЂРѕРІР°С‚СЊ
              </AdminButton>
            )}
            {statusTab === "archived" && (
              <AdminButton variant="secondary" size="sm" onClick={() => setConfirmAction("unarchive")} disabled={bulkProcessing}>
                Р Р°Р·Р°СЂС…РёРІРёСЂРѕРІР°С‚СЊ
              </AdminButton>
            )}
            <AdminButton variant="secondary" size="sm" onClick={() => { fetchModelsOnce(); setShowAssignModal(true); }} disabled={bulkProcessing}>
              РќР°Р·РЅР°С‡РёС‚СЊ РјРѕРґРµР»СЊ
            </AdminButton>
            <AdminButton variant="danger" size="sm" onClick={() => setConfirmAction("delete")} disabled={bulkProcessing}>
              РЈРґР°Р»РёС‚СЊ
            </AdminButton>
            {bulkProcessing && <span className={styles.bulkProgress}>РћР±СЂР°Р±РѕС‚РєР°...</span>}
          </div>
        </div>
      )}

      {/* в”Ђв”Ђв”Ђ Table в”Ђв”Ђв”Ђ */}
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
              <th className={styles.sortable} onClick={() => toggleSort("name")}>
                РќР°Р·РІР°РЅРёРµ{sortBy === "name" && <span className={styles.sortArrow}>{sortOrder === "asc" ? " в–І" : " в–ј"}</span>}
              </th>
              <th>РњРѕРґРµР»СЊ</th>
              <th className={styles.sortable} onClick={() => toggleSort("price")}>
                Р¦РµРЅР°{sortBy === "price" && <span className={styles.sortArrow}>{sortOrder === "asc" ? " в–І" : " в–ј"}</span>}
              </th>
              <th>РљР°С‚РµРіРѕСЂРёСЏ</th>
              <th>SKU</th>
              <th>
                <span className={styles.sortable} onClick={() => toggleSort("wbStock")}>
                  WB{sortBy === "wbStock" && <span className={styles.sortArrow}>{sortOrder === "asc" ? " в–І" : " в–ј"}</span>}
                </span>
                {" / "}
                <span className={styles.sortable} onClick={() => toggleSort("ozonStock")}>
                  Ozon{sortBy === "ozonStock" && <span className={styles.sortArrow}>{sortOrder === "asc" ? " в–І" : " в–ј"}</span>}
                </span>
              </th>
              <th>Р РµР№С‚РёРЅРі</th>
              <th className={styles.sortable} onClick={() => toggleSort("updatedAt")}>
                РћР±РЅРѕРІР»С‘РЅ{sortBy === "updatedAt" && <span className={styles.sortArrow}>{sortOrder === "asc" ? " в–І" : " в–ј"}</span>}
              </th>
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
                  <td><div className={`${styles.skeleton}`} style={{ height: 14, width: 90, borderRadius: 3 }} /></td>
                  <td><div style={{ width: 24, height: 24 }} /></td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr><td colSpan={11} className={styles.empty}>
                {statusTab === "archived" ? "РќРµС‚ Р°СЂС…РёРІРЅС‹С… С‚РѕРІР°СЂРѕРІ" : "РќРµС‚ С‚РѕРІР°СЂРѕРІ"}
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
                          favicon={MARKETPLACE_FAVICONS.wb}
                          hasArticle={!!p.wbArticle}
                          inStock={p.wbStock == null || p.wbStock > 0}
                          isArchived={isArchived}
                          onLightbox={() => setLightboxImage(p.image ?? null)}
                        />
                        <AdminProductPhoto
                          src={p.ozonImage}
                          favicon={MARKETPLACE_FAVICONS.ozon}
                          hasArticle={!!p.ozonArticle}
                          inStock={p.ozonStock == null || p.ozonStock > 0}
                          isArchived={isArchived}
                          onLightbox={() => setLightboxImage(p.ozonImage ?? null)}
                        />
                      </div>
                    </td>
                    <td>
                      <Link href={`/admin/products/${p.slug}`} className={styles.productName}>
                        {p.name}
                      </Link>
                      {isArchived && <span className={styles.archivedBadge}>РђСЂС…РёРІ</span>}
                    </td>
                    <td>
                      {p.model ? (
                        <Link href={`/admin/models/${p.model.id}`} className={styles.modelLink}>
                          {p.model.name}
                        </Link>
                      ) : (
                        <span className={styles.noModel}>вЂ”</span>
                      )}
                    </td>
                    <td className={styles.price}>{formatPrice(p.price)}</td>
                    <td><span className={styles.categoryBadge}>{getCategoryName(p.category)}</span></td>
                    <td className={styles.sku}>{p.sku || <span className={styles.muted}>вЂ”</span>}</td>
                    <td className={styles.mpCell}>
                      {p.wbArticle ? (
                        <div className={styles.mpRow}>
                          <a
                            href={MARKETPLACE_URLS.wbProduct(p.wbArticle)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.articleLink}
                          >
                            WB: {p.wbArticle} в†—
                          </a>
                          {p.wbStock != null && p.wbStock > 0 && (
                            <span className={styles.stockBadge}>{p.wbStock} С€С‚</span>
                          )}
                        </div>
                      ) : null}
                      {p.ozonArticle ? (
                        <div className={styles.mpRow}>
                          <a
                            href={MARKETPLACE_URLS.ozonProduct(p.ozonArticle)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.articleLink}
                          >
                            OZ: {p.ozonArticle} в†—
                          </a>
                          {p.ozonStock != null && p.ozonStock > 0 && (
                            <span className={styles.stockBadge}>{p.ozonStock} С€С‚</span>
                          )}
                        </div>
                      ) : null}
                      {!p.wbArticle && !p.ozonArticle && <span className={styles.muted}>вЂ”</span>}
                    </td>
                    <td>{p.rating ? `${p.rating.toFixed(1)} в…` : "вЂ”"}</td>
                    <td>
                      <UpdatedBadge iso={p.updatedAt} />
                    </td>
                    <td>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(p.id)}
                        title="РЈРґР°Р»РёС‚СЊ"
                      >
                        вњ•
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* в”Ђв”Ђв”Ђ Pagination в”Ђв”Ђв”Ђ */}
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

      {/* в”Ђв”Ђв”Ђ Confirmation modal в”Ђв”Ђв”Ђ */}
      <AdminModal
        open={confirmAction !== null}
        onClose={() => !bulkProcessing && setConfirmAction(null)}
        title={
          confirmAction === "archive" ? "РђСЂС…РёРІРёСЂРѕРІР°С‚СЊ С‚РѕРІР°СЂС‹" :
          confirmAction === "unarchive" ? "Р Р°Р·Р°СЂС…РёРІРёСЂРѕРІР°С‚СЊ С‚РѕРІР°СЂС‹" :
          "РЈРґР°Р»РёС‚СЊ С‚РѕРІР°СЂС‹"
        }
        actions={[
          { label: "РћС‚РјРµРЅР°", onClick: () => setConfirmAction(null), disabled: bulkProcessing },
          {
            label:
              confirmAction === "archive" ? "РђСЂС…РёРІРёСЂРѕРІР°С‚СЊ" :
              confirmAction === "unarchive" ? "Р Р°Р·Р°СЂС…РёРІРёСЂРѕРІР°С‚СЊ" :
              "РЈРґР°Р»РёС‚СЊ",
            onClick: () => executeBulk(confirmAction!),
            variant: confirmAction === "delete" ? "danger" : "primary",
            disabled: bulkProcessing,
          },
        ]}
      >
        <p>
          {confirmAction === "archive"
            ? `Р’С‹ СѓРІРµСЂРµРЅС‹, С‡С‚Рѕ С…РѕС‚РёС‚Рµ Р°СЂС…РёРІРёСЂРѕРІР°С‚СЊ ${selectedIds.size} С‚РѕРІР°СЂРѕРІ? РћРЅРё РёСЃС‡РµР·РЅСѓС‚ РёР· РєР°С‚Р°Р»РѕРіР°, РЅРѕ РґР°РЅРЅС‹Рµ СЃРѕС…СЂР°РЅСЏС‚СЃСЏ.`
            : confirmAction === "unarchive"
              ? `Р Р°Р·Р°СЂС…РёРІРёСЂРѕРІР°С‚СЊ ${selectedIds.size} С‚РѕРІР°СЂРѕРІ? РћРЅРё СЃРЅРѕРІР° РїРѕСЏРІСЏС‚СЃСЏ РІ РєР°С‚Р°Р»РѕРіРµ.`
              : `Р’С‹ СѓРІРµСЂРµРЅС‹, С‡С‚Рѕ С…РѕС‚РёС‚Рµ СѓРґР°Р»РёС‚СЊ ${selectedIds.size} С‚РѕРІР°СЂРѕРІ? Р­С‚Рѕ РґРµР№СЃС‚РІРёРµ РЅРµРѕР±СЂР°С‚РёРјРѕ.`}
        </p>
      </AdminModal>

      {/* в”Ђв”Ђв”Ђ Assign model modal в”Ђв”Ђв”Ђ */}
      <AdminModal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="РќР°Р·РЅР°С‡РёС‚СЊ РјРѕРґРµР»СЊ"
        actions={[
          { label: "РћС‚РјРµРЅР°", onClick: () => setShowAssignModal(false) },
          {
            label: "РќР°Р·РЅР°С‡РёС‚СЊ",
            onClick: () => executeBulk("assign-model", { modelId: assignModelId }),
            variant: "primary",
            disabled: !assignModelId || bulkProcessing,
          },
        ]}
      >
        <p style={{ marginBottom: 12 }}>
          Р’С‹Р±РµСЂРёС‚Рµ РјРѕРґРµР»СЊ РґР»СЏ {selectedIds.size} С‚РѕРІР°СЂРѕРІ:
        </p>
        <select
          className={styles.assignSelect}
          value={assignModelId}
          onChange={(e) => setAssignModelId(e.target.value)}
        >
          <option value="">вЂ” РІС‹Р±РµСЂРёС‚Рµ РјРѕРґРµР»СЊ вЂ”</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.category})
            </option>
          ))}
        </select>
      </AdminModal>

      {/* в”Ђв”Ђв”Ђ Lightbox в”Ђв”Ђв”Ђ */}
      {lightboxImage && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setLightboxImage(null)}
        >
          <img src={lightboxImage} alt="" className={styles.lightboxImage} />
          <button
            className={styles.lightboxClose}
            onClick={() => setLightboxImage(null)}
            aria-label="Р—Р°РєСЂС‹С‚СЊ"
          >
            вњ•
          </button>
        </div>
      )}
    </div>
  );
}

/* в”Ђв”Ђв”Ђ Р¤РѕС‚Рѕ С‚РѕРІР°СЂР° СЃ РѕР±СЂР°Р±РѕС‚РєРѕР№ РѕС€РёР±РѕРє Р·Р°РіСЂСѓР·РєРё в”Ђв”Ђв”Ђ */

function AdminProductPhoto({
  src,
  favicon,
  hasArticle,
  inStock,
  onLightbox,
  isArchived,
}: {
  src?: string | null;
  favicon: string;
  hasArticle: boolean;
  inStock: boolean;
  onLightbox: () => void;
  isArchived?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const show = hasArticle && src && !failed;
  const isPlaceholder = hasArticle && (!src || failed);
  const isOutOfStock = hasArticle && !inStock;

  return (
    <div className={`${styles.photoItem} ${isArchived ? styles.photoArchived : ""}`}>
      {show ? (
        <div className={`${styles.photoWrapper} ${isOutOfStock ? styles.photoOutOfStock : ""}`}>
          {!loaded && <div className={styles.photoLoading} />}
          <img
            src={src}
            alt=""
            className={styles.photoImg}
            onClick={onLightbox}
            onLoad={() => setLoaded(true)}
            onError={() => { setFailed(true); setLoaded(true); }}
            title="РЈРІРµР»РёС‡РёС‚СЊ"
          />
          {isArchived && <div className={styles.archiveCorner} title="Р’ Р°СЂС…РёРІРµ" />}
          <img src={favicon} alt="" className={styles.photoMpBadge} />
          {isOutOfStock && <div className={styles.photoOosOverlay}>Р—РђРљРћРќР§РР›РћРЎР¬</div>}
        </div>
      ) : isPlaceholder ? (
        <div className={styles.photoPlaceholder}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.4">
            <rect x="2" y="2" width="16" height="16" rx="2" />
            <circle cx="7" cy="7" r="2" />
            <path d="M2 14l4-4 3 3 3-4 6 6" />
          </svg>
          <span>{isArchived ? "Р°СЂС…РёРІ" : "РЅРµС‚ С„РѕС‚Рѕ"}</span>
        </div>
      ) : (
        <div className={styles.photoPlaceholder}>
          <span className={styles.photoMutedLabel}>вЂ”</span>
        </div>
      )}
    </div>
  );
}
