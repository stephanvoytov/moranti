"use client";

import Link from "next/link";
import { useCart, type CartItem } from "@/lib/cart-context";
import { useAllProducts } from "@/lib/use-products";
import type { Product } from "@/data/products";
import SmartImage from "@/components/ui/smart-image";
import styles from "./page.module.css";

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

interface CartRow {
  item: CartItem;
  product: Product;
}

export default function CartClient() {
  const { products } = useAllProducts();
  const { cart, count, itemsCount, setQty, removeFromCart, clearCart } =
    useCart();

  const rows: CartRow[] = cart
    .map((item) => {
      const product = products.find((p) => p.wbArticle === item.article);
      return product ? { item, product } : null;
    })
    .filter((r): r is CartRow => r != null);

  const total = rows.reduce(
    (sum, { item, product }) => sum + item.qty * product.price,
    0,
  );

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <header className={styles.header}>
          <span className={styles.label}>Корзина</span>
          <h1 className={styles.title}>
            {itemsCount > 0
              ? `${count} ${plural(count, "товар", "товара", "товаров")}`
              : "Корзина пуста"}
          </h1>
          {itemsCount > 0 && (
            <p className={styles.subtitle}>
              <button className={styles.clearBtn} onClick={clearCart}>
                Очистить корзину
              </button>
            </p>
          )}
        </header>

        {rows.length > 0 ? (
          <>
            <ul className={styles.list}>
              {rows.map(({ item, product }) => (
                <li key={item.article} className={styles.row}>
                  <Link
                    href={`/catalog/${product.slug}`}
                    className={styles.thumb}
                    aria-label={product.name}
                  >
                    <SmartImage
                      src={product.image}
                      alt={product.name}
                      width={260}
                      height={347}
                      className={styles.thumbImg}
                    />
                  </Link>

                  <div className={styles.rowInfo}>
                    <div className={styles.rowName}>
                      <Link href={`/catalog/${product.slug}`}>
                        {product.name}
                      </Link>
                    </div>
                    <div className={styles.rowPrice}>
                      <span className={styles.currentPrice}>
                        {product.price.toLocaleString("ru-RU")} ₽
                      </span>
                      {product.originalPrice > product.price && (
                        <span className={styles.oldPrice}>
                          {product.originalPrice.toLocaleString("ru-RU")} ₽
                        </span>
                      )}
                    </div>
                    <div className={styles.marketLinks}>
                      {product.marketplaces.map((mp) => (
                        <a
                          key={mp.name}
                          href={mp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.marketLink}
                        >
                          Купить на {mp.name}
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className={styles.rowQty}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => setQty(item.article, item.qty - 1)}
                      aria-label="Уменьшить количество"
                    >
                      −
                    </button>
                    <span className={styles.qtyValue}>{item.qty}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => setQty(item.article, item.qty + 1)}
                      aria-label="Увеличить количество"
                    >
                      +
                    </button>
                  </div>

                  <div className={styles.rowTotal}>
                    {(item.qty * product.price).toLocaleString("ru-RU")} ₽
                  </div>

                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.article)}
                    aria-label={`Убрать из корзины: ${product.name}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>

            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span>Итого</span>
                <span className={styles.summaryTotal}>
                  {total.toLocaleString("ru-RU")} ₽
                </span>
              </div>
              <p className={styles.summaryNote}>
                Заказ оформляется на Wildberries или Ozon — выберите площадку
                в строке каждого товара.
              </p>
            </div>
          </>
        ) : (
          <div className={styles.empty}>
            <p>В корзине пока пусто.</p>
            <Link href="/catalog" className={styles.catalogLink}>
              Перейти в каталог
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}