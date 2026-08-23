import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";
import { seoConfig } from "@/config/seo";
import { buildBreadcrumbJsonLd } from "@/lib/seo-jsonld";
import SmartImage from "@/components/ui/smart-image";

const { title, description } = seoConfig.pages.about;

const siteUrl = process.env.SITE_URL || "http://localhost:3001";

export const revalidate = 3600;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: `${title} — Moranti`,
    description,
    url: "/about",
  },
};

/* ─── Фотографии бренда (public/about).
   Порядок можно менять — просто переставьте пути:
   [0] Hero (полная ширина)      [1] «Не следуем трендам»
   [2] Макро кожи                [3..5] Лента деталей        ─── */
const PHOTOS = [
  "/about/bag-4.jpg",
  "/about/bag-2.jpg",
  "/about/bag-1.jpg",
  "/about/bag-3.jpg",
  "/about/bag-5.jpg",
  "/about/bag-6.jpg",
];

/* ——— Сценарии «Moranti в жизни» (перелинковка с категориями) ——— */
const SCENARIOS = [
  {
    name: "Город",
    models: "Кросс-боди · небольшая сумка",
    text: "Для дней, когда нужно взять главное и двигаться дальше.",
    href: "/catalog/crossbody",
  },
  {
    name: "Работа",
    models: "Тоут · шопер",
    text: "Вместительное пространство для всего, что должно быть под рукой.",
    href: "/catalog/tote",
  },
  {
    name: "Вечер",
    models: "Багет · компактная модель",
    text: "Минимум лишнего. Выразительный силуэт.",
    href: "/catalog/baguette",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbJsonLd(
              [
                { name: "Главная", path: "/" },
                { name: "О бренде", path: "/about" },
              ],
              siteUrl,
            ),
          ),
        }}
      />

      <div className={styles.page}>
        {/* ——— 1. Hero ——— */}
        <section className={styles.hero}>
          <div className="container">
            <p className={styles.heroBrand}>Moranti</p>
            <h1 className={styles.heroTitle}>
              Сумки, которые остаются актуальными
            </h1>
            <p className={styles.heroSub}>
              Натуральная итальянская кожа. Сдержанные формы. Ручная работа и
              внимание к деталям.
            </p>
            <p className={styles.heroIntro}>
              Moranti — это сумки для тех, кто ценит качество материалов,
              выразительную форму и вещи, которые легко становятся частью
              повседневного гардероба.
            </p>
          </div>
          <div className={styles.heroImageWrap}>
            <SmartImage
              src={PHOTOS[0]}
              alt="Сумка Moranti из натуральной итальянской кожи"
              className={styles.heroImage}
              width={1600}
              height={900}
              priority
            />
          </div>
          <p className={styles.heroCaption}>
            Italian leather · Handcrafted · Made in Italy
          </p>
        </section>

        {/* ——— 2. Не следуем трендам ——— */}
        <section className={styles.trends}>
          <div className={`container ${styles.trendsGrid}`}>
            <div className={styles.trendsText}>
              <h2 className={styles.bigStatement}>
                Не следуем трендам.
                <br />
                Выбираем форму,
                <br />
                которая остаётся.
              </h2>
              <p className={styles.body}>
                Мы создаём Moranti вокруг идеи вневременного дизайна. Чистые
                линии, спокойные оттенки и натуральные материалы позволяют
                сумкам легко сочетаться с разными образами — сегодня, в
                следующем сезоне и спустя годы.
              </p>
              <p className={styles.body}>
                Мы не стремимся сделать вещь заметной любой ценой. Нам важнее
                создать форму, к которой хочется возвращаться.
              </p>
            </div>
            <div className={styles.trendsPhoto}>
              <SmartImage
                src={PHOTOS[1]}
                alt="Лаконичная форма сумки Moranti"
                className={styles.photo}
                width={600}
                height={750}
              />
            </div>
          </div>
        </section>

        {/* ——— 3. Итальянская кожа ——— */}
        <section className={styles.leather}>
          <div className={`container ${styles.leatherGrid}`}>
            <div className={styles.leatherPhoto}>
              <SmartImage
                src={PHOTOS[2]}
                alt="Фактура натуральной кожи Moranti"
                className={styles.photo}
                width={600}
                height={750}
              />
              <p className={styles.photoCaption}>
                Natural leather
                <br />
                тактильность · долговечность · характер
              </p>
            </div>
            <div className={styles.leatherText}>
              <h2 className={styles.sectionTitle}>
                Итальянская кожа — в основе каждой Moranti
              </h2>
              <p className={styles.body}>
                Каждая сумка Moranti изготавливается в Италии из натуральной
                кожи и замши.
              </p>
              <p className={styles.body}>
                Мы тщательно выбираем материалы и обращаем внимание на их
                фактуру, плотность и тактильные свойства. Натуральная кожа со
                временем меняется: становится мягче, приобретает глубину цвета
                и характер, сохраняя свою естественную красоту.
              </p>
            </div>
          </div>
        </section>

        {/* ——— 4. Ручная работа ——— */}
        <section className={styles.handmade}>
          <div className="container">
            <h2 className={styles.sectionTitle}>
              Ручная работа — внимание к каждой детали
            </h2>
            <div className={styles.handmadeInner}>
              <p className={styles.body}>
                Сумки Moranti собираются вручную. Мы уделяем особое внимание
                тому, что формирует качество вещи: аккуратности швов, обработке
                кожи, фурнитуре, соединению деталей и посадке элементов.
              </p>
              <p className={styles.body}>
                Для нас ручная работа — не просто способ производства. Это
                возможность контролировать детали, которые невозможно оценить
                по фотографии, но которые чувствуются каждый раз, когда вы
                берёте сумку в руки.
              </p>
            </div>
          </div>
        </section>

        {/* ——— 5. Красота в деталях ——— */}
        <section className={styles.details}>
          <div className="container">
            <h2 className={styles.bigStatement}>
              Хорошая сумка —<br />
              это не только форма.
            </h2>
            <p className={`${styles.body} ${styles.detailsLead}`}>
              Внешний силуэт — только начало. Мы продумываем то, как сумка
              открывается, как лежит на плече, насколько удобно расположены
              ручки, ремни, карманы и внутренние отделения. Фурнитура, швы,
              подкладка и каждая линия конструкции должны работать вместе,
              чтобы сумкой было удобно пользоваться каждый день.
            </p>
            <div className={styles.detailsStrip}>
              {PHOTOS.slice(3).map((src, i) => (
                <div key={src} className={styles.detailsItem}>
                  <SmartImage
                    src={src}
                    alt={`Детали сумки Moranti — ${i + 1}`}
                    className={styles.photo}
                    width={500}
                    height={620}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ——— 6. Moranti в жизни ——— */}
        <section className={styles.life}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Для разных дней. В одном стиле.</h2>
            <div className={styles.lifeGrid}>
              {SCENARIOS.map((s) => (
                <Link key={s.name} href={s.href} className={styles.lifeCard}>
                  <span className={styles.lifeName}>{s.name}</span>
                  <span className={styles.lifeModels}>{s.models}</span>
                  <p className={styles.lifeText}>{s.text}</p>
                </Link>
              ))}
            </div>
            <p className={styles.lifeOutro}>
              Разные формы и сценарии — единый подход к качеству и эстетике
              Moranti.
            </p>
          </div>
        </section>

        {/* ——— 7. Философия ——— */}
        <section className={styles.philosophy}>
          <div className="container">
            <p className={styles.philosophyStatement}>
              Moranti — вещи,
              <br />
              которые остаются.
            </p>
            <p className={styles.body}>
              Мы верим в дизайн, который не зависит от одного сезона. В
              натуральные материалы, которые красиво стареют. В ручную работу,
              которую можно почувствовать. В продуманные формы, которые легко
              вписываются в разные образы.
            </p>
            <p className={styles.body}>
              Moranti создаётся для того, чтобы сумка была не просто
              аксессуаром, а вещью, к которой хочется возвращаться.
            </p>
          </div>
        </section>

        {/* ——— 8. CTA ——— */}
        <section className={styles.cta}>
          <div className="container">
            <h2 className={styles.ctaTitle}>Найдите свою Moranti</h2>
            <p className={styles.ctaDesc}>
              Откройте коллекцию и выберите сумку, которая станет частью вашего
              повседневного стиля.
            </p>
            <div className={styles.ctaActions}>
              <Link href="/catalog" className={styles.ctaBtn}>
                Смотреть коллекцию →
              </Link>
              <Link href="/delivery" className={styles.ctaSecondary}>
                Доставка и оплата
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
