"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./settings.module.css";

interface SettingsForm {
  heroTitle: string;
  heroSubtitle: string;
  phone: string;
  email: string;
  address: string;
  instagram: string;
  vk: string;
  telegram: string;
  whatsapp: string;
  wbUrl: string;
  ozonUrl: string;
  ymUrl: string;
  seoTitle: string;
  seoDescription: string;
}

const emptyForm: SettingsForm = {
  heroTitle: "",
  heroSubtitle: "",
  phone: "",
  email: "",
  address: "",
  instagram: "",
  vk: "",
  telegram: "",
  whatsapp: "",
  wbUrl: "",
  ozonUrl: "",
  ymUrl: "",
  seoTitle: "",
  seoDescription: "",
};

export default function AdminSettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState<SettingsForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

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
        setForm({
          heroTitle: data.hero?.title || "",
          heroSubtitle: data.hero?.subtitle || "",
          phone: data.contacts?.phone || "",
          email: data.contacts?.email || "",
          address: data.contacts?.address || "",
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);

    const payload = {
      hero: {
        title: form.heroTitle,
        subtitle: form.heroSubtitle,
      },
      contacts: {
        phone: form.phone,
        email: form.email,
        address: form.address,
      },
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

    try {
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
      setError("Ошибка соединения");
    } finally {
      setSaving(false);
    }
  }

  function updateField(field: keyof SettingsForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Настройки сайта</h1>
        {saved && <span className={styles.savedBadge}>Сохранено</span>}
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
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
              Подзаголовок
              <input
                type="text"
                className={styles.input}
                value={form.heroSubtitle}
                onChange={(e) => updateField("heroSubtitle", e.target.value)}
              />
            </label>
          </div>
        </section>

        {/* Contacts */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Контакты</h2>
          <div className={styles.fieldGrid}>
            <label className={styles.label}>
              Телефон
              <input
                type="text"
                className={styles.input}
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </label>
            <label className={styles.label}>
              Email
              <input
                type="email"
                className={styles.input}
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </label>
            <label className={styles.label}>
              Адрес
              <input
                type="text"
                className={styles.input}
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
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
