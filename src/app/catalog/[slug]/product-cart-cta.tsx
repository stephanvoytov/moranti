"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import styles from "./page.module.css";

interface ProductCartCtaProps {
  article: number;
}

/** Кнопка «В корзину» на странице товара — основной CTA (заливка).
 *  В корзине — ссылка на /cart. */
export default function ProductCartCta({ article }: ProductCartCtaProps) {
  const { qtyOf, addToCart } = useCart();
  const qty = qtyOf(article);

  if (qty > 0) {
    return (
      <Link href="/cart" className={styles.cartCtaActive}>
        В корзине — {qty}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={styles.cartCta}
      onClick={() => addToCart(article)}
    >
      В корзину
    </button>
  );
}