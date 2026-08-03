"use client";

import Image from "next/image";
import { blobUrl } from "@/lib/blob";
import styles from "./hero.module.css";

/**
 * Клиентская обёртка hero-картинки: ловит ошибки загрузки (404, CSP-блок,
 * битый файл) и логирует их — иначе сбой происходит молча, без следов.
 * При ошибке прячет <img>, чтобы показался градиентный fallback.
 *
 * variant: "desktop" | "mobile" — разные картинки для ПК и телефона.
 * Показываются по media-query (см. hero.module.css).
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
      className={className}
      priority
      onError={(e) => {
        console.error(`[hero] ${variant} image failed to load:`, src);
        e.currentTarget.style.display = "none";
      }}
    />
  );
}