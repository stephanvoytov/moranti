import Link from "next/link";
import HeroImage from "./hero-image";
import styles from "./hero.module.css";

interface HeroSettings {
  title: string;
  tagline: string;
  subtitle: string;
  image: string;
  imageMobile: string;
}

export default function Hero({ settings }: { settings: HeroSettings }) {
  return (
    <section className={styles.hero}>
      {/* Фоновое изображение поверх градиента (если есть).
          Desktop и mobile — разные картинки: показываем по media-query. */}
      {settings.image && settings.image.length > 0 && (
        <HeroImage src={settings.image} variant="desktop" />
      )}
      {settings.imageMobile && settings.imageMobile.length > 0 && (
        <HeroImage src={settings.imageMobile} variant="mobile" />
      )}
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h1 className={styles.title}>{settings.title}</h1>
        <p className={styles.tagline}>{settings.tagline}</p>
        <Link href="/catalog" className={styles.cta}>
          Смотреть коллекцию
        </Link>
      </div>
    </section>
  );
}