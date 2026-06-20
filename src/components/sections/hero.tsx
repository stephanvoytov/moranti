import Link from "next/link";
import styles from "./hero.module.css";

interface HeroSettings {
  title: string;
  tagline: string;
  subtitle: string;
  image: string;
}

export default function Hero({ settings }: { settings: HeroSettings }) {
  return (
    <section className={styles.hero}>
      {/* Фоновое изображение поверх градиента (если есть) */}
      {settings.image && settings.image.length > 0 && (
        <img
          src={settings.image}
          alt=""
          className={styles.heroBg}
          fetchPriority="high"
        />
      )}
      <div className={styles.overlay} />
      <div className={styles.content}>
        <p className={styles.kicker}>{settings.subtitle || "Премиальный бренд женских сумок"}</p>
        <h1 className={styles.title}>{settings.title}</h1>
        <p className={styles.tagline}>{settings.tagline}</p>
        <Link href="/catalog" className={styles.cta}>
          Смотреть коллекцию
        </Link>
      </div>
    </section>
  );
}
