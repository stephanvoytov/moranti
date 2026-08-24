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

export default function Hero({
  settings,
  buttonLabel = "Смотреть коллекцию",
  buttonHref = "/catalog",
}: {
  settings: HeroSettings;
  buttonLabel?: string;
  buttonHref?: string;
}) {
  return (
    <section className={styles.hero}>
      {/* Фоновое изображение поверх градиента (если есть).
          Desktop и mobile — разные картинки: показываем по media-query.
          Если мобильной нет — фолбэк на desktop-картинку (иначе на
          телефоне hero останется без фото). */}
      {settings.image && settings.image.length > 0 && (
        <HeroImage src={settings.image} variant="desktop" />
      )}
      {(settings.imageMobile || settings.image) && (
        <HeroImage
          src={settings.imageMobile || settings.image}
          variant="mobile"
        />
      )}
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h1 className={styles.title}>{settings.title}</h1>
        <p className={styles.tagline}>{settings.tagline}</p>
      <Link href={buttonHref} className={styles.cta}>
        {buttonLabel}
      </Link>
      </div>
    </section>
  );
}