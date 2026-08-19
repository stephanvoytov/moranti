import { MARKETPLACE_URLS } from "@/lib/marketplaces";
import { legalInfo } from "@/config/legal";
import Link from "next/link";
import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div>
            <div className={styles.brand}>Moranti</div>
            <p className={styles.desc}>
              Сумки из натуральной итальянской кожи. Минималистичные формы,
              ручная работа.
            </p>
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
            <Link href="/delivery">Доставка и оплата</Link>
            <Link href="/care">Уход за сумками</Link>
            <Link href="/privacy">Политика конфиденциальности</Link>
            <Link href="/contacts">Контакты</Link>
          </div>
          <div className={styles.col}>
            <h3>Магазины</h3>
            <a href={MARKETPLACE_URLS.wbSeller} target="_blank" rel="noopener noreferrer">Wildberries</a>
            <a href={MARKETPLACE_URLS.ozonSeller} target="_blank" rel="noopener noreferrer">Ozon</a>
            <a href="https://vk.com/moranti_bags" target="_blank" rel="noopener noreferrer">VK</a>
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
            <a href="https://stefanvoytov.ru" target="_blank" rel="noopener noreferrer">Разработка сайта — Стефан В</a>
            <a href="https://vk.com/moranti_bags" target="_blank" rel="noopener noreferrer" aria-label="VK">VK</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
