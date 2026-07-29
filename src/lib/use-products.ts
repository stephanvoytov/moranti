"use client";

import { useState, useEffect } from "react";
import type { Product, ProductCategory } from "@/data/products";

interface ProductsData {
  products: Product[];
  categories: ProductCategory[];
}

let globalPromise: Promise<ProductsData> | null = null;

function fetchProducts(): Promise<ProductsData> {
  if (globalPromise) return globalPromise;

  globalPromise = fetch("/api/data/products")
    .then((res) => res.json())
    .then((data) => {
      globalPromise = null;
      return data;
    })
    .catch((err) => {
      globalPromise = null;
      throw err;
    });

  return globalPromise;
}

export function useProducts(): ProductsData {
  const [data, setData] = useState<ProductsData>({
    products: [],
    categories: [],
  });

  useEffect(() => {
    let cancelled = false;
    fetchProducts().then((result) => {
      if (!cancelled) setData(result);
    });
    return () => { cancelled = true; };
  }, []);

  return data;
}
