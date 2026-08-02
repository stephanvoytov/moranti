"use client";

import { useState } from "react";
import { generateSerpPreview } from "@power-seo/preview";
import { buildCiteUrl } from "@/config/seo";
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
type View = "serp" | "social";

const GROUP_LABELS: Record<SeoEntry["group"], string> = {
  pages: "Страницы",
  categories: "Категории каталога",
  products: "Товары (примеры)",
};

/** Достать цену и рейтинг из Product JSON-LD (для богатого сниппета) */
function extractRichData(
  jsonLd: Record<string, unknown>[],
): { price?: number; rating?: number } | null {
  const product = jsonLd.find((o) => o["@type"] === "Product");
  if (!product) return null;
  const offers = product.offers as
    | Record<string, unknown>
    | Record<string, unknown>[]
    | undefined;
  const first = Array.isArray(offers) ? offers[0] : offers;
  const price = typeof first?.price === "number" ? first.price : undefined;
  const agg = product.aggregateRating as
    | { ratingValue?: unknown }
    | undefined;
  const rating =
    typeof agg?.ratingValue === "number" ? agg.ratingValue : undefined;
  return price !== undefined || rating !== undefined ? { price, rating } : null;
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

/** Превью ссылки в соцсетях/мессенджерах (OG-карточка) */
function SocialCard({
  entry,
  domain,
  siteName,
}: {
  entry: SeoEntry;
  domain: string;
  siteName: string;
}) {
  const ogTitle = entry.og?.title || entry.title;
  const ogDesc = entry.og?.description || entry.description;
  const url = `https://${domain}${entry.path}`;

  return (
    <div className={styles.socialCard}>
      <div className={styles.socialImageWrap}>
        {entry.ogImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.socialImage}
            src={entry.ogImage}
            alt=""
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className={styles.socialImagePlaceholder}>нет og:image</div>
        )}
      </div>
      <div className={styles.socialBody}>
        <div className={styles.socialSite}>{siteName}</div>
        <div className={styles.socialTitle}>{ogTitle}</div>
        <div className={styles.socialDesc}>{ogDesc}</div>
        <div className={styles.socialUrl}>{url}</div>
      </div>
    </div>
  );
}

/** Сниппет Google (десктоп/мобильный) с богатым сниппетом из JSON-LD */
function SerpSnippet({
  entry,
  device,
  domain,
  siteName,
  faviconUrl,
}: {
  entry: SeoEntry;
  device: Device;
  domain: string;
  siteName: string;
  faviconUrl: string;
}) {
  const cite = buildCiteUrl(domain, entry.siteSegments);
  const rich = extractRichData(entry.jsonLd);
  const url = `https://${domain}${entry.path}`;
  // Пиксельная обрезка по метрикам Google (title 580px, desc 920px)
  const serp = generateSerpPreview({
    title: entry.title,
    description: entry.description,
    url,
  });

  const titleState = serp.titleValidation.valid ? "ok" : "over";
  const descState = serp.descriptionValidation.valid ? "ok" : "over";

  return (
    <div className={styles.item}>
      <div className={styles.meta}>
        <code className={styles.path}>{entry.path}</code>
        {entry.noindex && <span className={styles.noindex}>noindex</span>}
        <span className={styles.canonical}>canonical: {entry.canonical}</span>
        <div className={styles.counters}>
          <span className={`${styles.counter} ${styles[titleState]}`}>
            title {serp.titleValidation.charCount ?? 0} симв. ·{" "}
            {Math.round(serp.titleValidation.pixelWidth ?? 0)}px
            {serp.titleValidation.valid ? " ✓" : " — обрежется"}
          </span>
          <span className={`${styles.counter} ${styles[descState]}`}>
            desc {serp.descriptionValidation.charCount ?? 0} симв. ·{" "}
            {Math.round(serp.descriptionValidation.pixelWidth ?? 0)}px
            {serp.descriptionValidation.valid ? " ✓" : " — обрежется"}
          </span>
        </div>
      </div>

      <div
        className={`${styles.serp} ${
          device === "mobile" ? styles.serpMobile : styles.serpDesktop
        }`}
      >
        <a className={styles.title} href={url} target="_blank" rel="noreferrer">
          {serp.title || "—"}
        </a>
        <div className={styles.urlRow}>
          {/* Favicon домена, как в живом Google (26px). Не загрузился — просто скрываем */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
        {/* Богатый сниппет: цена и рейтинг из Product JSON-LD */}
        {rich && (
          <div className={styles.richRow}>
            {rich.price !== undefined && (
              <span className={styles.richPrice}>
                {rich.price.toLocaleString("ru-RU")} ₽
              </span>
            )}
            {rich.rating !== undefined && (
              <span className={styles.richRating}>
                {"★".repeat(Math.round(rich.rating))}
                <span className={styles.richRatingValue}>
                  {rich.rating.toFixed(1)}
                </span>
              </span>
            )}
          </div>
        )}
        <p className={`${styles.desc} ${device === "mobile" ? styles.descMobile : ""}`}>
          {serp.description || "—"}
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
  const [view, setView] = useState<View>("serp");
  const groups = ["pages", "categories", "products"] as const;

  const VIEW_LABELS: Record<View, string> = {
    serp: "Сниппет",
    social: "Соцсети",
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>SEO — как сайт выглядит в Google</h1>
        <div className={styles.toggles}>
          <div className={styles.viewToggle} role="tablist">
            {(Object.keys(VIEW_LABELS) as View[]).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                className={`${styles.deviceBtn} ${
                  view === v ? styles.deviceBtnActive : ""
                }`}
                onClick={() => setView(v)}
              >
                {VIEW_LABELS[v]}
              </button>
            ))}
          </div>
          {view === "serp" && (
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
          )}
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
            {groupEntries.map((entry) =>
              view === "serp" ? (
                <SerpSnippet
                  key={entry.id}
                  entry={entry}
                  device={device}
                  domain={domain}
                  siteName={siteName}
                  faviconUrl={faviconUrl}
                />
              ) : (
                <div key={entry.id} className={styles.item}>
                  <div className={styles.meta}>
                    <code className={styles.path}>{entry.path}</code>
                    {entry.noindex && (
                      <span className={styles.noindex}>noindex</span>
                    )}
                  </div>
                  <SocialCard
                    entry={entry}
                    domain={domain}
                    siteName={siteName}
                  />
                </div>
              ),
            )}
          </section>
        );
      })}
    </div>
  );
}