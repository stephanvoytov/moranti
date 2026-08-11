"use client";

import { useState } from "react";
import styles from "./brand-seo.module.css";

/**
 * SEO-текст главной: видимый, компактный блок перед футером.
 * Связывает кириллический бренд «Моранти» с латинским «Moranti»
 * и закрывает коммерческие запросы («сумки из итальянской кожи»).
 * Чистый контент для поисковиков — без скрытых приёмов.
 *
 * Абзацы показываются по одному (карусель с кнопками и точками),
 * но все остаются в DOM — поисковики видят полный текст.
 */
const PARAGRAPHS = [
  "Moranti (Моранти) — польский бренд женских сумок, в основе которого европейский взгляд на качество: продуманный крой, благородные материалы и формы, которые остаются актуальными годами. Мы сознательно отказываемся от кричащих логотипов и быстротечных трендов — вместо них фактура натуральной кожи, безупречные швы и сдержанная элегантность, которая говорит сама за себя.",
  "Каждая сумка Moranti изготавливается в Италии — стране, где кожевенное ремесло оттачивалось веками. Натуральная итальянская кожа проходит строгий отбор, а финальный контроль качества выполняется вручную. Именно поэтому сумка не теряет форму, сохраняет мягкость и со временем становится только красивее, приобретая благородную патину.",
  "В коллекциях — модели на любой сценарий жизни: компактные кросс-боди для города, вместительные тоуты и шоперы для работы и учёбы, элегантные сумки на плечо, модные багеты, уютные сёдла и практичные кожаные рюкзаки. Гладкая кожа и мягкая замша дополняют друг друга, позволяя собрать гардероб в едином стиле — от деловых встреч до путешествий.",
  "Продуманная фурнитура, регулируемые ремни, аккуратные внутренние отделения и карманы — в каждой модели есть место деталям, которые делают сумку по-настоящему удобной. Уход не требует специальных усилий: натуральная кожа долго радует видом при бережном хранении, а наши рекомендации по уходу помогут продлить её безупречное состояние на долгие годы.",
  "Купить сумки Moranti можно через Wildberries и Ozon с доставкой по всей России — заказ придёт за пару дней, а возврат оформляется по правилам маркетплейса. На страницах товара всегда актуальные цена и наличие. Выберите сумку, которая будет с вами каждый день, или подарите её близким: подлинные материалы, итальянское исполнение и узнаваемый стиль — всё, что нужно для спокойной и приятной покупки.",
];

export default function BrandSeo() {
  const [index, setIndex] = useState(0);
  const total = PARAGRAPHS.length;

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  return (
    <section className={styles.section} aria-label="О бренде Moranti">
      <div className="container">
        <h2 className={styles.title}>
          Moranti — сумки из натуральной итальянской кожи
        </h2>

        <div className={styles.storyWrap}>
          <button
            type="button"
            className={styles.arrow}
            onClick={prev}
            aria-label="Предыдущий абзац"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className={styles.story}>
            {PARAGRAPHS.map((text, i) => (
              <p
                key={i}
                className={i === index ? styles.active : styles.inactive}
                aria-hidden={i !== index}
              >
                {text}
              </p>
            ))}
          </div>

          <button
            type="button"
            className={styles.arrow}
            onClick={next}
            aria-label="Следующий абзац"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        <div className={styles.controls}>
          {/* Это карусель точек, а не табы: role="tablist" без дочерних
              role="tab" ломал a11y-дерево (Lighthouse/агенты: "Certain ARIA
              roles must contain particular children"). Кнопки остаются
              доступными через aria-label. */}
          <div className={styles.dots}>
            {PARAGRAPHS.map((_, i) => (
              <button
                key={i}
                type="button"
                className={i === index ? styles.dotActive : styles.dot}
                onClick={() => setIndex(i)}
                aria-label={`Абзац ${i + 1} из ${total}`}
                aria-current={i === index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}