"use client";

import { useState, useEffect } from "react";
import type { Product, ProductCategory } from "@/data/products";

interface ProductsData {
  products: Product[];
  categories: ProductCategory[];
}

let globalData: ProductsData | null = null;
let globalPromise: Promise<ProductsData> | null = null;

function fetchProducts(): Promise<ProductsData> {
  if (globalData) return Promise.resolve(globalData);
  if (globalPromise) return globalPromise;

  globalPromise = fetch("/api/data/products")
    .then((res) => res.json())
    .then((data) => {
      globalData = data;
      return data;
    });

  return globalPromise;
}

export function useProducts(): ProductsData {
  const [data, setData] = useState<ProductsData>(
    globalData ?? { products: [], categories: [] },
  );

  useEffect(() => {
    if (globalData) {
      setData(globalData);
      return;
    }
    fetchProducts().then(setData);
  }, []);

  return data;
}
