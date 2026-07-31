import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>Страница не найдена</h1>
        <p className={styles.text}>
          Возможно, товар закончился или ссылка устарела. Загляните в каталог —
          там всегда есть что выбрать.
        </p>
        <div className={styles.actions}>
          <Link href="/catalog" className={styles.primary}>
            Перейти в каталог
          </Link>
          <Link href="/" className={styles.secondary}>
            На главную
          </Link>
        </div>
      </div>
    </main>
  );
}
