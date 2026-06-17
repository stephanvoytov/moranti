import Link from "next/link";
import styles from "./hero.module.css";

interface HeroSettings {
  title: string;
  tagline: string;
  subtitle: string;
  image: string;
}

export default function Hero({ settings }: { settings: HeroSettings }) {
  const hasImage = settings.image && settings.image.length > 0;

  return (
    <section className={styles.hero}>
      <div className={styles.imageWrap}>
        {hasImage ? (
          <img
            src={settings.image}
            alt={settings.title}
            className={styles.imageFill}
            fetchPriority="high"
          />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
        <div className={styles.overlay}>
          <h1 className={styles.title}>{settings.title}</h1>
          <p className={styles.tagline}>{settings.tagline}</p>
          <p className={styles.subtitle}>{settings.subtitle}</p>
          <Link href="/catalog" className={styles.cta}>
            Смотреть коллекцию
          </Link>
        </div>
      </div>
    </section>
  );
}
