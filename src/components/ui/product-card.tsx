"use client";

import { Product } from "@/data/products";
import { useFavorites } from "@/lib/favorites-context";
import ProductImageCarousel from "./product-image-carousel";
import ProductFavoriteButton from "./product-favorite-button";
import ProductCartButton from "./cart-button";
import ProductInfo from "./product-info";
import styles from "./product-card.module.css";

interface ProductCardProps {
  product: Product;
  /** Загружать изображение приоритетно (для LCP — первый ряд карточек) */
  priority?: boolean;
}

const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;
// «Сейчас» фиксируется один раз при загрузке модуля (окно новинок — 90 дней,
// точность до перезагрузки бандла/сервера неважна). Прямой вызов Date.now()
// в теле рендера запрещён правилом react-no-impure-render.
const NOW = Date.now();

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isArchived = Boolean(product.archivedAt);
  const isOutOfStock = product.inStock === false || isArchived;
  const isFavorited = isFavorite(product.wbArticle);

  const isNew =
    !!product.wbCreatedAt &&
    NOW - new Date(product.wbCreatedAt).getTime() <= THREE_MONTHS_MS;

  return (
    <article className={styles.card}>
      {isNew && <span className={styles.badge}>Новинка</span>}
      <ProductImageCarousel
        product={product}
        priority={priority}
        isArchived={isArchived}
        isOutOfStock={isOutOfStock}
      >
        <ProductFavoriteButton
          isFavorited={isFavorited}
          onToggle={() => toggleFavorite(product.wbArticle)}
        />
      </ProductImageCarousel>

      <ProductInfo
        link={`/catalog/${product.slug}`}
        name={product.name}
        price={product.price}
        originalPrice={product.originalPrice}
        rating={product.rating}
        isArchived={isArchived}
        isOutOfStock={isOutOfStock}
      />

      {!isOutOfStock && (
        <div className={styles.cardActions}>
          <ProductCartButton product={product} />
          <ProductFavoriteButton
            isFavorited={isFavorited}
            onToggle={() => toggleFavorite(product.wbArticle)}
            variant="square"
          />
        </div>
      )}
    </article>
  );
}
