"use client";

import Image from "next/image";
import styles from "./hero.module.css";

/**
 * Клиентская обёртка hero-картинки: ловит ошибки загрузки (404, CSP-блок,
 * битый файл) и логирует их — иначе сбой происходит молча, без следов.
 * При ошибке прячет <img>, чтобы показался градиентный fallback.
 */
export default function HeroImage({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      fill
      className={styles.heroBg}
      priority
      onError={(e) => {
        console.error("[hero] image failed to load:", src);
        e.currentTarget.style.display = "none";
      }}
    />
  );
}