"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./models.module.css";
import { CATEGORIES } from "@/lib/categories";
import AdminButton from "@/components/admin/admin-button";
import AdminPageHeader from "@/components/admin/admin-page-header";

interface Variant {
  id: string;
  name: string;
  price: number;
  category: string;
  wbArticle?: number;
  ozonArticle?: number;
  colorName?: string;
  image?: string;
}

interface Model {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  composition: string | null;
  dimensions: string | null;
  sortOrder: number;
  variants: Variant[];
}

export default function AdminModelsPage() {
  const router = useRouter();
  const [models, setModels] = useState<Model[]>([]);
  const [unassigned, setUnassigned] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);

  // Drag reorder
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const dragNode = useRef<HTMLElement | null>(null);

  useEffect(() => {
    fetch("/api/admin/models?includeUnassigned=true")
      .then((res) => {
        if (res.status === 401) router.push("/admin/login");
        return res.json();
      })
      .then((data) => {
        setModels(data.items || []);
        setUnassigned(data.unassigned || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  // ─── Stats ───

  const totalVariants = models.reduce((s, m) => s + m.variants.length, 0);
  const totalUnassigned = unassigned.length;
  const withWb = models.filter((m) => m.variants.some((v) => v.wbArticle != null && v.wbArticle > 0)).length;
  const withOzon = models.filter((m) => m.variants.some((v) => v.ozonArticle != null)).length;

  // ─── Category helpers ───

  const catInfo = (slug: string) => CATEGORIES.find((c) => c.slug === slug);

  // ─── Drag & drop ───

  function handleDragStart(e: React.DragEvent, idx: number) {
    dragNode.current = e.currentTarget as HTMLElement;
    dragNode.current.classList.add(styles.dragging);
    setDragIndex(idx);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) return;
    const items = [...models];
    const [moved] = items.splice(dragIndex, 1);
    items.splice(idx, 0, moved);
    setModels(items);
    setDragIndex(idx);
    setDirty(true);
  }

  function handleDragEnd() {
    if (dragNode.current) dragNode.current.classList.remove(styles.dragging);
    setDragIndex(null);
  }

  async function saveOrder() {
    setSaving(true);
    setSaved(false);
    try {
      const reorder = models.map((m, i) => ({ id: m.id, sortOrder: i }));
      const res = await fetch("/api/admin/models", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reorder }),
      });
      if (res.ok) {
        setDirty(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  // ─── Helpers ───

  function formatPrice(n?: number) {
    return n ? n.toLocaleString("ru-RU") + " ₽" : "—";
  }

  function heroImage(model: Model): string | undefined {
    return model.variants.find((v) => v.image)?.image || undefined;
  }

  function catColor(slug: string): string {
    const map: Record<string, string> = {
      crossbody: "#8B6F5C",
      "na-plecho": "#5B7B6F",
      baguette: "#7B5B8B",
      tote: "#8B7B5B",
      saddle: "#8B5B5B",
      backpack: "#5B6F8B",
    };
    return map[slug] || "#999";
  }

  // ─── Render ───

  if (loading) {
    return <div className={styles.page}><p className={styles.loading}>Загрузка...</p></div>;
  }

  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Модели"
        subtitle={`${models.length} моделей, ${totalVariants} вариантов${totalUnassigned > 0 ? ` · ${totalUnassigned} без модели` : ""}${dirty ? " · несохранённые изменения" : ""}`}
      >
        <span className={styles.stat}>
          <span className={styles.statDot} style={{ background: "#8B6F5C" }} />
          На WB: {withWb}
        </span>
        <span className={styles.stat}>
          <span className={styles.statDot} style={{ background: "#005BFF" }} />
          На Ozon: {withOzon}
        </span>
        {dirty && (
          <AdminButton variant="primary" onClick={saveOrder} loading={saving} disabled={saving}>
            Сохранить порядок
          </AdminButton>
        )}
        {saved && <span className={styles.savedBadge}>Сохранено</span>}
        <AdminButton variant="secondary" href="/admin/products">
          Товары
        </AdminButton>
        <AdminButton variant="primary" href="/admin/models/new">
          + Новая модель
        </AdminButton>
      </AdminPageHeader>

      {dirty && (
        <p className={styles.reorderHint}>
          Перетащите карточки в нужном порядке и нажмите «Сохранить порядок»
        </p>
      )}

      {models.length === 0 && unassigned.length === 0 ? (
        <div className={styles.empty}>
          <p>Моделей пока нет</p>
          <AdminButton variant="primary" href="/admin/models/new">
            Создать первую модель
          </AdminButton>
        </div>
      ) : models.length === 0 ? (
        <p className={styles.empty}>Нет моделей</p>
      ) : (
        <>
          {/* ─── Gallery grid ─── */}
          <div className={styles.galleryGrid}>
            {models.map((model, idx) => {
              const hero = heroImage(model);
              const info = catInfo(model.category);

              return (
                <div
                  key={model.id}
                  className={`${styles.galleryCard} ${dragIndex === idx ? styles.galleryCardDrag : ""}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                >
                  {/* Drag handle */}
                  <span className={styles.galleryDragHandle} aria-label="Перетащить">
                    ⋮⋮
                  </span>

                  {/* Hero image */}
                  <Link href={`/admin/models/${model.id}`} className={styles.galleryHero}>
                    {hero ? (
                      <img src={hero} alt={model.name} className={styles.galleryHeroImg} />
                    ) : (
                      <div className={styles.galleryHeroPlaceholder}>
                        <span>Нет фото</span>
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className={styles.galleryInfo}>
                    <Link href={`/admin/models/${model.id}`} className={styles.galleryName}>
                      {model.name}
                    </Link>
                    <div className={styles.galleryMeta}>
                      <span
                        className={styles.galleryCat}
                        style={{ borderColor: catColor(model.category) }}
                      >
                        {info?.name || model.category}
                      </span>
                      {model.dimensions && (
                        <span className={styles.galleryDims}>{model.dimensions}</span>
                      )}
                    </div>
                    {model.composition && (
                      <span className={styles.galleryMaterial}>{model.composition}</span>
                    )}
                  </div>

                  {/* Variant strip */}
                  {model.variants.length > 0 && (
                    <div className={styles.galleryVariants}>
                      <div className={styles.galleryVariantStrip}>
                        {model.variants.map((v) => (
                          <Link
                            key={v.id}
                            href={`/admin/products/${v.id}`}
                            className={styles.galleryVariant}
                            title={`${v.colorName || v.name} · ${formatPrice(v.price)}`}
                          >
                            {v.image ? (
                              <img src={v.image} alt="" className={styles.galleryVariantImg} />
                            ) : (
                              <div className={styles.galleryVariantPlaceholder} />
                            )}
                          </Link>
                        ))}
                      </div>
                      <div className={styles.galleryVariantCount}>
                        {model.variants.length} {model.variants.length === 1 ? "цвет" : "цвета"}
                      </div>
                    </div>
                  )}

                  {/* Footer badges */}
                  <div className={styles.galleryFooter}>
                    {model.variants.some((v) => v.wbArticle) && (
                      <span className={styles.galleryBadge}>WB</span>
                    )}
                    {model.variants.some((v) => v.ozonArticle) && (
                      <span className={`${styles.galleryBadge} ${styles.galleryBadgeOzon}`}>Ozon</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ─── Unassigned products ─── */}
      {unassigned.length > 0 && (
        <div className={styles.unassignedSection}>
          <h2 className={styles.sectionTitle}>
            Товары без модели
            <span className={styles.countBadge}>{unassigned.length}</span>
          </h2>
          <p className={styles.unassignedHint}>
            Эти товары ещё не привязаны к моделям. Вы можете{" "}
            <Link href="/admin/models/new">создать новую модель</Link> или
            отредактировать существующую, чтобы добавить их.
          </p>

          {/* Grouped by category */}
          {CATEGORIES.map((cat) => {
            const items = unassigned.filter((p) => p.category === cat.slug);
            if (items.length === 0) return null;
            return (
              <section key={cat.slug} className={styles.categorySection}>
                <h3 className={styles.categoryTitle}>
                  {cat.name}
                  <span className={styles.countBadge}>{items.length}</span>
                </h3>
                <div className={styles.unassignedGrid}>
                  {items.map((p) => (
                    <div key={p.id} className={styles.unassignedCard}>
                      {p.image && (
                        <img src={p.image} alt="" className={styles.unassignedImg} />
                      )}
                      <div className={styles.unassignedInfo}>
                        <Link href={`/admin/products/${p.id}`} className={styles.unassignedName}>
                          {p.name}
                        </Link>
                        <div className={styles.unassignedMeta}>
                          <span>{formatPrice(p.price)}</span>
                          {p.colorName && <span> · {p.colorName}</span>}
                        </div>
                        <div className={styles.unassignedArticles}>
                          {p.wbArticle && <span>WB {p.wbArticle}</span>}
                          {p.ozonArticle && <span>Ozon {p.ozonArticle}</span>}
                        </div>
                      </div>
                      <Link
                        href={`/admin/products/${p.id}`}
                        className={styles.unassignedEditBtn}
                        title="Редактировать товар"
                      >
                        ✎
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
