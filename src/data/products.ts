/* =============================================
   Moranti — Product Data (113 товаров, Wildberries)
   Источник: data/products.json (редактируется через админку)
   ============================================= */

import { readFileSync, existsSync } from "fs";
import path from "path";

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice: number;
  currency: string;
  category: string;
  description: string;
  image: string;
  images: string[];
  marketplaces: MarketplaceLink[];
  wbArticle: number;
  rating?: number;
  reviewsCount?: number;
}

export interface MarketplaceLink {
  name: "Wildberries" | "Ozon" | "Yandex Market";
  url: string;
  icon: string;
}

export interface ProductCategory {
  slug: string;
  name: string;
  description: string;
  image: string;
  count: number;
}

/* ——— Загрузка из JSON (серверная) ——— */

let _products: Product[] | null = null;
let _categories: ProductCategory[] | null = null;

function load(): void {
  if (_products) return;
  const jsonPath = path.join(process.cwd(), "data", "products.json");
  if (!existsSync(jsonPath)) {
    _products = [];
    _categories = [];
    return;
  }
  const raw = readFileSync(jsonPath, "utf-8");
  const data = JSON.parse(raw);
  _products = data.products;
  _categories = data.categories;
}

/* ——— Client-side exports (fallback, загружается при первой загрузке) ——— 
   Эти данные используются только серверными компонентами (SSG).
   Клиентские компоненты ("use client") получают данные через API.          */

export function getProducts(): Product[] {
  load();
  return _products!;
}

export function getProduct(slug: string): Product | null {
  load();
  return _products!.find((p) => p.slug === slug) ?? null;
}

export function getProductsByCategory(category: string): Product[] {
  load();
  return _products!.filter((p) => p.category === category);
}

export function getProductsByWbArticle(article: number): Product | null {
  load();
  return _products!.find((p) => p.wbArticle === article) ?? null;
}

export function getCategories(): ProductCategory[] {
  load();
  return _categories!;
}

export function preloadProducts(): Product[] {
  load();
  return _products!;
}
