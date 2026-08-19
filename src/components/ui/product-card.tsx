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

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isArchived = Boolean(product.archivedAt);
  const isOutOfStock = product.inStock === false || isArchived;
  const isFavorited = isFavorite(product.wbArticle);

  return (
    <article className={styles.card}>
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

      {!isOutOfStock && <ProductCartButton product={product} />}
    </article>
  );
}
