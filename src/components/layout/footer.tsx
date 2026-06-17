import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <div className={styles.brand}>
            <h3 className={styles.logo}>Moranti</h3>
            <p className={styles.tagline}>
              Сумки, которые сочетают эстетику, удобство и качество натуральных материалов.
            </p>
          </div>
          <div className={styles.links}>
            <a
              href="https://www.instagram.com/_utrends/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Instagram
            </a>
            <a
              href="https://www.wildberries.ru/brands/moranti"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Wildberries
            </a>
            <a
              href="https://www.ozon.ru/seller/moranti/?miniapp=seller_4205030"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Ozon
            </a>
            <a
              href="https://vk.com/moranti_bags"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              VK
            </a>
          </div>
        </div>
        <div className={styles.bottom}>
          <span className={styles.copy}>
            &copy; {new Date().getFullYear()} Moranti. Все права защищены.
          </span>
        </div>
      </div>
    </footer>
  );
}
