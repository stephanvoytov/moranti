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
    </div>
  );
}

export default function SeoPreview({ entries, domain, siteName, faviconUrl }: Props) {
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
