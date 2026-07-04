"use client";

import { useState, useEffect, FormEvent, useRef, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import ProductCard from "@/components/ui/product-card";
import AdminButton from "@/components/admin/admin-button";
import { useToast } from "@/lib/toast-context";
import styles from "./editor.module.css";

interface ProductForm {
  name: string;
  price: string;
  originalPrice: string;
  category: string;
  description: string;
  images: string[];
  sku: string;
  wbArticle: string;
  ozonArticle: string;
  rating: string;
  reviewsCount: string;
  colorName: string;
  composition: string;
  modelId: string;
}

interface ModelOption {
  id: string;
  name: string;
  category: string;
}

const CATEGORIES = [
  { slug: "crossbody", name: "Кросс-боди" },
  { slug: "na-plecho", name: "На плечо" },
  { slug: "baguette", name: "Багет" },
  { slug: "tote", name: "Тоут" },
  { slug: "saddle", name: "Седло" },
  { slug: "backpack", name: "Рюкзаки" },
];

const emptyForm: ProductForm = {
  name: "",
  price: "",
  originalPrice: "",
  category: "crossbody",
  description: "",
  images: [],
  sku: "",
  wbArticle: "",
  ozonArticle: "",
  rating: "",
  reviewsCount: "",
  colorName: "",
  composition: "",
  modelId: "",
};

export default function ProductEditorPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.slug === "new";

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState("");
  const [models, setModels] = useState<ModelOption[]>([]);
  const [imgDragIndex, setImgDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgDragNode = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const [dirty, setDirty] = useState(false);
  const [neighbors, setNeighbors] = useState<{ slug: string; name: string }[]>([]);

  // Real-time preview product object for ProductCard
  const previewProduct = useMemo(() => ({
    id: params.slug as string || "preview",
    slug: isNew ? "preview" : (params.slug as string),
    name: form.name || "Название товара",
    price: Number(form.price) || 0,
    originalPrice: Number(form.originalPrice) || Number(form.price) || 0,
    currency: "₽" as const,
    category: form.category,
    description: form.description || "",
    image: form.images[0] || "",
    images: form.images.length > 0 ? form.images : [""],
    marketplaces: [],
    wbArticle: Number(form.wbArticle) || 0,
    ozonArticle: form.ozonArticle ? Number(form.ozonArticle) : undefined,
      rating: form.rating ? Number(form.rating) : undefined,
      reviewsCount: form.reviewsCount ? Number(form.reviewsCount) : undefined,
    colorName: form.colorName || undefined,
      composition: form.composition || undefined,
    modelId: form.modelId || undefined,
    inStock: true,
    photoCount: form.images?.length || 1,
  }), [form, params.slug]);

  // Load product data for editing
  useEffect(() => {
    async function load() {
      // Load models list
      try {
        const modelsRes = await fetch("/api/admin/models");
        const modelsData = await modelsRes.json();
        setModels((modelsData.items || []).map((m: { id: string; name: string; category: string }) => ({
          id: m.id,
          name: m.name,
          category: m.category,
        })));
      } catch { /* ignore */ }

      if (isNew) return;

      try {
        const res = await fetch(`/api/admin/products/${params.slug}`);
        if (res.status === 401) { router.push("/admin/login"); return; }
        const data = await res.json();
        if (data.error) { setError(data.error); return; }
        setForm({
          name: data.name || "",
          price: String(data.price || ""),
          originalPrice: String(data.originalPrice || ""),
          category: data.category || "crossbody",
          description: data.description || "",
          images: data.images?.length ? data.images : data.image ? [data.image] : [],
          sku: data.sku || "",
          wbArticle: String(data.wbArticle || ""),
          ozonArticle: String(data.ozonArticle || ""),
          rating: data.rating ? String(data.rating) : "",
          reviewsCount: data.reviewsCount ? String(data.reviewsCount) : "",
          colorName: data.colorName || "",
          composition: data.composition || "",
          modelId: data.modelId || "",
        });
        setLoading(false);
      } catch {
        setError("Не удалось загрузить товар");
        setLoading(false);
      }
    }

    load();
  }, [isNew, params.slug, router]);

  // ─── Load neighbors (Prev/Next navigation) ───
  useEffect(() => {
    if (isNew) return;
    fetch("/api/admin/products?limit=999&fields=slug,name,category")
      .then((r) => r.json())
      .then((data) => {
        const items: { slug: string; name: string }[] =
          (data.items || data.products || []).map((p: { slug: string; name: string }) => ({
            slug: p.slug,
            name: p.name,
          }));
        setNeighbors(items);
      })
      .catch(() => {});
  }, [isNew]);

  // ─── Beforeunload on dirty ───
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function updateField(field: keyof ProductForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  }

  /* ——— Image management ——— */

  function removeImage(index: number) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setDirty(true);
  }

  function addImageUrl(url: string) {
    if (!url.trim()) return;
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, url.trim()],
    }));
    setUrlInputValue("");
    setShowUrlInput(false);
    setDirty(true);
  }

  function moveImage(from: number, to: number) {
    if (from === to) return;
    setForm((prev) => {
      const images = [...prev.images];
      const [moved] = images.splice(from, 1);
      images.splice(to, 0, moved);
      return { ...prev, images };
    });
    setDirty(true);
  }

  function handleImgDragStart(e: React.DragEvent, index: number) {
    imgDragNode.current = e.currentTarget as HTMLDivElement;
    imgDragNode.current.classList.add(styles.imgDragging);
    setImgDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }

  function handleImgDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.stopPropagation();
    if (imgDragIndex === null || imgDragIndex === index) return;
    moveImage(imgDragIndex, index);
    setImgDragIndex(index);
  }

  function handleImgDragEnd() {
    if (imgDragNode.current) {
      imgDragNode.current.classList.remove(styles.imgDragging);
    }
    setImgDragIndex(null);
  }

  function handleImgDrop(e: React.DragEvent) {
    e.preventDefault();
    setImgDragIndex(null);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      for (let i = 0; i < files.length; i++) {
        const body = new FormData();
        body.append("file", files[i]);

        const res = await fetch("/api/admin/upload", { method: "POST", body });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await res.json();
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, data.url],
        }));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки файла");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  /* ——— Submit ——— */

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload: Record<string, unknown> = {
      name: form.name,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      category: form.category,
      description: form.description,
      images: form.images,
      sku: form.sku || undefined,
      wbArticle: form.wbArticle ? Number(form.wbArticle) : undefined,
      ozonArticle: form.ozonArticle ? Number(form.ozonArticle) : undefined,
    rating: form.rating ? Number(form.rating) : undefined,
    reviewsCount: form.reviewsCount ? Number(form.reviewsCount) : undefined,
    colorName: form.colorName || undefined,
      composition: form.composition || undefined,
    photoCount: form.images?.length || 1,
    };

    const method = isNew ? "POST" : "PUT";
    const url = isNew ? "/api/admin/products" : `/api/admin/products/${params.slug}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setDirty(false);
        toast.success(isNew ? "Товар создан" : "Товар сохранён");
        router.push("/admin/products");
      } else {
        const data = await res.json();
        const msg = data.error || "Ошибка сохранения";
        setError(msg);
        toast.error(msg);
      }
    } catch {
      const msg = "Ошибка соединения";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  if (error && !form.name && !isNew) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>
            {isNew ? "Новый товар" : "Редактировать товар"}
          </h1>
          {!isNew && neighbors.length > 0 && (
            <div className={styles.navBtns}>
              {(() => {
                const idx = neighbors.findIndex((n) => n.slug === params.slug);
                const prev = idx > 0 ? neighbors[idx - 1] : null;
                const next = idx < neighbors.length - 1 ? neighbors[idx + 1] : null;
                return (
                  <>
                    <button
                      className={styles.navBtn}
                      disabled={!prev}
                      onClick={() => { if (prev) router.push(`/admin/products/${prev.slug}`); }}
                      title={prev?.name || "Нет предыдущего"}
                    >
                      ← {prev?.name?.slice(0, 24) || "—"}
                    </button>
                    <button
                      className={styles.navBtn}
                      disabled={!next}
                      onClick={() => { if (next) router.push(`/admin/products/${next.slug}`); }}
                      title={next?.name || "Нет следующего"}
                    >
                      {next?.name?.slice(0, 24) || "—"} →
                    </button>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.grid}>
          {/* Left column — fields */}
          <div className={styles.mainFields}>
            <h3 className={styles.sectionTitle}>Основное</h3>

            <label className={styles.label}>
              Название *
              <input
                type="text"
                className={styles.input}
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </label>

            <div className={styles.row}>
              <label className={styles.label}>
                Цена *
                <input
                  type="number"
                  className={styles.input}
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  min="1"
                  required
                />
              </label>
              <label className={styles.label}>
                Оригинал
                <input
                  type="number"
                  className={styles.input}
                  value={form.originalPrice}
                  onChange={(e) => updateField("originalPrice", e.target.value)}
                  min="0"
                />
              </label>
            </div>

            <label className={styles.label}>
              Категория
              <select
                className={styles.select}
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>

            {models.length > 0 && (
              <label className={styles.label}>
                Модель (семейство)
                <select
                  className={styles.select}
                  value={form.modelId}
                  onChange={(e) => updateField("modelId", e.target.value)}
                >
                  <option value="">— Не привязана —</option>
                  {models
                    .filter((m) => !form.category || m.category === form.category)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                </select>
              </label>
            )}

            <h3 className={styles.sectionTitle}>Описание и внешний вид</h3>

            <label className={styles.label}>
              Описание
              <textarea
                className={styles.textarea}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={4}
              />
            </label>

            <div className={styles.row}>
              <label className={styles.label}>
                Цвет
                <input
                  type="text"
                  className={styles.input}
                  value={form.colorName}
                  onChange={(e) => updateField("colorName", e.target.value)}
                  placeholder="Бежевый"
                />
              </label>
              <label className={styles.label}>
                Материал
                <input
                  type="text"
                  className={styles.input}
                  value={form.composition}
                  onChange={(e) => updateField("composition", e.target.value)}
                  placeholder="Натуральная кожа"
                />
              </label>
            </div>

            <h3 className={styles.sectionTitle}>Маркетплейсы</h3>

            <div className={styles.row}>
              <label className={styles.label}>
                Артикул WB
                <input
                  type="number"
                  className={styles.input}
                  value={form.wbArticle}
                  onChange={(e) => updateField("wbArticle", e.target.value)}
                  placeholder="969008238"
                />
              </label>
              <label className={styles.label}>
                Артикул Ozon
                <input
                  type="number"
                  className={styles.input}
                  value={form.ozonArticle}
                  onChange={(e) => updateField("ozonArticle", e.target.value)}
                  placeholder="..."
                />
              </label>
            </div>

            <label className={styles.label}>
              SKU (vendorCode / offer_id)
              <input
                type="text"
                className={styles.input}
                value={form.sku}
                onChange={(e) => updateField("sku", e.target.value)}
                placeholder="BalensaTaup"
              />
            </label>

            <h3 className={styles.sectionTitle}>Характеристики</h3>

            <div className={styles.row}>
              <label className={styles.label}>
                Рейтинг
                <input
                  type="number"
                  className={styles.input}
                  value={form.rating}
                  onChange={(e) => updateField("rating", e.target.value)}
                  min="0"
                  max="5"
                  step="0.1"
                />
              </label>
              <label className={styles.label}>
                Отзывов
                <input
                  type="number"
                  className={styles.input}
                  value={form.reviewsCount}
                  onChange={(e) => updateField("reviewsCount", e.target.value)}
                  min="0"
                />
              </label>
            </div>

            <p className={styles.hint}>
              Ссылки на маркетплейсы генерируются автоматически из артикулов.
            </p>
          </div>

          {/* Right column — preview + images */}
          <div className={styles.imageCol}>
            {/* ——— Превью карточки (как на витрине) ——— */}
            <div className={styles.previewSection}>
              <label className={styles.label}>Превью</label>
              <div className={styles.previewWrap}>
                <ProductCard product={previewProduct} priority />
              </div>
            </div>

            <label className={styles.label}>Фотографии</label>

            {/* Image grid — marketplace style */}
            {form.images.length === 0 && (
              <p className={styles.imageEmpty}>
                Нет фотографий. Загрузите или вставьте URL.
              </p>
            )}

            {form.images.length > 0 && (
              <div
                className={styles.imgGrid}
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={handleImgDrop}
              >
                {form.images.map((url, index) => (
                  <div
                    key={index}
                    className={`${styles.imgThumb} ${imgDragIndex === index ? styles.imgThumbDrag : ""}`}
                    draggable
                    onDragStart={(e) => handleImgDragStart(e, index)}
                    onDragOver={(e) => handleImgDragOver(e, index)}
                    onDragEnd={handleImgDragEnd}
                  >
                    {/* Drag handle — верхний левый угол, всегда виден */}
                    <div className={styles.imgDragHandle}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                        <circle cx="4" cy="2" r="1.2" />
                        <circle cx="8" cy="2" r="1.2" />
                        <circle cx="4" cy="6" r="1.2" />
                        <circle cx="8" cy="6" r="1.2" />
                        <circle cx="4" cy="10" r="1.2" />
                        <circle cx="8" cy="10" r="1.2" />
                      </svg>
                    </div>

                    {/* Remove — верхний правый угол, только при наведении */}
                    <button
                      type="button"
                      className={styles.imgRemoveBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      title="Удалить фото"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="2" y1="2" x2="10" y2="10" />
                        <line x1="10" y1="2" x2="2" y2="10" />
                      </svg>
                    </button>

                    {/* Main badge — нижний левый угол */}
                    {index === 0 && (
                      <span className={styles.imgMainBadge}>Главная</span>
                    )}

                    <img
                      src={url}
                      alt={`Фото ${index + 1}`}
                      className={styles.imgThumbImg}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.border = "2px solid #e74c3c";
                      }}
                    />
                  </div>
                ))}

                {/* Upload tile */}
                <div
                  className={styles.imgAddTile}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="10" y1="4" x2="10" y2="16" />
                    <line x1="4" y1="10" x2="16" y2="10" />
                  </svg>
                  <span>Загрузить</span>
                </div>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              className={styles.fileInput}
              onChange={handleFileUpload}
              hidden
            />

            {/* Upload controls */}
            <div className={styles.imageActions}>
              <button
                type="button"
                className={styles.imageActionBtn}
                onClick={() => setShowUrlInput(!showUrlInput)}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M7 1v12M1 7h12" />
                </svg>
                {showUrlInput ? "Закрыть" : "Вставить URL"}
              </button>

              {uploading && (
                <span className={styles.uploadStatus}>Загрузка...</span>
              )}
            </div>

            {/* URL input (toggled) */}
            {showUrlInput && (
              <div className={styles.urlInputRow}>
                <input
                  type="url"
                  className={styles.input}
                  value={urlInputValue}
                  onChange={(e) => setUrlInputValue(e.target.value)}
                  placeholder="https://..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addImageUrl(urlInputValue);
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.urlAddBtn}
                  onClick={() => addImageUrl(urlInputValue)}
                >
                  Добавить
                </button>
              </div>
            )}
          </div>
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.actions}>
          <AdminButton variant="ghost" onClick={() => router.push("/admin/products")}>
            Отмена
          </AdminButton>
          <AdminButton variant="primary" type="submit" disabled={saving || !form.name} loading={saving}>
            {isNew ? "Создать" : "Сохранить"}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
