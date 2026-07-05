"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import AdminButton from "@/components/admin/admin-button";
import { MARKETPLACE_URLS } from "@/lib/marketplaces";
import styles from "./editor.module.css";

interface Variant {
  id: string;
  slug: string;
  name: string;
  price: number;
  wbArticle: number;
  ozonArticle?: number;
  wbStock?: number;
  ozonStock?: number;
  colorName?: string;
  composition?: string;
  image?: string;
  images?: string[];
}

interface ModelData {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  composition: string | null;
  dimensions: string | null;
  image: string;
  variants: Variant[];
}

const CATEGORIES = [
  { slug: "crossbody", name: "Кросс-боди" },
  { slug: "na-plecho", name: "На плечо" },
  { slug: "baguette", name: "Багет" },
  { slug: "tote", name: "Тоут" },
  { slug: "saddle", name: "Седло" },
  { slug: "backpack", name: "Рюкзак" },
];

export default function ModelEditorPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === "new";

  const [model, setModel] = useState<ModelData | null>(null);
  const [allProducts, setAllProducts] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showLinker, setShowLinker] = useState(false);
  const [selectedVariantIds, setSelectedVariantIds] = useState<Set<string>>(new Set());

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("crossbody");
  const [description, setDescription] = useState("");
  const [composition, setComposition] = useState("");
  const [dimensions, setDimensions] = useState("");

  useEffect(() => {
    if (isNew) return;

    fetch(`/api/admin/models/${params.id}`)
      .then((res) => {
        if (res.status === 401) router.push("/admin/login");
        return res.json();
      })
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setModel(data);
        setName(data.name || "");
        setSlug(data.slug || "");
        setCategory(data.category || "crossbody");
        setDescription(data.description || "");
        setComposition(data.composition || "");
        setDimensions(data.dimensions || "");
        setLoading(false);
      })
      .catch(() => {
        setError("Не удалось загрузить модель");
        setLoading(false);
      });
  }, [isNew, params.id, router]);

  // Load all unlinked products for the linker
  async function openLinker() {
    setShowLinker(true);
    setSelectedVariantIds(new Set(
      model?.variants.map((v) => v.id) || []
    ));

    try {
      const res = await fetch("/api/admin/products?page=1&limit=200");
      const data = await res.json();
      const all: Variant[] = data.items || [];
      setAllProducts(all);
    } catch {
      // ignore
    }
  }

  function toggleVariant(id: string) {
    setSelectedVariantIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function saveVariants() {
    if (!model) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/models/${model.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantIds: Array.from(selectedVariantIds) }),
      });

      if (res.ok) {
        // Reload
        const reload = await fetch(`/api/admin/models/${model.id}`);
        const data = await reload.json();
        setModel(data);
        setShowLinker(false);
      } else {
        const data = await res.json();
        setError(data.error || "Ошибка сохранения вариантов");
      }
    } catch {
      setError("Ошибка соединения");
    } finally {
      setSaving(false);
    }
  }

  async function unlinkVariant(variantId: string) {
    if (!model) return;
    if (!confirm("Отвязать вариант от модели?")) return;

    try {
      await fetch(`/api/admin/models/${model.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unlink", variantId }),
      });

      const reload = await fetch(`/api/admin/models/${model.id}`);
      const data = await reload.json();
      setModel(data);
    } catch {
      setError("Ошибка");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-zа-я0-9]+/g, "-").replace(/-+$/, ""),
      category,
      description,
      composition: composition || null,
      dimensions: dimensions || null,
    };

    try {
      const method = isNew ? "POST" : "PUT";
      const url = isNew ? "/api/admin/models" : `/api/admin/models/${params.id}`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/models");
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

  function formatPrice(n: number) {
    return n.toLocaleString("ru-RU") + " ₽";
  }

  if (loading) {
    return <div className={styles.page}><p className={styles.loading}>Загрузка...</p></div>;
  }

  if (error && !isNew && !model) {
    return <div className={styles.page}><p className={styles.error}>{error}</p></div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {isNew ? "Новая модель" : `Редактировать: ${model?.name}`}
        </h1>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.grid}>
          {/* Left — fields */}
          <div className={styles.mainFields}>
            <label className={styles.label}>
              Название модели *
              <input
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Birkin 13×20×8"
                required
              />
            </label>

            <label className={styles.label}>
              Slug
              <input
                type="text"
                className={styles.input}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="birkin-13x20"
              />
            </label>

            <label className={styles.label}>
              Категория
              <select
                className={styles.select}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </label>

            <label className={styles.label}>
              Описание
              <textarea
                className={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Общее описание модели..."
              />
            </label>

            <div className={styles.row}>
              <label className={styles.label}>
                Материал
                <input
                  type="text"
                  className={styles.input}
                  value={composition}
                  onChange={(e) => setComposition(e.target.value)}
                  placeholder="Натуральная кожа"
                />
              </label>
              <label className={styles.label}>
                Размеры
                <input
                  type="text"
                  className={styles.input}
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="13×20×8 см"
                />
              </label>
            </div>
          </div>

          {/* Right — preview placeholder */}
          <div className={styles.previewCol}>
            <label className={styles.label}>Превью</label>
            <div className={styles.previewBox}>
              <span className={styles.previewName}>{name || "Название модели"}</span>
              {dimensions && <span className={styles.previewDims}>{dimensions}</span>}
              {composition && <span className={styles.previewMat}>{composition}</span>}
              {category && (
                <span className={styles.previewCat}>
                  {CATEGORIES.find((c) => c.slug === category)?.name || category}
                </span>
              )}
            </div>
          </div>
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.actions}>
          <AdminButton variant="ghost" onClick={() => router.push("/admin/models")}>
            Отмена
          </AdminButton>
          <AdminButton variant="primary" type="submit" disabled={saving || !name} loading={saving}>
            {isNew ? "Создать" : "Сохранить"}
          </AdminButton>
        </div>
      </form>

      {/* ─── Variants section (only for existing models) ─── */}
      {model && !isNew && (
        <section className={styles.variantsSection}>
          <div className={styles.variantsHeader}>
            <h2 className={styles.variantsTitle}>
              Варианты (цвета)
              <span className={styles.variantsCount}>{model.variants.length}</span>
            </h2>
            <AdminButton variant="secondary" size="sm" onClick={openLinker}>
              + Добавить / убрать варианты
            </AdminButton>
          </div>

          {model.variants.length === 0 ? (
            <p className={styles.variantsEmpty}>Нет привязанных вариантов</p>
          ) : (
            <div className={styles.variantsTable}>
              <div className={styles.variantsTableHeader}>
                <span className={styles.vthColor}>Цвет</span>
                <span className={styles.vthName}>Название</span>
                <span className={styles.vthPrice}>Цена</span>
                <span className={styles.vthWb}>WB</span>
                <span className={styles.vthOzon}>Ozon</span>
                <span className={styles.vthActions}></span>
              </div>

              {model.variants.map((v) => (
                <div key={v.id} className={styles.variantRow}>
                  <span className={styles.variantColor}>
                    {v.image && (
                      <img src={v.image} alt="" className={styles.variantThumb} />
                    )}
                    {v.colorName || "—"}
                  </span>
                  <span className={styles.variantName}>
                    <Link href={`/admin/products/${v.slug}`} className={styles.variantLink}>
                      {v.name}
                    </Link>
                  </span>
                  <span className={styles.variantPrice}>{formatPrice(v.price)}</span>
                  <span className={styles.variantWb}>
                    {v.wbArticle > 0 ? (
                      <>
                        <a href={MARKETPLACE_URLS.wbProduct(v.wbArticle)}
                           target="_blank" className={styles.articleLink}>
                          {v.wbArticle}
                        </a>
                        {v.wbStock !== undefined && (
                          <span className={v.wbStock > 0 ? styles.stockIn : styles.stockOut}>
                            {v.wbStock > 0 ? ` ${v.wbStock} шт` : ' нет'}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className={styles.missing}>—</span>
                    )}
                  </span>
                  <span className={styles.variantOzon}>
                    {v.ozonArticle ? (
                      <>
                        <a href={MARKETPLACE_URLS.ozonProduct(v.ozonArticle)}
                           target="_blank" className={styles.articleLink}>
                          {v.ozonArticle}
                        </a>
                        {v.ozonStock !== undefined && (
                          <span className={v.ozonStock > 0 ? styles.stockIn : styles.stockOut}>
                            {v.ozonStock > 0 ? ` ${v.ozonStock} шт` : ' нет'}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className={styles.missing}>—</span>
                    )}
                  </span>
                  <span className={styles.variantActions}>
                    <AdminButton variant="ghost" size="sm" onClick={() => unlinkVariant(v.id)} title="Отвязать от модели">
                      ✕
                    </AdminButton>
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ─── Linker modal ─── */}
          {showLinker && (
            <>
              <div className={styles.overlay} onClick={() => setShowLinker(false)} />
              <div className={styles.linkerModal}>
                <div className={styles.linkerHeader}>
                  <h3 className={styles.linkerTitle}>
                    Выберите товары для модели «{model.name}»
                  </h3>
                  <button
                    type="button"
                    className={styles.linkerClose}
                    onClick={() => setShowLinker(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className={styles.linkerList}>
                  {allProducts
                    .filter((p) => !p.wbArticle || true) // all products
                    .map((p) => {
                      const isSelected = selectedVariantIds.has(p.id);
                      const alreadyLinked = model.variants.some((v) => v.id === p.id);
                      return (
                        <label
                          key={p.id}
                          className={`${styles.linkerItem} ${isSelected ? styles.linkerItemActive : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleVariant(p.id)}
                            className={styles.linkerCheckbox}
                          />
                          {p.image && (
                            <img src={p.image} alt="" className={styles.linkerThumb} />
                          )}
                          <span className={styles.linkerName}>
                            {p.name}
                            {p.colorName && (
                              <span className={styles.linkerColor}>({p.colorName})</span>
                            )}
                          </span>
                          <span className={styles.linkerPrice}>
                            {formatPrice(p.price)}
                          </span>
                          <span className={styles.linkerBadges}>
                            {p.wbArticle > 0 && <span className={styles.linkerBadge}>WB</span>}
                            {p.ozonArticle && <span className={`${styles.linkerBadge} ${styles.linkerBadgeOzon}`}>Ozon</span>}
                          </span>
                        </label>
                      );
                    })}
                </div>

                <div className={styles.linkerFooter}>
                  <span className={styles.linkerCount}>
                    Выбрано: {selectedVariantIds.size}
                  </span>
                  <div className={styles.linkerActions}>
                    <AdminButton variant="ghost" onClick={() => setShowLinker(false)}>
                      Отмена
                    </AdminButton>
                    <AdminButton variant="primary" onClick={saveVariants} disabled={saving} loading={saving}>
                      Сохранить
                    </AdminButton>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
