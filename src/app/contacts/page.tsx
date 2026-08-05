import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";
import { seoConfig } from "@/config/seo";
import { legalInfo, CONTACT_URLS } from "@/config/legal";
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
            Реквизиты продавца и способы связи с Moranti.
          </p>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>01</span>
            <h2 className={styles.sectionTitle}>Реквизиты</h2>
            <div className={styles.sectionRule} />
          </div>
          <div className={styles.body}>
            <p className={styles.text}>{legalInfo.operatorName}</p>
            <ul className={styles.list}>
              <li>ОГРНИП {legalInfo.ogrnip}</li>
              <li>ИНН {legalInfo.inn}</li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>02</span>
            <h2 className={styles.sectionTitle}>Связь</h2>
            <div className={styles.sectionRule} />
          </div>
          <div className={styles.body}>
            <p className={styles.text}>
              Вопросы по заказам, возвратам и качеству изделий — через VK:{" "}
              <a
                className={styles.link}
                href={CONTACT_URLS.vk}
                target="_blank"
                rel="noopener noreferrer"
              >
                vk.com/moranti_bags
              </a>
              .
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>03</span>
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
            <span className={styles.sectionNumber}>04</span>
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
      </div>
    </>
  );
}
