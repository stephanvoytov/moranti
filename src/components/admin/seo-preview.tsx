"use client";

import { useEffect, useMemo, useState } from "react";
import { PreviewPanel } from "@power-seo/preview/react";
import { blobUrl } from "@/lib/blob";
import type { SeoEntry } from "@/app/admin/(auth)/seo/page";
import styles from "./seo-preview.module.css";

interface Props {
  entries: SeoEntry[];
  domain: string;
  siteName: string;
  /** JSON-LD из layout.tsx — присутствует на каждой странице */
  globalJsonLd?: Record<string, unknown>[];
}

const GROUP_LABELS: Record<SeoEntry["group"], string> = {
  pages: "Страницы",
  categories: "Категории каталога",
  products: "Товары (примеры)",
};

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

/** Реальные размеры изображения — нужны библиотеке для валидации og:image / twitter:image */
function useImageSize(
  src: string | undefined,
): { width?: number; height?: number } {
  const [size, setSize] = useState<{ width?: number; height?: number }>({});
  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled && img.naturalWidth && img.naturalHeight) {
        setSize({ width: img.naturalWidth, height: img.naturalHeight });
      }
    };
    img.onerror = () => {
      if (!cancelled) setSize({});
    };
    img.src = src;
    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);
  return src ? size : {};
}

/**
 * Превью записи целиком через PreviewPanel из @power-seo/preview:
 * вкладки Google / Facebook / Twitter со встроенной валидацией.
 * Размеры картинки замеряем сами и передаём — библиотека проверит
 * минимумы (og: 1200×630, twitter: 1200×675).
 */
function EntryPreview({
  entry,
  domain,
  siteName,
}: {
  entry: SeoEntry;
  domain: string;
  siteName: string;
}) {
  const url = `https://${domain}${entry.path}`;
  const ogTitle = entry.og?.title || entry.title;
  const ogDesc = entry.og?.description || entry.description;
  // Библиотека добавляет " - {siteTitle}" к title. Наши title уже содержат бренд
  // («Moranti — …») — суффикс добавляем только если бренда ещё нет.
  const siteTitle = ogTitle.includes(siteName) ? undefined : siteName;
  const imageUrl = entry.ogImage ? blobUrl(entry.ogImage) : undefined;
  const { width, height } = useImageSize(imageUrl);
  const image = useMemo(
    () => (imageUrl ? { url: imageUrl, width, height } : undefined),
    [imageUrl, width, height],
  );

  return (
    <PreviewPanel
      title={ogTitle}
      description={ogDesc}
      url={url}
      image={image}
      siteName={siteName}
      siteTitle={siteTitle}
      twitterSite={siteName}
      twitterCardType="summary_large_image"
    />
  );
}

export default function SeoPreview({
  entries,
  domain,
  siteName,
  globalJsonLd,
}: Props) {
  const groups = ["pages", "categories", "products"] as const;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>
          SEO — как сайт выглядит в Google и соцсетях
        </h1>
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
              <div key={entry.id} className={styles.item}>
                <div className={styles.meta}>
                  <code className={styles.path}>{entry.path}</code>
                  {entry.noindex && (
                    <span className={styles.noindex}>noindex</span>
                  )}
                  <span className={styles.canonical}>
                    canonical: {entry.canonical}
                  </span>
                </div>
                <EntryPreview
                  entry={entry}
                  domain={domain}
                  siteName={siteName}
                />
                <JsonLdBlock jsonLd={entry.jsonLd} />
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
