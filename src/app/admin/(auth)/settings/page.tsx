"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast-context";
import { CATEGORY_SLUGS, getCategoryName } from "@/lib/categories";
import { compressImage } from "@/lib/image-compress";
import { blobUrl } from "@/lib/blob";
import MediaPicker from "@/components/admin/media-picker";
import styles from "./settings.module.css";

interface SettingsForm {
  heroTitle: string;
  heroTagline: string;
  heroSubtitle: string;
  heroImage: string;
  heroImageMobile: string;
  featuredIds: string;
  catalogOrder: string;
  vk: string;
  telegram: string;
  whatsapp: string;
  wbUrl: string;
  ozonUrl: string;
  /** Фото категорий: { slug → URL } */
  catImages: Record<string, string>;
}

const emptyForm: SettingsForm = {
  heroTitle: "",
  heroTagline: "",
  heroSubtitle: "",
  heroImage: "",
  heroImageMobile: "",
  featuredIds: "",
  catalogOrder: "",
  vk: "",
  telegram: "",
  whatsapp: "",
  wbUrl: "",
  ozonUrl: "",
  catImages: {},
};

/** Карточка hero-изображения (desktop / mobile): превью + кнопки загрузки */
function HeroImageCard({
  label,
  hint,
  src,
  uploading,
  onUpload,
  onMedia,
  onRemove,
  mobile,
}: {
  label: string;
  hint: string;
  src: string;
  uploading: boolean;
  onUpload: () => void;
  onMedia: () => void;
  onRemove: () => void;
  mobile?: boolean;
}) {
  return (
    <div className={styles.heroCard}>
      <div className={styles.heroCardHead}>
        <span className={styles.heroCardLabel}>{label}</span>
        <span className={styles.heroCardHint}>{hint}</span>
      </div>
      <div
        className={`${styles.heroPreview}${mobile ? ` ${styles.heroPreviewMobile}` : ""}`}
      >
        {src ? (
          <img
            src={blobUrl(src)}
            alt={`${label} preview`}
            onError={(e) => {
              console.error(`[settings] ${label} preview failed to load:`, src);
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <span className={styles.heroPreviewEmpty}>Нет изображения</span>
        )}
      </div>
      <div className={styles.heroCardActions}>
        <button
          type="button"
          className={styles.uploadBtn}
          onClick={onUpload}
          disabled={uploading}
        >
          {uploading ? "Загрузка..." : "Загрузить"}
        </button>
        <button type="button" className={styles.mediaBtn} onClick={onMedia}>
          Из медиа
        </button>
        {src && (
          <button type="button" className={styles.removeBtn} onClick={onRemove}>
            Удалить
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<SettingsForm>(emptyForm);
  const [jsonText, setJsonText] = useState("");
  const [mode, setMode] = useState<"form" | "json">("form");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const mobileFileRef = useRef<HTMLInputElement>(null);
  /** Куда вставить выбранное из медиа: "hero" | slug категории | null */
  const [pickerFor, setPickerFor] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => {
        if (res.status === 401) router.push("/admin/login");
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setJsonText(JSON.stringify(data, null, 2));
        setForm({
          heroTitle: data.hero?.title || "",
          heroTagline: data.hero?.tagline || "",
          heroSubtitle: data.hero?.subtitle || "",
          heroImage: data.hero?.image || "",
          heroImageMobile: data.hero?.imageMobile || "",
          featuredIds: Array.isArray(data.featuredIds) ? data.featuredIds.join(", ") : "",
          catalogOrder: Array.isArray(data.catalogOrder) ? data.catalogOrder.join(", ") : "",
          catImages: data.categoryImages || {},
          vk: data.social?.vk || "",
          telegram: data.social?.telegram || "",
          whatsapp: data.social?.whatsapp || "",
          wbUrl: data.marketplaces?.wildberries || "",
          ozonUrl: data.marketplaces?.ozon || "",
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Не удалось загрузить настройки");
        setLoading(false);
      });
  }, [router]);

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    target: "hero" | "heroMobile" = "hero",
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Держим синхронно с MAX_UPLOAD_SIZE в src/lib/schemas.ts
    // (4 МБ — лимит тела запроса классического serverless Vercel)
    const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(`Файл слишком большой (${(file.size / 1024 / 1024).toFixed(1)} МБ). Макс. 4 МБ`);
      return;
    }

    setUploading(true);
    setError("");

    const fd = new FormData();
    // Сжимаем в браузере (WebP, max 1600px) — hero-фото грузятся быстрее
    const compressed = await compressImage(file);
    fd.append("file", compressed);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        console.log("[settings] upload ok:", data.url);
        if (target === "heroMobile") {
          setForm((prev) => ({ ...prev, heroImageMobile: data.url }));
        } else {
          setForm((prev) => ({ ...prev, heroImage: data.url }));
        }
      } else {
        console.error("[settings] upload failed:", res.status, data);
        setError(data.error || "Ошибка загрузки");
      }
    } catch (err) {
      console.error("[settings] upload network error:", err);
      setError("Ошибка соединения");
    } finally {
      setUploading(false);
    }
  }

  async function saveForm() {
    const featuredIdsArray = form.featuredIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Чистим пустые URL из catImages
    const catImages: Record<string, string> = {};
    for (const slug of CATEGORY_SLUGS) {
      const val = (form.catImages[slug] || "").trim();
      if (val) catImages[slug] = val;
    }

    return {
      hero: {
        title: form.heroTitle,
        tagline: form.heroTagline,
        subtitle: form.heroSubtitle,
        image: form.heroImage,
        imageMobile: form.heroImageMobile,
      },
      featuredIds: featuredIdsArray,
      catalogOrder: form.catalogOrder.split(",").map((s) => s.trim()).filter(Boolean),
      categoryImages: catImages,
      social: {
        vk: form.vk,
        telegram: form.telegram,
        whatsapp: form.whatsapp,
      },
      marketplaces: {
        wildberries: form.wbUrl,
        ozon: form.ozonUrl,
      },
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);

    try {
      let payload: Record<string, unknown>;

      if (mode === "json") {
        payload = JSON.parse(jsonText);
      } else {
        payload = await saveForm();
      }

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaved(true);
        toast.success("Настройки сохранены");
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        const msg = data.error || "Ошибка сохранения";
        setError(msg);
        toast.error(msg);
      }
    } catch {
      const msg = "Ошибка соединения или невалидный JSON";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  function updateField(field: keyof SettingsForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function switchToJson() {
    saveForm().then((payload) => {
      setJsonText(JSON.stringify(payload, null, 2));
      setMode("json");
    });
  }

  function switchToForm() {
    try {
      const parsed = JSON.parse(jsonText);
      setForm({
        heroTitle: parsed.hero?.title || "",
        heroTagline: parsed.hero?.tagline || "",
        heroSubtitle: parsed.hero?.subtitle || "",
        heroImage: parsed.hero?.image || "",
        heroImageMobile: parsed.hero?.imageMobile || "",
        featuredIds: Array.isArray(parsed.featuredIds) ? parsed.featuredIds.join(", ") : "",
        catalogOrder: Array.isArray(parsed.catalogOrder) ? parsed.catalogOrder.join(", ") : "",
        vk: parsed.social?.vk || "",
        telegram: parsed.social?.telegram || "",
        whatsapp: parsed.social?.whatsapp || "",
        wbUrl: parsed.marketplaces?.wildberries || "",
        ozonUrl: parsed.marketplaces?.ozon || "",
        catImages: parsed.categoryImages || {},
      });
      setMode("form");
      setError("");
    } catch {
      setError("Невалидный JSON — исправьте перед переключением");
    }
  }

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Настройки сайта</h1>
          <p className={styles.subtitle}>
            Главный экран, категории, каталог, соцсети и аналитика
          </p>
        </div>
        <div className={styles.headerRight}>
          <button
            type="button"
            className={styles.modeToggle}
            onClick={mode === "form" ? switchToJson : switchToForm}
          >
            {mode === "form" ? "Редактор JSON" : "Форма"}
          </button>
        </div>
      </header>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        {mode === "json" ? (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionNum}>JSON</span>
              <div>
                <h2 className={styles.sectionTitle}>Редактор JSON</h2>
                <p className={styles.sectionDesc}>
                  Прямое редактирование настроек. Будьте аккуратны с форматом.
                </p>
              </div>
            </div>
            <textarea
              className={styles.jsonEditor}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              spellCheck={false}
            />
          </section>
        ) : (
          <>
            {/* 01 — Главный экран */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionNum}>01</span>
                <div>
                  <h2 className={styles.sectionTitle}>Главный экран</h2>
                  <p className={styles.sectionDesc}>
                    Заголовки и фоновые изображения hero-блока
                  </p>
                </div>
              </div>

              <div className={styles.fieldGrid}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Заголовок</span>
                  <input
                    type="text"
                    className={styles.input}
                    value={form.heroTitle}
                    onChange={(e) => updateField("heroTitle", e.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Теглайн</span>
                  <input
                    type="text"
                    className={styles.input}
                    value={form.heroTagline}
                    onChange={(e) => updateField("heroTagline", e.target.value)}
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Подзаголовок</span>
                <input
                  type="text"
                  className={styles.input}
                  value={form.heroSubtitle}
                  onChange={(e) => updateField("heroSubtitle", e.target.value)}
                />
              </label>

              <div className={styles.heroImages}>
                <HeroImageCard
                  label="Desktop"
                  hint="Широкий формат"
                  src={form.heroImage}
                  uploading={uploading}
                  onUpload={() => fileRef.current?.click()}
                  onMedia={() => setPickerFor("hero")}
                  onRemove={() => updateField("heroImage", "")}
                />
                <HeroImageCard
                  label="Mobile"
                  hint="Вертикальный формат"
                  src={form.heroImageMobile}
                  uploading={uploading}
                  onUpload={() => mobileFileRef.current?.click()}
                  onMedia={() => setPickerFor("heroMobile")}
                  onRemove={() => updateField("heroImageMobile", "")}
                  mobile
                />
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
              <input
                ref={mobileFileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleImageUpload(e, "heroMobile")}
              />
            </section>

            {/* 02 — Популярные модели */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionNum}>02</span>
                <div>
                  <h2 className={styles.sectionTitle}>Популярные модели</h2>
                  <p className={styles.sectionDesc}>Товары на главной странице</p>
                </div>
              </div>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>ID товаров (через запятую)</span>
                <input
                  type="text"
                  className={styles.input}
                  value={form.featuredIds}
                  onChange={(e) => updateField("featuredIds", e.target.value)}
                  placeholder="mor-001, mor-005, mor-012"
                />
                <span className={styles.hint}>
                  Оставьте пустым — покажутся первые 6 товаров
                </span>
              </label>
            </section>

            {/* 03 — Фото категорий */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionNum}>03</span>
                <div>
                  <h2 className={styles.sectionTitle}>Фото категорий</h2>
                  <p className={styles.sectionDesc}>Плитки категорий на главной странице</p>
                </div>
              </div>
              <div className={styles.catGrid}>
                {CATEGORY_SLUGS.map((slug) => (
                  <div key={slug} className={styles.catCard}>
                    <div className={styles.catPreview}>
                      {form.catImages[slug] ? (
                        <img
                          src={blobUrl(form.catImages[slug])}
                          alt={getCategoryName(slug)}
                          onError={(e) => {
                            console.error("[settings] category image failed to load:", form.catImages[slug]);
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className={styles.catPreviewEmpty}>—</span>
                      )}
                    </div>
                    <div className={styles.catBody}>
                      <span className={styles.catName}>{getCategoryName(slug)}</span>
                      <div className={styles.catRow}>
                        <input
                          type="text"
                          className={styles.input}
                          value={form.catImages[slug] || ""}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              catImages: { ...prev.catImages, [slug]: e.target.value },
                            }))
                          }
                          placeholder="URL изображения"
                        />
                        <button
                          type="button"
                          className={styles.mediaBtn}
                          onClick={() => setPickerFor(slug)}
                        >
                          Из медиа
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className={styles.hint}>
                Оставьте пустым — подберётся из первого товара в категории.
              </p>
            </section>

            {/* 04 — Порядок в каталоге */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionNum}>04</span>
                <div>
                  <h2 className={styles.sectionTitle}>Порядок в каталоге</h2>
                  <p className={styles.sectionDesc}>Очерёдность товаров в каталоге</p>
                </div>
              </div>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>ID товаров (через запятую)</span>
                <input
                  type="text"
                  className={styles.input}
                  value={form.catalogOrder}
                  onChange={(e) => updateField("catalogOrder", e.target.value)}
                  placeholder="mor-001, mor-003, mor-005, mor-002, ..."
                />
                <span className={styles.hint}>
                  Укажите порядок отображения товаров. Остальные — после перечисленных
                </span>
              </label>
            </section>

              {/* 05 — Социальные сети */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionNum}>05</span>
                <div>
                  <h2 className={styles.sectionTitle}>Социальные сети</h2>
                  <p className={styles.sectionDesc}>Ссылки в шапке и футере</p>
                </div>
              </div>
              <div className={styles.fieldGrid}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>VK</span>
                  <input
                    type="url"
                    className={styles.input}
                    value={form.vk}
                    onChange={(e) => updateField("vk", e.target.value)}
                    placeholder="https://vk.com/..."
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Telegram</span>
                  <input
                    type="url"
                    className={styles.input}
                    value={form.telegram}
                    onChange={(e) => updateField("telegram", e.target.value)}
                    placeholder="https://t.me/..."
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>WhatsApp</span>
                  <input
                    type="url"
                    className={styles.input}
                    value={form.whatsapp}
                    onChange={(e) => updateField("whatsapp", e.target.value)}
                    placeholder="https://wa.me/..."
                  />
                </label>
              </div>
            </section>

            {/* 06 — Маркетплейсы */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionNum}>06</span>
                <div>
                  <h2 className={styles.sectionTitle}>Маркетплейсы</h2>
                  <p className={styles.sectionDesc}>Ссылки на карточки товаров</p>
                </div>
              </div>
              <div className={styles.fieldGrid}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Wildberries</span>
                  <input
                    type="url"
                    className={styles.input}
                    value={form.wbUrl}
                    onChange={(e) => updateField("wbUrl", e.target.value)}
                    placeholder="https://wildberries.ru/..."
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Ozon</span>
                  <input
                    type="url"
                    className={styles.input}
                    value={form.ozonUrl}
                    onChange={(e) => updateField("ozonUrl", e.target.value)}
                    placeholder="https://ozon.ru/..."
                  />
                </label>
              </div>
            </section>

            {/* 07 — API ключи */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionNum}>07</span>
                <div>
                  <h2 className={styles.sectionTitle}>API ключи</h2>
                  <p className={styles.sectionDesc}>Доступы к маркетплейсам</p>
                </div>
              </div>
              <p className={styles.hint}>
                Ключи Wildberries и Ozon задаются переменными окружения (WB_API_KEY,
                OZON_CLIENT_ID, OZON_API_KEY) — на Vercel это Settings → Environment
                Variables. Здесь они не хранятся.
              </p>
            </section>
          </>
        )}

        <div className={styles.saveBar}>
          {saved && <span className={styles.savedBadge}>Сохранено</span>}
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? "Сохранение..." : "Сохранить настройки"}
          </button>
        </div>
      </form>

      <MediaPicker
        open={pickerFor !== null}
        onClose={() => setPickerFor(null)}
        onSelect={(url) => {
          if (pickerFor === "hero") {
            setForm((prev) => ({ ...prev, heroImage: url }));
          } else if (pickerFor === "heroMobile") {
            setForm((prev) => ({ ...prev, heroImageMobile: url }));
          } else if (pickerFor) {
            setForm((prev) => ({
              ...prev,
              catImages: { ...prev.catImages, [pickerFor]: url },
            }));
          }
          setPickerFor(null);
        }}
      />
    </div>
  );
}
