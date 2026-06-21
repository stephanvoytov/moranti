import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Уход за сумками",
  description:
    "Рекомендации по уходу за сумками Moranti из натуральной итальянской кожи и замши. Как чистить, хранить и продлить срок службы.",
  openGraph: {
    title: "Уход за сумками — Moranti",
    description: "Как ухаживать за сумками из натуральной кожи и замши.",
    url: "/care",
  },
};

export default function CarePage() {
  return (
    <>
      <div className={styles.page}>
        <nav className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>
            Главная
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>Уход за сумками</span>
        </nav>

        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>Уход за сумками</h1>
          <p className={styles.heroDesc}>
            Натуральная кожа и замша — материалы, которые живут и стареют
            красиво. Правильный уход сохранит их первозданный вид на долгие
            годы.
          </p>
        </section>

        {/* ——— Гладкая кожа ——— */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>01</span>
            <h2 className={styles.sectionTitle}>Гладкая и зернистая кожа</h2>
            <div className={styles.sectionRule} />
          </div>
          <div className={styles.body}>
            <p className={styles.text}>
              Большинство сумок Moranti изготавливается из итальянской
              натуральной кожи — гладкой или с зернистой фактурой. Это плотный,
              износостойкий материал, который при минимальном уходе сохраняет
              форму и цвет годами.
            </p>
            <p className={styles.text}>
              Пыль и лёгкие загрязнения удаляйте мягкой сухой тканью.
              Для более тщательной очистки используйте мусс или пену для
              натуральной кожи — нанесите на салфетку, а не на само изделие.
            </p>
            <p className={styles.text}>
              Если сумка намокла под дождём или снегом, промокните поверхность
              мягкой тканью и дайте высохнуть при комнатной температуре —
              вдали от батарей и прямых солнечных лучей. Не используйте
              фен.
            </p>
          </div>
        </section>

        {/* ——— Замша ——— */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>02</span>
            <h2 className={styles.sectionTitle}>Замша</h2>
            <div className={styles.sectionRule} />
          </div>
          <div className={styles.body}>
            <p className={styles.text}>
              Замша — благородный, но более капризный материал. Итальянская
              замша, которую мы используем, отличается мягкостью и бархатистой
              фактурой, но требует бережного отношения.
            </p>
            <p className={styles.text}>
              Регулярно проходитесь по поверхности специальной щёткой
              для замши — это убирает пыль и поднимает ворс. Для выведения
              пятен используйте ластик для замши или специальную пену.
              Жирные пятна аккуратно присыпьте тальком, оставьте на несколько
              часов, затем стряхните и расчешите ворс.
            </p>
            <p className={styles.text}>
              Избегайте контакта замши с водой. Для защиты от влаги
              используйте водоотталкивающий спрей для замши и нубука —
              наносите его сразу после покупки и обновляйте каждые несколько
              недель.
            </p>
          </div>
        </section>

        {/* ——— Хранение ——— */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>03</span>
            <h2 className={styles.sectionTitle}>Хранение</h2>
            <div className={styles.sectionRule} />
          </div>
          <div className={styles.body}>
            <p className={styles.text}>
              Каждая сумка Moranti поставляется с пылевым мешком. Используйте
              его для хранения — ткань пропускает воздух, в отличие от
              полиэтилена, и защищает от пыли.
            </p>
            <ul className={styles.list}>
              <li>Наполните сумку мягкой бумагой или тканью — это сохранит форму</li>
              <li>Храните в сухом месте при комнатной температуре</li>
              <li>Держите вдали от батарей, обогревателей и прямых солнечных лучей</li>
              <li>Не кладите тяжёлые предметы сверху на сумку</li>
              <li>Металлическую фурнитуру можно протирать сухой мягкой тканью</li>
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
