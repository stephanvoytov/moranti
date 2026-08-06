import Link from "next/link";
import { seoConfig } from "@/config/seo";
import styles from "./catalog-seo.module.css";

interface CatalogSeoProps {
  /** Слаг категории — уникальный текст под категорию; без слага — общий текст */
  category?: string;
}

/**
 * SEO-текст каталога: видимый блок после сетки товаров.
 * Без категории — общий текст; с категорией — текст из seoConfig.categories
 * и ссылки на остальные категории (перелинковка + якоря для поисковиков).
 */
export default function CatalogSeo({ category }: CatalogSeoProps) {
  const cat = category ? seoConfig.categories[category] : undefined;
  const cats = Object.entries(seoConfig.categories).filter(
    ([slug]) => slug !== category,
  );

  if (cat) {
    return (
      <section className={styles.section} aria-label={`О категории ${cat.name}`}>
        <div className="container">
          <h2 className={styles.title}>{cat.title.replace(" — Moranti", "")}</h2>
          <div className={styles.grid}>
            <p>{cat.description}</p>
            <p>
              Все модели категории доступны на Wildberries и Ozon — цена и
              наличие на страницах актуальные, доставка по всей России, возврат
              по правилам маркетплейса. Посмотрите также другие коллекции
              Moranti:
            </p>
            <div className={styles.links}>
              {cats.map(([slug, c]) => (
                <Link key={slug} href={`/catalog/${slug}`}>
                  {c.name}
                </Link>
              ))}
            </div>
            <p>
              Все сумки Moranti изготавливаются в Италии из натуральной кожи и
              замши с ручным контролем качества — поэтому они не теряют форму и
              со временем приобретают благородную патину. Если сомневаетесь в
              выборе — почитайте наши рекомендации по уходу за кожей и замшей.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-label="О каталоге Moranti">
      <div className="container">
        <h2 className={styles.title}>Каталог кожаных сумок Moranti</h2>
        <div className={styles.grid}>
          <p>
            В каталоге Moranti — женские сумки из натуральной итальянской кожи
            и замши: продуманный крой, благородные материалы и формы, которые
            остаются актуальными годами. Каждая модель изготавливается в Италии,
            а финальный контроль качества выполняется вручную, поэтому сумка не
            теряет форму и со временем приобретает благородную патину.
          </p>
          <p>
            Коллекция закрывает любые сценарии: компактные модели через плечо,
            вместительные сумки для работы и учёбы, элегантные варианты на
            выход. Ниже — категории, в которых удобно выбрать сумку под себя:
          </p>
          <div className={styles.links}>
            {cats.map(([slug, c]) => (
              <Link key={slug} href={`/catalog/${slug}`}>
                {c.name}
              </Link>
            ))}
          </div>
          <p>
            Все товары в наличии на Wildberries и Ozon — цена и остатки на
            страницах всегда актуальные, доставка по всей России, возврат по
            правилам маркетплейса. Купить сумку Moranti можно за пару кликов, а
            если сомневаетесь в выборе — почитайте наши рекомендации по уходу
            за кожей и замшей.
          </p>
        </div>
      </div>
    </section>
  );
}
