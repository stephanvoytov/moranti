"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/data/products";
import styles from "./product-card.module.css";

interface ProductCartButtonProps {
  product: Product;
}

/** Кнопка «В корзину» на карточке товара.
 *  В корзине — ссылка на /cart (повторный клик не добавляет дубль). */
export default function ProductCartButton({ product }: ProductCartButtonProps) {
  const { qtyOf, addToCart } = useCart();
  const qty = qtyOf(product.wbArticle);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.wbArticle);
  };

  if (qty > 0) {
    return (
      <Link
        href="/cart"
        className={`${styles.cartBtn} ${styles.cartBtnActive}`}
        aria-label={`В корзине: ${product.name}`}
      >
        В корзине — {qty}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={styles.cartBtn}
      onClick={handleClick}
      aria-label={`Добавить в корзину: ${product.name}`}
    >
      В корзину
    </button>
  );
}