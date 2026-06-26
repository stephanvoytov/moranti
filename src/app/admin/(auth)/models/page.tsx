"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./models.module.css";

interface Variant {
  id: string;
  name: string;
  price: number;
  wbArticle: number;
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
  variants: Variant[];
}

const CATEGORY_NAMES: Record<string, string> = {
  crossbody: "Кросс-боди",
  "na-plecho": "На плечо",
  baguette: "Багет",
  tote: "Тоут",
  saddle: "Седло",
  backpack: "Рюкзак",
};

const CATEGORY_ORDER = [
  "crossbody", "na-plecho", "baguette", "tote", "saddle", "backpack",
];

export default function AdminModelsPage() {
  const router = useRouter();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/models")
      .then((res) => {
        if (res.status === 401) router.push("/admin/login");
        return res.json();
      })
      .then((data) => {
        setModels(data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  // Group models by category
  const grouped = CATEGORY_ORDER.map((cat) => ({
    slug: cat,
    name: CATEGORY_NAMES[cat] || cat,
    models: models.filter((m) => m.category === cat),
  })).filter((g) => g.models.length > 0);

  const totalVariants = models.reduce((s, m) => s + m.variants.length, 0);
  const withWb = models.filter((m) => m.variants.some((v) => v.wbArticle > 0)).length;
  const withOzon = models.filter((m) => m.variants.some((v) => v.ozonArticle)).length;

  function formatPrice(n: number) {
    return n.toLocaleString("ru-RU") + " ₽";
  }

  if (loading) {
    return <div className={styles.page}><p className={styles.loading}>Загрузка...</p></div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Модели</h1>
          <p className={styles.subtitle}>
            {models.length} моделей, {totalVariants} вариантов
          </p>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.stat}>
            <span className={styles.statDot} style={{ background: "#8B6F5C" }} />
            На WB: {withWb}
          </span>
          <span className={styles.stat}>
            <span className={styles.statDot} style={{ background: "#005BFF" }} />
            На Ozon: {withOzon}
          </span>
          <Link href="/admin/products" className={styles.secondaryBtn}>
            Все товары
          </Link>
          <Link href="/admin/models/new" className={styles.addBtn}>
            + Новая модель
          </Link>
        </div>
      </header>

      {models.length === 0 ? (
        <div className={styles.empty}>
          <p>Моделей пока нет</p>
          <Link href="/admin/models/new" className={styles.addBtn}>
            Создать первую модель
          </Link>
        </div>
      ) : (
        <div className={styles.modelList}>
          {grouped.map((group) => (
            <section key={group.slug} className={styles.categorySection}>
              <h2 className={styles.categoryTitle}>
                {group.name}
                <span className={styles.categoryCount}>{group.models.length}</span>
              </h2>

              <div className={styles.modelCards}>
                {group.models.map((model) => {
                  const hasWb = model.variants.some((v) => v.wbArticle > 0);
                  const hasOzon = model.variants.some((v) => v.ozonArticle);

                  return (
                    <Link
                      key={model.id}
                      href={`/admin/models/${model.id}`}
                      className={styles.modelCard}
                    >
                      <div className={styles.modelCardHeader}>
                        <h3 className={styles.modelName}>
                          {model.name}
                          {model.dimensions && (
                            <span className={styles.modelDims}>{model.dimensions}</span>
                          )}
                        </h3>
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
    </div>
  );
}
