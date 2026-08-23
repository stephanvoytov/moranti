import { MARKETPLACE_URLS } from "@/lib/marketplaces";
import { legalInfo } from "@/config/legal";
import { readSettings } from "@/lib/settings";
import Link from "next/link";
import styles from "./footer.module.css";
import NewsletterForm from "./newsletter-form";

export default async function Footer() {
  const settings = await readSettings();
  const social = settings.social ?? { vk: "", telegram: "", whatsapp: "" };

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <div className={styles.brand}>Moranti</div>
            <p className={styles.desc}>
              Сумки из натуральной итальянской кожи. Минималистичные формы,
              ручная работа, без кричащих логотипов.
            </p>
            <p className={styles.contactEmail}>
              <a href="mailto:info@morantibags.ru">info@morantibags.ru</a>
            </p>
            <NewsletterForm />
          </div>

          <div className={styles.col}>
            <h3>Каталог</h3>
            <Link href="/catalog">Все модели</Link>
            <Link href="/catalog/crossbody">Кросс-боди</Link>
            <Link href="/catalog/na-plecho">На плечо</Link>
            <Link href="/catalog/baguette">Багет</Link>
            <Link href="/catalog/tote">Тоут</Link>
            <Link href="/catalog/saddle">Седло</Link>
            <Link href="/catalog/backpack">Рюкзаки</Link>
          </div>

          <div className={styles.col}>
            <h3>Информация</h3>
            <Link href="/info">Вся информация</Link>
            <Link href="/about">О бренде</Link>
            <Link href="/reviews">Отзывы</Link>
            <Link href="/delivery">Доставка и оплата</Link>
            <Link href="/care">Уход за сумками</Link>
            <Link href="/contacts">Контакты</Link>
            <Link href="/privacy">Политика конфиденциальности</Link>
          </div>

          <div className={styles.col}>
            <h3>Магазины и соцсети</h3>
            <a href={MARKETPLACE_URLS.wbSeller} target="_blank" rel="noopener noreferrer">
              Wildberries
            </a>
            <a href={MARKETPLACE_URLS.ozonSeller} target="_blank" rel="noopener noreferrer">
              Ozon
            </a>
            {social.vk && (
              <a href={social.vk} target="_blank" rel="noopener noreferrer">
                VK
              </a>
            )}
            {social.telegram && (
              <a href={social.telegram} target="_blank" rel="noopener noreferrer">
                Telegram
              </a>
            )}
            {social.whatsapp && (
              <a href={social.whatsapp} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            )}
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.legal}>
            <span>&copy; {new Date().getFullYear()} Moranti. Все права защищены.</span>
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
