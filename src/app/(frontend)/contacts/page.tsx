import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";
import { seoConfig } from "@/config/seo";
import { legalInfo } from "@/config/legal";
import AskQuestionButton from "./ask-question-cta";
import { MARKETPLACE_URLS } from "@/lib/marketplaces";
import { buildBreadcrumbJsonLd } from "@/lib/seo-jsonld";

const { title, description } = seoConfig.pages.contacts;

const siteUrl = process.env.SITE_URL || "http://localhost:3001";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/contacts",
  },
  openGraph: {
    title: `${title} — Moranti`,
    description,
    url: "/contacts",
  },
};

export default function ContactsPage() {
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
                { name: "Контакты", path: "/contacts" },
              ],
              siteUrl,
            ),
          ),
        }}
      />
      <div className={styles.page}>
        <nav className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>
            Главная
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>Контакты</span>
        </nav>

        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>Контакты</h1>
          <p className={styles.heroDesc}>
            Вопросы по заказам, возвратам и качеству изделий — напишите нам,
            ответим на вашу почту.
          </p>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>01</span>
            <h2 className={styles.sectionTitle}>Связь</h2>
            <div className={styles.sectionRule} />
          </div>
          <div className={styles.body}>
            <p className={styles.text}>
              Расскажите, что интересует — и оставьте email для ответа в
              форме ниже. Письмо придёт напрямую владельцу магазина.
            </p>
            <p className={styles.text}>
              Или пишите напрямую:{" "}
              <a className={styles.link} href="mailto:info@morantibags.ru">
                info@morantibags.ru
              </a>
            </p>
            <AskQuestionButton />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>02</span>
            <h2 className={styles.sectionTitle}>Где купить</h2>
            <div className={styles.sectionRule} />
          </div>
          <div className={styles.body}>
            <p className={styles.text}>
              Заказ, оплата, доставка и возврат осуществляются на маркетплейсах
              по их правилам:
            </p>
            <ul className={styles.list}>
              <li>
                <a
                  className={styles.link}
                  href={MARKETPLACE_URLS.wbSeller}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Wildberries — магазин Moranti
                </a>
              </li>
              <li>
                <a
                  className={styles.link}
                  href={MARKETPLACE_URLS.ozonSeller}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ozon — магазин Moranti
                </a>
              </li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>03</span>
            <h2 className={styles.sectionTitle}>Документы</h2>
            <div className={styles.sectionRule} />
          </div>
          <div className={styles.body}>
            <p className={styles.text}>
              <Link href="/privacy" className={styles.link}>
                Политика конфиденциальности
              </Link>{" "}
              — какие данные обрабатывает сайт и как отозвать согласие.
            </p>
          </div>
        </section>

        {/* Реквизиты — мелко, в конце страницы */}
        <footer className={styles.requisites}>
          {legalInfo.operatorName} · ОГРНИП {legalInfo.ogrnip} · ИНН{" "}
          {legalInfo.inn}
        </footer>
      </div>
    </>
  );
}
