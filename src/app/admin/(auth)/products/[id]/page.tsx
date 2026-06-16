"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./editor.module.css";

interface ProductForm {
  name: string;
  price: string;
  originalPrice: string;
  category: string;
  description: string;
  images: string[];
  wbArticle: string;
  ozonArticle: string;
  rating: string;
  reviewsCount: string;
}

const CATEGORIES = [
  { slug: "shoulder", name: "Shoulder" },
  { slug: "tote", name: "Tote" },
  { slug: "mini", name: "Мини" },
  { slug: "backpack", name: "Рюкзаки" },
  { slug: "baguette", name: "Багет" },
  { slug: "saddle", name: "Седло" },
  { slug: "evening", name: "Вечерние" },
];

const emptyForm: ProductForm = {
  name: "",
  price: "",
  originalPrice: "",
  category: "shoulder",
  description: "",
  images: [],
  wbArticle: "",
  ozonArticle: "",
  rating: "",
  reviewsCount: "",
};

export default function ProductEditorPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === "new";

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load product data for editing
  useEffect(() => {
    if (isNew) return;

    fetch(`/api/admin/products/${params.id}`)
      .then((res) => {
        if (res.status === 401) router.push("/admin/login");
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setForm({
          name: data.name || "",
          price: String(data.price || ""),
          originalPrice: String(data.originalPrice || ""),
          category: data.category || "shoulder",
          description: data.description || "",
          images: data.images?.length ? data.images : data.image ? [data.image] : [],
          wbArticle: String(data.wbArticle || ""),
          ozonArticle: String(data.ozonArticle || ""),
          rating: data.rating ? String(data.rating) : "",
          reviewsCount: data.reviewsCount ? String(data.reviewsCount) : "",
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Не удалось загрузить товар");
        setLoading(false);
      });
  }, [isNew, params.id, router]);

  function updateField(field: keyof ProductForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  /* ——— Image management ——— */

  function removeImage(index: number) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  function addImageUrl(url: string) {
    if (!url.trim()) return;
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, url.trim()],
    }));
    setUrlInputValue("");
    setShowUrlInput(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const body = new FormData();
      body.append("file", file);

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки файла");
    } finally {
      setUploading(false);
      // Reset file input so same file can be re-selected
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
      wbArticle: form.wbArticle ? Number(form.wbArticle) : undefined,
      ozonArticle: form.ozonArticle ? Number(form.ozonArticle) : undefined,
      rating: form.rating ? Number(form.rating) : undefined,
      reviewsCount: form.reviewsCount ? Number(form.reviewsCount) : undefined,
    };

    const method = isNew ? "POST" : "PUT";
    const url = isNew ? "/api/admin/products" : `/api/admin/products/${params.id}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/products");
      } else {
        const data = await res.json();
        setError(data.error || "Ошибка сохранения");
      }
    } catch {
      setError("Ошибка соединения");
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
        <h1 className={styles.title}>
          {isNew ? "Новый товар" : "Редактировать товар"}
        </h1>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.grid}>
          {/* Left column — fields */}
          <div className={styles.mainFields}>
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

          {/* Right column — images */}
          <div className={styles.imageCol}>
            <label className={styles.label}>Фотографии</label>

            {/* Image list */}
            <div className={styles.imageList}>
              {form.images.length === 0 && (
                <p className={styles.imageEmpty}>
                  Нет фотографий. Загрузите или вставьте URL.
                </p>
              )}

              {form.images.map((url, index) => (
                <div key={index} className={styles.imageItem}>
                  <div className={styles.imagePreviewWrap}>
                    {index === 0 && (
                      <span className={styles.imageMainBadge}>Главная</span>
                    )}
                    <img
                      src={url}
                      alt={`Фото ${index + 1}`}
                      className={styles.imagePreview}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.border = "2px solid #e74c3c";
                      }}
                    />
                  </div>
                  <div className={styles.imageMeta}>
                    <span className={styles.imageUrl}>{url}</span>
                    <button
                      type="button"
                      className={styles.imageRemoveBtn}
                      onClick={() => removeImage(index)}
                      title="Удалить фото"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload controls */}
            <div className={styles.imageActions}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className={styles.fileInput}
                onChange={handleFileUpload}
                hidden
              />
              <button
                type="button"
                className={styles.imageBtn}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Загрузка..." : "📷 Загрузить фото"}
              </button>

              <button
                type="button"
                className={styles.imageBtn}
                onClick={() => setShowUrlInput(!showUrlInput)}
              >
                🔗 Вставить URL
              </button>
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
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => router.push("/admin/products")}
          >
            Отмена
          </button>
          <button
            type="submit"
            className={styles.saveBtn}
            disabled={saving || !form.name}
          >
            {saving ? "Сохранение..." : isNew ? "Создать" : "Сохранить"}
          </button>
        </div>
      </form>
    </div>
  );
}
