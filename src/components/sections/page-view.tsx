/* =============================================
   Moranti — PageView / RenderBlocks
   Блочный рендер Страниц из Payload.
   Дизайн повторяет оригинальные страницы:
   хиро с фото, нумерованные разделы 01–02–03,
   крупные тезисы, фотолента, карточки-ссылки, CTA.
   ============================================= */

import Link from "next/link";
import { getPage } from "@/lib/site-content";
import styles from "./page-view.module.css";

/* ---------- утилиты ---------- */

/** Разбить textarea на абзацы по пустой строке */
function paragraphs(t?: unknown): string[] {
  if (!t) return [];
  return String(t)
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Ссылка на картинку: приоритет у загруженного файла из «Медиатеки» */
function imgSrc(block: Record<string, any>): string {
  const uploaded = block?.image;
  if (uploaded && typeof uploaded === "object" && uploaded.url) {
    return String(uploaded.url);
  }
  if (typeof block?.imageUrl === "string" && block.imageUrl) {
    return block.imageUrl;
  }
  return "";
}

/* ---------- рендер одного блока ---------- */

export function RenderBlock({
  block,
  data,
}: {
  block: any;
  data?: { products?: any[] };
}) {
  if (!block || typeof block !== "object") return null;

  switch (block.blockType) {
    /* ——— Хиро страницы ——— */
    case "hero": {
      const src = imgSrc(block);
      const subs = paragraphs(block.subtitle);
      return (
        <section className={styles.hero}>
          {block.eyebrow && <p className={styles.heroBrand}>{block.eyebrow}</p>}
          {block.title && <h1 className={styles.heroTitle}>{block.title}</h1>}
          {subs.map((p, i) => (
            <p key={i} className={i === subs.length - 1 ? styles.heroSub : styles.heroIntro}>
              {p}
            </p>
          ))}
          {src && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={String(block.imageCaption || block.title || "")}
                className={styles.heroImage}
              />
              {block.imageCaption && (
                <p className={styles.heroCaption}>{block.imageCaption}</p>
              )}
            </>
          )}
        </section>
      );
    }

    /* ——— Нумерованный раздел 01–02–03 ——— */
    case "section": {
      const paras = paragraphs(block.paragraphs);
      const items = Array.isArray(block.items) ? block.items : [];
      const src = imgSrc(block);
      return (
        <section className={styles.section}>
          {(block.number || block.title) && (
            <div className={styles.sectionHeader}>
              {block.number && (
                <span className={styles.sectionNumber}>{block.number}</span>
              )}
              {block.title && (
                <h2 className={styles.sectionTitle}>{block.title}</h2>
              )}
              <div className={styles.sectionRule} />
            </div>
          )}
          <div className={styles.body}>
            {paras.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {items.length > 0 && (
              <ul className={styles.list}>
                {items.map((it: any, i: number) => (
                  <li key={i}>{it?.text ?? ""}</li>
                ))}
              </ul>
            )}
            {src && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={String(block.title || "")}
                className={styles.bodyImage}
                loading="lazy"
              />
            )}
          </div>
        </section>
      );
    }

    /* ——— Крупный тезис (манифест) ——— */
    case "statement": {
      const paras = paragraphs(block.paragraphs);
      const src = imgSrc(block);
      const hasPhoto = Boolean(src);
      return (
        <section className={hasPhoto ? styles.statementGrid : styles.statement}>
          <div className={styles.statementText}>
            {block.text && (
              <h2 className={styles.bigStatement}>{block.text}</h2>
            )}
            {paras.map((p, i) => (
              <p key={i} className={styles.body}>
                {p}
              </p>
            ))}
          </div>
          {hasPhoto && (
            <div className={styles.statementPhoto}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={String(block.text || "")} loading="lazy" />
            </div>
          )}
        </section>
      );
    }

    /* ——— Картинка / галерея-лента ——— */
    case "images": {
      const imgs = Array.isArray(block.images) ? block.images : [];
      if (imgs.length === 0) return null;
      return (
        <section
          className={imgs.length > 1 ? styles.photoStrip : styles.singleImage}
        >
          {imgs.map((im: any, i: number) => {
            const src = imgSrc(im);
            if (!src) return null;
            return (
              <figure key={i} className={styles.figure}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={String(im.caption || `Moranti — ${i + 1}`)}
                  loading="lazy"
                />
                {im.caption && (
                  <figcaption className={styles.figcaption}>
                    {im.caption}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </section>
      );
    }

    /* ——— Карточки-ссылки («Moranti в жизни») ——— */
    case "cards": {
      const cards = Array.isArray(block.cards) ? block.cards : [];
      return (
        <section className={styles.life}>
          {block.title && (
            <h2 className={styles.sectionTitleCenter}>{block.title}</h2>
          )}
          <div className={styles.lifeGrid}>
            {cards.map((c: any, i: number) => {
              const inner = (
                <>
                  {c.name && <span className={styles.lifeName}>{c.name}</span>}
                  {c.subtitle && (
                    <span className={styles.lifeModels}>{c.subtitle}</span>
                  )}
                  {c.text && <p className={styles.lifeText}>{c.text}</p>}
                </>
              );
              return c.href ? (
                <Link key={i} href={c.href} className={styles.lifeCard}>
                  {inner}
                </Link>
              ) : (
                <div key={i} className={styles.lifeCard}>
                  {inner}
                </div>
              );
            })}
          </div>
          {paragraphs(block.outro).map((p, i) => (
            <p key={`o${i}`} className={styles.body}>
              {p}
            </p>
          ))}
        </section>
      );
    }

    /* ——— Призыв к действию ——— */
    case "cta": {
      const buttons = Array.isArray(block.buttons) ? block.buttons : [];
      const count = data?.products?.length ?? 0;
      const fill = (s?: unknown) =>
        typeof s === "string" ? s.replace(/\{count\}/g, String(count)) : s;
      return (
        <section className={styles.cta}>
          {block.title && <h2 className={styles.ctaTitle}>{fill(block.title)}</h2>}
          {block.text && <p className={styles.ctaDesc}>{fill(block.text)}</p>}
          {buttons.length > 0 && (
            <div className={styles.ctaActions}>
              {buttons.map((btn: any, i: number) =>
                btn.style === "secondary" ? (
                  <Link key={i} href={btn.href || "#"} className={styles.ctaSecondary}>
                    {btn.label}
                  </Link>
                ) : (
                  <Link key={i} href={btn.href || "#"} className={styles.ctaBtn}>
                    {btn.label}
                  </Link>
                ),
              )}
            </div>
          )}
        </section>
      );
    }

    default:
      return null;
  }
}

/* ---------- список блоков ---------- */

export function RenderBlocks({
  blocks,
  data,
}: {
  blocks?: any[];
  data?: { products?: any[] };
}) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;
  return (
    <>
      {blocks.map((b, i) => (
        <RenderBlock key={i} block={b} data={data} />
      ))}
    </>
  );
}

/* ---------- страница целиком (крошки + блоки) ---------- */

interface PageViewProps {
  slug: string;
  /** Название текущей страницы в хлебных крошках */
  breadcrumbLabel?: string;
}

export default async function PageView({
  slug,
  breadcrumbLabel,
}: PageViewProps) {
  const page = await getPage(slug);

  if (!page) {
    return (
      <div className={styles.page}>
        <div className="container">
          <p className={styles.empty}>Содержимое страницы скоро появится.</p>
        </div>
      </div>
    );
  }

  const blocks = Array.isArray(page.layout) ? page.layout : [];
  // Если первый блок не хиро — рисуем H1 из названия страницы
  const needsTitle = blocks[0]?.blockType !== "hero";

  return (
    <div className={styles.page}>
      <div className="container">
        <nav className={styles.breadcrumb} aria-label="Хлебные крошки">
          <Link href="/" className={styles.breadcrumbLink}>
            Главная
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>
            {breadcrumbLabel || page.title}
          </span>
        </nav>

        {needsTitle && (
          <h1 className={styles.pageTitle}>{page.title}</h1>
        )}

        <article>
          <RenderBlocks blocks={blocks} />
        </article>

        {blocks.length === 0 && (
          <p className={styles.empty}>
            Содержимое страницы скоро появится.
          </p>
        )}
      </div>
    </div>
  );
}
