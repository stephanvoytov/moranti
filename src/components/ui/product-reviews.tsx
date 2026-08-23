/* =============================================
   Moranti — Product Reviews (секция на карточке)
   Показываем первые 4, остальные — по кнопке.
   ============================================= */

"use client";

import { useState } from "react";
import Link from "next/link";
import type { Review } from "@/data/products";
import styles from "./product-reviews.module.css";

const SOURCE_LABELS: Record<Review["source"], string> = {
  wb: "Wildberries",
  ozon: "Ozon",
};

const VISIBLE_COUNT = 4;
const STEP = 8;

function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ProductReviews({
  reviews,
  marketplaceLinks,
}: {
  reviews: Review[];
  marketplaceLinks?: { name: string; url: string }[];
}) {
  // Порядок приходит с сервера (рейтинг ↓, внутри — свежее сверху).
  // Дозируем выдачу порциями, чтобы не вываливать стену текста разом.
  const [visibleCount, setVisibleCount] = useState(VISIBLE_COUNT);

  if (reviews.length === 0) {
    return (
      <p className={styles.empty}>
        Отзывов пока нет.{" "}
        {marketplaceLinks?.length ? (
          <>
            Почитать опыт покупателей можно на{" "}
            {marketplaceLinks.map((m, i) => (
              <span key={m.name}>
                {i > 0 && " и "}
                <Link href={m.url} target="_blank" rel="noopener noreferrer">
                  {m.name}
                </Link>
              </span>
            ))}
            .
          </>
        ) : null}
      </p>
    );
  }

  const visible = reviews.slice(0, visibleCount);
  const hidden = reviews.length - visible.length;

  return (
    <div>
      <div className={styles.list}>
        {visible.map((r) => (
          <article key={r.id} className={styles.item}>
            <header className={styles.head}>
              <span className={styles.author}>{r.author || "Покупатель"}</span>
              {r.rating ? (
                <span className={styles.stars} aria-label={`Оценка ${r.rating} из 5`}>
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </span>
              ) : null}
              <time className={styles.date}>{formatDate(r.reviewedAt)}</time>
              <span className={styles.source}>{SOURCE_LABELS[r.source]}</span>
            </header>
            <p className={styles.text}>{r.text}</p>
            {(r.pros || r.cons) && (
              <div className={styles.prosCons}>
                {r.pros && (
                  <p>
                    <span className={styles.label}>Достоинства:</span>
                    {r.pros}
                  </p>
                )}
                {r.cons && (
                  <p>
                    <span className={styles.label}>Недостатки:</span>
                    {r.cons}
                  </p>
                )}
              </div>
            )}
          </article>
        ))}
      </div>

      {hidden > 0 ? (
        <button
          type="button"
          className={styles.moreBtn}
          onClick={() => setVisibleCount((n) => n + STEP)}
        >
          Показать ещё отзывы ({hidden})
        </button>
      ) : (
        reviews.length > VISIBLE_COUNT && (
          <button
            type="button"
            className={styles.moreBtn}
            onClick={() => setVisibleCount(VISIBLE_COUNT)}
          >
            Свернуть
          </button>
        )
      )}
    </div>
  );
}
