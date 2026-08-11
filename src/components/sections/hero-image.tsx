import Image from "next/image";
import { blobUrl } from "@/lib/blob";
import styles from "./hero.module.css";

/**
 * Серверный next/image для hero. ВАЖНО: компонент серверный (без "use client")
 * — только так next/image генерирует корректный <link rel="preload"> +
 * fetchpriority="high" для LCP. В клиентском компоненте preload не
 * генерировался (пустой href) — hero грузился в обычной очереди, LCP падал
 * до ~13 сек на медленном 4G.
 *
 * variant: "desktop" | "mobile" — разные картинки для ПК и телефона.
 * Показываются по media-query (см. hero.module.css). При ошибке загрузки
 * next/image прячет <img> сам — остаётся градиентный fallback (.overlay).
 */
export default function HeroImage({
  src,
  variant = "desktop",
}: {
  src: string;
  variant?: "desktop" | "mobile";
}) {
  const className =
    variant === "mobile" ? styles.heroBgMobile : styles.heroBg;

  return (
    <Image
      src={blobUrl(src)}
      alt=""
      fill
      sizes="100vw"
      className={className}
      priority
    />
  );
}