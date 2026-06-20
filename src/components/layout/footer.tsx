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
              никаких кричащих логотипов.
            </p>
          </div>
          <div className={styles.col}>
            <h4>Коллекции</h4>
            <a href="/catalog?category=shoulder">Через плечо</a>
            <a href="/catalog?category=tote">Тоут</a>
            <a href="/catalog?category=backpack">Рюкзаки</a>
            <a href="/catalog?category=mini">Мини и клатчи</a>
          </div>
          <div className={styles.col}>
            <h4>Помощь</h4>
            <a href="/about">Доставка и возврат</a>
            <a href="/about">Уход за сумками</a>
            <a href="/about">Гарантия</a>
            <a href="/about">Контакты</a>
          </div>
          <div className={styles.col}>
            <h4>Магазины</h4>
            <a href="https://www.wildberries.ru/brands/moranti" target="_blank" rel="noopener noreferrer">Wildberries</a>
            <a href="https://www.ozon.ru/seller/moranti/?miniapp=seller_4205030" target="_blank" rel="noopener noreferrer">Ozon</a>
            <a href="https://www.instagram.com/_utrends/" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://vk.com/moranti_bags" target="_blank" rel="noopener noreferrer">VK</a>
          </div>
          <div className={styles.col}>
            <h4>О бренде</h4>
            <a href="/about">Наша история</a>
          </div>
        </div>
        <div className={styles.bottom}>
          <span>&copy; {new Date().getFullYear()} Moranti. Все права защищены.</span>
          <div className={styles.social}>
            <a href="https://www.instagram.com/_utrends/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram</a>
            <a href="https://vk.com/moranti_bags" target="_blank" rel="noopener noreferrer" aria-label="VK">VK</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
