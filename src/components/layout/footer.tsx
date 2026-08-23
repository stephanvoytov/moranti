import { MARKETPLACE_URLS } from "@/lib/marketplaces";
import { legalInfo } from "@/config/legal";
import Link from "next/link";
import styles from "./footer.module.css";
import NewsletterForm from "./newsletter-form";
import type { SiteContentData } from "@/lib/site-content";

const SOCIAL_LABELS: Record<string, string> = {
  vk: "VK",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
};

export default function Footer({ siteContent }: { siteContent: SiteContentData }) {
  const { footer, contacts, social } = siteContent;
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div>
            <div className={styles.brand}>Moranti</div>
            <p className={styles.desc}>
              {footer.aboutText ||
                "Сумки из натуральной итальянской кожи. Минималистичные формы, ручная работа."}
            </p>
            {contacts.email && (
              <p className={styles.contactEmail}>
                <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
              </p>
            )}
            {contacts.phone && (
              <p className={styles.contactEmail}>
                <a href={`tel:${contacts.phone.replace(/[^+\d]/g, "")}`}>
                  {contacts.phone}
                </a>
              </p>
            )}
            <NewsletterForm />
          </div>
          <div className={styles.col}>
            <h3>Коллекции</h3>
            <Link href="/catalog/crossbody">Кросс-боди</Link>
            <Link href="/catalog/na-plecho">На плечо</Link>
            <Link href="/catalog/baguette">Багет</Link>
            <Link href="/catalog/tote">Тоут</Link>
            <Link href="/catalog/saddle">Седло</Link>
            <Link href="/catalog/backpack">Рюкзаки</Link>
          </div>
          <div className={styles.col}>
            <h3>Помощь</h3>
            <Link href="/about">О бренде</Link>
            <Link href="/delivery">Доставка и оплата</Link>
            <Link href="/care">Уход за сумками</Link>
            <Link href="/privacy">Политика конфиденциальности</Link>
            <Link href="/contacts">Контакты</Link>
          </div>
          <div className={styles.col}>
            <h3>Магазины</h3>
            <a href={MARKETPLACE_URLS.wbSeller} target="_blank" rel="noopener noreferrer">
              Wildberries
            </a>
            <a href={MARKETPLACE_URLS.ozonSeller} target="_blank" rel="noopener noreferrer">
              Ozon
            </a>
            {social
              .filter((s) => s.url)
              .map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {SOCIAL_LABELS[s.platform] || s.platform}
                </a>
              ))}
          </div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.legal}>
            <span>{footer.copyright || `© ${year} Moranti. Все права защищены.`}</span>
            <span>
              {legalInfo.shortName} · ОГРНИП {legalInfo.ogrnip} · ИНН {legalInfo.inn}
            </span>
          </div>
          <div className={styles.social}>
            <a
              className={styles.credit}
              href="https://stefanvoytov.ru"
              target="_blank"
              rel="noopener noreferrer"
            >
              Сделать такой же сайт →
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
