import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";
import { seoConfig } from "@/config/seo";
import { legalInfo } from "@/config/legal";
import AskQuestionButton from "./ask-question-cta";
import { MARKETPLACE_URLS } from "@/lib/marketplaces";
import { buildBreadcrumbJsonLd } from "@/lib/seo-jsonld";
import PageView from "@/components/sections/page-view";

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

      {/* Текст страницы редактируется в админке → Страницы → Контакты */}
      <PageView slug="kontakty" breadcrumbLabel="Контакты" />

      <div className={styles.page}>
        <div className="container">
          {/* Форма «Задать вопрос» — функциональный блок */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>01</span>
              <h2 className={styles.sectionTitle}>Задать вопрос</h2>
              <div className={styles.sectionRule} />
            </div>
            <div className={styles.body}>
              <AskQuestionButton />
            </div>
          </section>

          {/* Маркетплейсы — ссылки из единого конфига */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>02</span>
              <h2 className={styles.sectionTitle}>Где купить</h2>
              <div className={styles.sectionRule} />
            </div>
            <div className={styles.body}>
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

          {/* Реквизиты — мелко, в конце страницы */}
          <footer className={styles.requisites}>
            {legalInfo.operatorName} · ОГРНИП {legalInfo.ogrnip} · ИНН{" "}
            {legalInfo.inn}
          </footer>
        </div>
      </div>
    </>
  );
}
