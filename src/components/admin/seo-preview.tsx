"use client";

import { useState } from "react";
import { SEO_LIMITS, buildCiteUrl } from "@/config/seo";
import type { SeoEntry } from "@/app/admin/(auth)/seo/page";
import styles from "./seo-preview.module.css";

interface Props {
  entries: SeoEntry[];
  domain: string;
  siteName: string;
  faviconUrl: string;
  /** JSON-LD из layout.tsx — присутствует на каждой странице */
  globalJsonLd?: Record<string, unknown>[];
}

type Device = "desktop" | "mobile";

const GROUP_LABELS: Record<SeoEntry["group"], string> = {
  pages: "Страницы",
  categories: "Категории каталога",
  products: "Товары (примеры)",
};

/** Показать длину: ок / предупреждение / красный */
function lengthClass(len: number, recommended: number, hardMax?: number) {
  if (len <= recommended) return "ok";
  if (hardMax === undefined || len <= hardMax) return "warn";
  return "over";
}

function JsonLdBlock({ jsonLd }: { jsonLd: Record<string, unknown>[] }) {
  if (jsonLd.length === 0) return null;
  return (
    <details className={styles.jsonld}>
      <summary className={styles.jsonldSummary}>
        JSON-LD · Schema.org ({jsonLd.length}{" "}
        {jsonLd.length === 1 ? "блок" : "блока"})
      </summary>
      <div className={styles.jsonldBody}>
        {jsonLd.map((obj, i) => (
          <pre key={i} className={styles.jsonldBlock}>
            {JSON.stringify(obj, null, 2)}
          </pre>
        ))}
      </div>
    </details>
  );
}

function SerpSnippet({
  entry,
  device,
  domain,
  siteName,
  faviconUrl,
}: Props & { entry: SeoEntry; device: Device }) {
  const cite = buildCiteUrl(domain, entry.siteSegments);

  const titleState = lengthClass(
    entry.title.length,
    SEO_LIMITS.titleRecommended,
    SEO_LIMITS.titleHardMax,
  );
  const descState = lengthClass(
    entry.description.length,
    SEO_LIMITS.descriptionRecommended,
  );

  return (
    <div className={styles.item}>
      <div className={styles.meta}>
        <code className={styles.path}>{entry.path}</code>
        {entry.noindex && <span className={styles.noindex}>noindex</span>}
        <span className={styles.canonical}>canonical: {entry.canonical}</span>
        <div className={styles.counters}>
          <span className={`${styles.counter} ${styles[titleState]}`}>
            title {entry.title.length}
            {titleState === "ok" && " ✓"}
            {titleState === "warn" && " — обрежется на десктопе"}
            {titleState === "over" && " — Google обрежет"}
          </span>
          <span className={`${styles.counter} ${styles[descState]}`}>
            desc {entry.description.length}
            {descState === "ok" && " ✓"}
            {descState === "warn" && " — обрежется на мобильном"}
          </span>
        </div>
      </div>

      <div
        className={`${styles.serp} ${
          device === "mobile" ? styles.serpMobile : styles.serpDesktop
        }`}
      >
        <a className={styles.title} href={`https://${domain}${entry.path}`} target="_blank" rel="noreferrer">
          {entry.title || "—"}
        </a>
        <div className={styles.urlRow}>
          {/* Favicon домена, как в живом Google (26px). Не загрузился — просто скрываем */}
          <img
            className={styles.favicon}
            src={faviconUrl}
            alt=""
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className={styles.urlText}>
            <div className={styles.siteName}>{siteName}</div>
            <div className={styles.cite}>{cite}</div>
          </div>
        </div>
        <p className={`${styles.desc} ${device === "mobile" ? styles.descMobile : ""}`}>
          {entry.description || "—"}
        </p>
      </div>

      {entry.og && (
        <div className={styles.ogRow}>
          <span className={styles.ogLabel}>OpenGraph</span>
          <span className={styles.ogTitle}>{entry.og.title}</span>
          <span className={styles.ogDesc}>{entry.og.description}</span>
        </div>
      )}

      <JsonLdBlock jsonLd={entry.jsonLd} />
    </div>
  );
}

export default function SeoPreview({
  entries,
  domain,
  siteName,
  faviconUrl,
  globalJsonLd,
}: Props) {
  const [device, setDevice] = useState<Device>("desktop");
  const groups = ["pages", "categories", "products"] as const;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>SEO — как сайт выглядит в Google</h1>
        <div className={styles.deviceToggle} role="tablist">
          <button
            role="tab"
            aria-selected={device === "desktop"}
            className={`${styles.deviceBtn} ${
              device === "desktop" ? styles.deviceBtnActive : ""
            }`}
            onClick={() => setDevice("desktop")}
          >
            Десктоп
          </button>
          <button
            role="tab"
            aria-selected={device === "mobile"}
            className={`${styles.deviceBtn} ${
              device === "mobile" ? styles.deviceBtnActive : ""
            }`}
            onClick={() => setDevice("mobile")}
          >
            Мобильный
          </button>
        </div>
      </header>

      {globalJsonLd && globalJsonLd.length > 0 && (
        <details className={`${styles.jsonld} ${styles.globalJsonLd}`}>
          <summary className={styles.jsonldSummary}>
            Глобальная микроразметка (layout.tsx) — на каждой странице
          </summary>
          <div className={styles.jsonldBody}>
            {globalJsonLd.map((obj, i) => (
              <pre key={i} className={styles.jsonldBlock}>
                {JSON.stringify(obj, null, 2)}
              </pre>
            ))}
          </div>
        </details>
      )}

      {groups.map((group) => {
        const groupEntries = entries.filter((e) => e.group === group);
        if (groupEntries.length === 0) return null;
        return (
          <section key={group} className={styles.group}>
            <h2 className={styles.groupTitle}>{GROUP_LABELS[group]}</h2>
            {groupEntries.map((entry) => (
              <SerpSnippet
                key={entry.id}
                entry={entry}
                device={device}
                domain={domain}
                siteName={siteName}
                faviconUrl={faviconUrl}
                entries={entries}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}