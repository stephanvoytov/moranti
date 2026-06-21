import type { Metadata } from "next";
import Link from "next/link";
import { readSettings } from "@/lib/settings";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Свяжитесь с Moranti — премиальный бренд женских сумок из натуральной кожи. Телефон, email, адрес.",
  openGraph: {
    title: "Контакты — Moranti",
    description: "Как связаться с брендом Moranti.",
    url: "/contacts",
  },
};

export default function ContactsPage() {
  const { contacts, social } = readSettings();

  return (
    <>
      {/* ——— Breadcrumb ——— */}
      <div className={styles.page}>
        <nav className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>
            Главная
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>Контакты</span>
        </nav>

        {/* ——— Hero ——— */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>Контакты</h1>
          <p className={styles.heroDesc}>
            Свяжитесь с нами любым удобным способом. Мы всегда на связи и готовы
            помочь с выбором.
          </p>
        </section>

        {/* ——— Contact cards ——— */}
        <div className={styles.grid}>
          {contacts.phone && (
            <div className={styles.card}>
              <span className={styles.cardLabel}>Телефон</span>
              <p className={styles.cardValue}>
                <a href={`tel:${contacts.phone.replace(/[^\d+]/g, "")}`}>
                  {contacts.phone}
                </a>
              </p>
            </div>
          )}

          {contacts.email && (
            <div className={styles.card}>
              <span className={styles.cardLabel}>Email</span>
              <p className={styles.cardValue}>
                <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
              </p>
            </div>
          )}

          {contacts.address && (
            <div className={styles.card}>
              <span className={styles.cardLabel}>Адрес</span>
              <p className={styles.cardValue}>{contacts.address}</p>
            </div>
          )}
        </div>

        {/* ——— Social links ——— */}
        {(social.instagram || social.vk || social.telegram || social.whatsapp) && (
          <section className={styles.socialSection}>
            <h2 className={styles.sectionTitle}>Социальные сети</h2>
            <div className={styles.socialList}>
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  Instagram
                </a>
              )}
              {social.vk && (
                <a
                  href={social.vk}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  VK
                </a>
              )}
              {social.telegram && (
                <a
                  href={social.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  Telegram
                </a>
              )}
              {social.whatsapp && (
                <a
                  href={social.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  WhatsApp
                </a>
              )}
            </div>
          </section>
        )}

        {/* ——— CTA ——— */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaRule} />
          <p className={styles.ctaDesc}>
            Посмотрите наши сумки в каталоге — или напишите нам, и мы поможем с
            выбором.
          </p>
          <Link href="/catalog" className={styles.ctaBtn}>
            Открыть каталог
          </Link>
        </section>
      </div>
    </>
  );
}
