"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./settings.module.css";

interface SettingsForm {
  heroTitle: string;
  heroTagline: string;
  heroSubtitle: string;
  heroImage: string;
  featuredIds: string;
  catalogOrder: string;
  wbApiKey: string;
  yandexMetrikaId: string;
  instagram: string;
  vk: string;
  telegram: string;
  whatsapp: string;
  wbUrl: string;
  ozonUrl: string;
  ymUrl: string;
  seoTitle: string;
  seoDescription: string;
  /** Фото категорий: { slug → URL } */
  catImages: Record<string, string>;
}

const CATEGORY_SLUGS = ["crossbody", "na-plecho", "baguette", "tote", "saddle", "backpack"];

const CATEGORY_NAMES: Record<string, string> = {
  crossbody: "Кросс-боди",
  "na-plecho": "На плечо",
  baguette: "Багет",
  tote: "Тоут",
  saddle: "Седло",
  backpack: "Рюкзаки",
};

const emptyForm: SettingsForm = {
  heroTitle: "",
  heroTagline: "",
  heroSubtitle: "",
  heroImage: "",
  featuredIds: "",
  catalogOrder: "",
  wbApiKey: "",
  yandexMetrikaId: "",
  instagram: "",
  vk: "",
  telegram: "",
  whatsapp: "",
  wbUrl: "",
  ozonUrl: "",
  ymUrl: "",
  seoTitle: "",
  seoDescription: "",
  catImages: {},
};

export default function AdminSettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState<SettingsForm>(emptyForm);
  const [rawSettings, setRawSettings] = useState<Record<string, unknown>>({});
  const [jsonText, setJsonText] = useState("");
  const [mode, setMode] = useState<"form" | "json">("form");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
        setRawSettings(data);
        setJsonText(JSON.stringify(data, null, 2));
        setForm({
          heroTitle: data.hero?.title || "",
          heroTagline: data.hero?.tagline || "",
          heroSubtitle: data.hero?.subtitle || "",
          heroImage: data.hero?.image || "",
          featuredIds: Array.isArray(data.featuredIds) ? data.featuredIds.join(", ") : "",
          catalogOrder: Array.isArray(data.catalogOrder) ? data.catalogOrder.join(", ") : "",
          wbApiKey: data.wbApiKey || "",
          yandexMetrikaId: data.yandexMetrikaId || "",
          catImages: data.categoryImages || {},
          instagram: data.social?.instagram || "",
          vk: data.social?.vk || "",
          telegram: data.social?.telegram || "",
          whatsapp: data.social?.whatsapp || "",
          wbUrl: data.marketplaces?.wildberries || "",
          ozonUrl: data.marketplaces?.ozon || "",
          ymUrl: data.marketplaces?.yandexMarket || "",
          seoTitle: data.seo?.defaultTitle || "",
          seoDescription: data.seo?.defaultDescription || "",
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Не удалось загрузить настройки");
        setLoading(false);
      });
  }, [router]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setForm((prev) => ({ ...prev, heroImage: data.url }));
      } else {
        setError(data.error || "Ошибка загрузки");
      }
    } catch {
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
      },
      featuredIds: featuredIdsArray,
      catalogOrder: form.catalogOrder.split(",").map((s) => s.trim()).filter(Boolean),
      categoryImages: catImages,
      wbApiKey: form.wbApiKey,
      yandexMetrikaId: form.yandexMetrikaId,
      social: {
        instagram: form.instagram,
        vk: form.vk,
        telegram: form.telegram,
        whatsapp: form.whatsapp,
      },
      marketplaces: {
        wildberries: form.wbUrl,
        ozon: form.ozonUrl,
        yandexMarket: form.ymUrl,
      },
      seo: {
        defaultTitle: form.seoTitle,
        defaultDescription: form.seoDescription,
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
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Ошибка сохранения");
      }
    } catch {
      setError("Ошибка соединения или невалидный JSON");
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
      setRawSettings(parsed);
      setForm({
        heroTitle: parsed.hero?.title || "",
        heroTagline: parsed.hero?.tagline || "",
        heroSubtitle: parsed.hero?.subtitle || "",
        heroImage: parsed.hero?.image || "",
        featuredIds: Array.isArray(parsed.featuredIds) ? parsed.featuredIds.join(", ") : "",
        catalogOrder: Array.isArray(parsed.catalogOrder) ? parsed.catalogOrder.join(", ") : "",
        wbApiKey: parsed.wbApiKey || "",
        yandexMetrikaId: parsed.yandexMetrikaId || "",
        instagram: parsed.social?.instagram || "",
        vk: parsed.social?.vk || "",
        telegram: parsed.social?.telegram || "",
        whatsapp: parsed.social?.whatsapp || "",
        wbUrl: parsed.marketplaces?.wildberries || "",
        ozonUrl: parsed.marketplaces?.ozon || "",
        ymUrl: parsed.marketplaces?.yandexMarket || "",
        seoTitle: parsed.seo?.defaultTitle || "",
        seoDescription: parsed.seo?.defaultDescription || "",
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
        <h1 className={styles.title}>Настройки сайта</h1>
        <div className={styles.headerRight}>
          {saved && <span className={styles.savedBadge}>Сохранено</span>}
          <button
            type="button"
            className={styles.modeToggle}
            onClick={mode === "form" ? switchToJson : switchToForm}
          >
            {mode === "form" ? "JSON" : "Форма"}
          </button>
        </div>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        {mode === "json" ? (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Редактор JSON</h2>
            <textarea
              className={styles.jsonEditor}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              spellCheck={false}
            />
          </section>
        ) : (
          <>
            {/* Hero */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Главный экран</h2>
              <div className={styles.fieldGrid}>
                <label className={styles.label}>
                  Заголовок
                  <input
                    type="text"
                    className={styles.input}
                    value={form.heroTitle}
                    onChange={(e) => updateField("heroTitle", e.target.value)}
                  />
                </label>
                <label className={styles.label}>
                  Теглайн
                  <input
                    type="text"
                    className={styles.input}
                    value={form.heroTagline}
                    onChange={(e) => updateField("heroTagline", e.target.value)}
                  />
                </label>
                <label className={styles.label}>
                  Подзаголовок
                  <input
                    type="text"
                    className={styles.input}
                    value={form.heroSubtitle}
                    onChange={(e) => updateField("heroSubtitle", e.target.value)}
                  />
                </label>
                <label className={styles.label}>
                  Изображение
                  <div className={styles.imageRow}>
                    <input
                      type="hidden"
                      value={form.heroImage}
                      onChange={(e) => updateField("heroImage", e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.uploadBtn}
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? "Загрузка..." : "Выбрать файл"}
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageUpload}
                    />
                    {form.heroImage && (
                      <span className={styles.imageName}>
                        {form.heroImage.split("/").pop()}
                      </span>
                    )}
                  </div>
                  {form.heroImage && (
                    <div className={styles.imagePreview}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.heroImage} alt="Hero preview" />
                    </div>
                  )}
                </label>
              </div>
            </section>

            {/* Featured Products */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Популярные модели</h2>
              <label className={styles.label}>
                ID товаров (через запятую)
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

            {/* Category Images */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Фото категорий</h2>
              <p className={styles.hint}>
                Изображения для плиток категорий на главной странице. Оставьте
                пустым — подберётся из первого товара в категории.
              </p>
              <div className={styles.catImageGrid}>
                {CATEGORY_SLUGS.map((slug) => (
                  <label key={slug} className={styles.catImageLabel}>
                    <span className={styles.catImageName}>{CATEGORY_NAMES[slug]}</span>
                    <div className={styles.catImageRow}>
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
                      {form.catImages[slug] && (
                        <div className={styles.catImagePreview}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={form.catImages[slug]} alt={CATEGORY_NAMES[slug]} />
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Catalog Order */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Порядок в каталоге</h2>
              <label className={styles.label}>
                ID товаров (через запятую)
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

            {/* API Keys */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>API ключи</h2>
              <div className={styles.fieldGrid}>
                <label className={styles.label}>
                  WB API Key
                  <input
                    type="password"
                    className={styles.input}
                    value={form.wbApiKey}
                    onChange={(e) => updateField("wbApiKey", e.target.value)}
                    placeholder="оставьте пустым, если не используется"
                  />
                  <span className={styles.hint}>
                    Для живых цен с Wildberries. Без ключа — статические цены
                  </span>
                </label>
                <label className={styles.label}>
                  Яндекс.Метрика ID
                  <input
                    type="text"
                    className={styles.input}
                    value={form.yandexMetrikaId}
                    onChange={(e) => updateField("yandexMetrikaId", e.target.value)}
                    placeholder="оставьте пустым, если не используется"
                  />
                  <span className={styles.hint}>
                    ID счётчика Яндекс.Метрики
                  </span>
                </label>
              </div>
            </section>

            {/* Social */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Социальные сети</h2>
              <div className={styles.fieldGrid}>
                <label className={styles.label}>
                  Instagram
                  <input
                    type="url"
                    className={styles.input}
                    value={form.instagram}
                    onChange={(e) => updateField("instagram", e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </label>
                <label className={styles.label}>
                  VK
                  <input
                    type="url"
                    className={styles.input}
                    value={form.vk}
                    onChange={(e) => updateField("vk", e.target.value)}
                    placeholder="https://vk.com/..."
                  />
                </label>
                <label className={styles.label}>
                  Telegram
                  <input
                    type="url"
                    className={styles.input}
                    value={form.telegram}
                    onChange={(e) => updateField("telegram", e.target.value)}
                    placeholder="https://t.me/..."
                  />
                </label>
                <label className={styles.label}>
                  WhatsApp
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

            {/* Marketplaces */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Маркетплейсы</h2>
              <div className={styles.fieldGrid}>
                <label className={styles.label}>
                  Wildberries
                  <input
                    type="url"
                    className={styles.input}
                    value={form.wbUrl}
                    onChange={(e) => updateField("wbUrl", e.target.value)}
                    placeholder="https://wildberries.ru/..."
                  />
                </label>
                <label className={styles.label}>
                  Ozon
                  <input
                    type="url"
                    className={styles.input}
                    value={form.ozonUrl}
                    onChange={(e) => updateField("ozonUrl", e.target.value)}
                    placeholder="https://ozon.ru/..."
                  />
                </label>
                <label className={styles.label}>
                  Yandex Market
                  <input
                    type="url"
                    className={styles.input}
                    value={form.ymUrl}
                    onChange={(e) => updateField("ymUrl", e.target.value)}
                    placeholder="https://market.yandex.ru/..."
                  />
                </label>
              </div>
            </section>

            {/* SEO */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>SEO</h2>
              <div className={styles.fieldGrid}>
                <label className={styles.label}>
                  Default Title
                  <input
                    type="text"
                    className={styles.input}
                    value={form.seoTitle}
                    onChange={(e) => updateField("seoTitle", e.target.value)}
                  />
                </label>
                <label className={styles.label}>
                  Default Description
                  <textarea
                    className={styles.textarea}
                    value={form.seoDescription}
                    onChange={(e) => updateField("seoDescription", e.target.value)}
                    rows={3}
                  />
                </label>
              </div>
            </section>
          </>
        )}

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.saveBtn}
            disabled={saving}
          >
            {saving ? "Сохранение..." : "Сохранить настройки"}
          </button>
        </div>
      </form>
    </div>
  );
}
