"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./models.module.css";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/categories";
import AdminButton from "@/components/admin/admin-button";
import AdminPageHeader from "@/components/admin/admin-page-header";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  wbArticle: number | null;
  ozonArticle: number | null;
  colorName?: string | null;
  image?: string | null;
}

interface Model {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  composition: string | null;
  dimensions: string | null;
  variants: Product[];
}

export default function AdminModelsPage() {
  const router = useRouter();
  const [models, setModels] = useState<Model[]>([]);
  const [unassigned, setUnassigned] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Group models by category
  const grouped = CATEGORY_ORDER.map((cat) => ({
    slug: cat,
    name: CATEGORIES.find((c) => c.slug === cat)?.namePlural || cat,
    models: models.filter((m) => m.category === cat),
  })).filter((g) => g.models.length > 0);

  // Group unassigned products by category
  const unassignedGrouped = CATEGORY_ORDER.map((cat) => ({
    slug: cat,
    name: CATEGORIES.find((c) => c.slug === cat)?.namePlural || cat,
    products: unassigned.filter((p) => p.category === cat),
  })).filter((g) => g.products.length > 0);

  const totalVariants = models.reduce((s, m) => s + m.variants.length, 0);
  const totalUnassigned = unassigned.length;
  const withWb = models.filter((m) => m.variants.some((v) => v.wbArticle != null && v.wbArticle > 0)).length;
  const withOzon = models.filter((m) => m.variants.some((v) => v.ozonArticle != null)).length;

  function formatPrice(n: number) {
    return n ? n.toLocaleString("ru-RU") + " ₽" : "—";
  }

  if (loading) {
    return <div className={styles.page}><p className={styles.loading}>Загрузка...</p></div>;
  }

  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Модели"
        subtitle={`${models.length} моделей, ${totalVariants} вариантов${totalUnassigned > 0 ? ` · ${totalUnassigned} без модели` : ""}`}
      >
        <span className={styles.stat}>
          <span className={styles.statDot} style={{ background: "#8B6F5C" }} />
          На WB: {withWb}
        </span>
        <span className={styles.stat}>
          <span className={styles.statDot} style={{ background: "#005BFF" }} />
          На Ozon: {withOzon}
        </span>
        <AdminButton variant="secondary" href="/admin/products">
          Все товары
        </AdminButton>
        <AdminButton variant="primary" href="/admin/models/new">
          + Новая модель
        </AdminButton>
      </AdminPageHeader>

      {models.length === 0 && unassigned.length === 0 ? (
        <div className={styles.empty}>
          <p>Моделей пока нет</p>
          <AdminButton variant="primary" href="/admin/models/new">
            Создать первую модель
          </AdminButton>
        </div>
      ) : (
        <>
          {models.length > 0 && (
            <div className={styles.modelList}>
              <h2 className={styles.sectionTitle}>Модели</h2>
              {grouped.map((group) => (
                <section key={group.slug} className={styles.categorySection}>
                  <h3 className={styles.categoryTitle}>
                    {group.name}
                    <span className={styles.categoryCount}>{group.models.length}</span>
                  </h3>

                  <div className={styles.modelCards}>
                    {group.models.map((model) => {
                      const hasWb = model.variants.some((v) => v.wbArticle != null && v.wbArticle > 0);
                      const hasOzon = model.variants.some((v) => v.ozonArticle != null);

                      return (
                        <Link
                          key={model.id}
                          href={`/admin/models/${model.id}`}
                          className={styles.modelCard}
                        >
                          <div className={styles.modelCardHeader}>
                            <h4 className={styles.modelName}>
                              {model.name}
                              {model.dimensions && (
                                <span className={styles.modelDims}>{model.dimensions}</span>
                              )}
                            </h4>
                            <div className={styles.modelMps}>
                              {hasWb && <span className={styles.mpBadge} title="На Wildberries">WB</span>}
                              {hasOzon && <span className={`${styles.mpBadge} ${styles.mpBadgeOzon}`} title="На Ozon">Ozon</span>}
                            </div>
                          </div>

                          {model.composition && (
                            <p className={styles.modelMaterial}>{model.composition}</p>
                          )}

                          <div className={styles.variantList}>
                            {model.variants.slice(0, 4).map((v) => (
                              <div key={v.id} className={styles.variantChip}>
                                {v.image && (
                                  <img src={v.image} alt="" className={styles.variantChipImg} />
                                )}
                                <span className={styles.variantChipName}>
                                  {v.colorName || v.name.split(" ").slice(-1)[0]}
                                </span>
                                <span className={styles.variantChipPrice}>
                                  {formatPrice(v.price)}
                                </span>
                              </div>
                            ))}
                            {model.variants.length > 4 && (
                              <div className={styles.variantMore}>
                                +{model.variants.length - 4}
                              </div>
                            )}
                          </div>

                          <div className={styles.modelCardFooter}>
                            <span className={styles.variantCount}>
                              {model.variants.length} {model.variants.length === 1 ? "вариант" : model.variants.length < 5 ? "варианта" : "вариантов"}
                            </span>
                            <span className={styles.modelArrow}>→</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}

          {unassigned.length > 0 && (
            <div className={styles.unassignedSection}>
              <h2 className={styles.sectionTitle}>
                Товары без модели
                <span className={styles.categoryCount}>{unassigned.length}</span>
              </h2>
              <p className={styles.unassignedHint}>
                Эти товары ещё не привязаны к моделям. Вы можете{" "}
                <Link href="/admin/models/new">создать новую модель</Link> или
                отредактировать существующую, чтобы добавить их.
              </p>

              {unassignedGrouped.map((group) => (
                <section key={group.slug} className={styles.categorySection}>
                  <h3 className={styles.categoryTitle}>
                    {group.name}
                    <span className={styles.categoryCount}>{group.products.length}</span>
                  </h3>

                  <div className={styles.unassignedGrid}>
                    {group.products.map((p) => (
                      <div key={p.id} className={styles.unassignedCard}>
                        {p.image && (
                          <img src={p.image} alt="" className={styles.unassignedImg} />
                        )}
                        <div className={styles.unassignedInfo}>
                          <div className={styles.unassignedName}>{p.name}</div>
                          <div className={styles.unassignedMeta}>
                            <span>{formatPrice(p.price)}</span>
                            {p.colorName && <span> · {p.colorName}</span>}
                          </div>
                          <div className={styles.unassignedArticles}>
                            {p.wbArticle && <span className={styles.unassignedArt}>WB {p.wbArticle}</span>}
                            {p.ozonArticle && <span className={styles.unassignedArt}>Ozon {p.ozonArticle}</span>}
                          </div>
                        </div>
                        <div className={styles.unassignedActions}>
                          <Link
                            href={`/admin/products/${p.id}`}
                            className={styles.unassignedEditBtn}
                            title="Редактировать товар"
                          >
                            ✎
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
