import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Доставка",
  description:
    "Как заказать и получить сумку Moranti. Доставка через Wildberries и Ozon.",
  openGraph: {
    title: "Доставка — Moranti",
    description: "Заказ и доставка сумок Moranti.",
    url: "/delivery",
  },
};

export default function DeliveryPage() {
  return (
    <>
      <div className={styles.page}>
        <nav className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>
            Главная
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>Доставка</span>
        </nav>

        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>Доставка</h1>
          <p className={styles.heroDesc}>
            Все сумки Moranti представлены на Wildberries и Ozon. Заказ
            оформляется напрямую на маркетплейсе — доставка, оплата и возврат
            регулируются правилами площадки.
          </p>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>01</span>
            <h2 className={styles.sectionTitle}>Как заказать</h2>
            <div className={styles.sectionRule} />
          </div>
          <div className={styles.body}>
            <p className={styles.text}>
              Выберите модель в каталоге и перейдите на Wildberries или Ozon.
              Каждая сумка поставляется в фирменной коробке с пылевым мешком.
              Отправка осуществляется в течение 1–2 рабочих дней.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>02</span>
            <h2 className={styles.sectionTitle}>Доставка и оплата</h2>
            <div className={styles.sectionRule} />
          </div>
          <div className={styles.body}>
            <p className={styles.text}>
              Доставка осуществляется по всей России через пункты выдачи,
              постаматы или курьером. Срок — от 3 до 7 дней. Стоимость
              рассчитывается маркетплейсом при оформлении заказа.
            </p>
            <p className={styles.text}>
              Оплата — картами, Apple Pay, Google Pay, СБП, наличными — через
              защищённые каналы маркетплейса. Все вопросы по оплате и
              доставке решаются через поддержку площадки.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>03</span>
            <h2 className={styles.sectionTitle}>Возврат</h2>
            <div className={styles.sectionRule} />
          </div>
          <div className={styles.body}>
            <p className={styles.text}>
              Возврат принимается в течение 14 дней. Сумка должна быть в
              оригинальной упаковке, без следов использования, с сохранением
              бирок и пылевого мешка. Оформляется через личный кабинет
              маркетплейса.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
