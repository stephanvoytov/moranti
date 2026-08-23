import type { Metadata } from "next";
import CartClient from "./cart-client";
import { seoConfig } from "@/config/seo";

// Клиентская страница (localStorage) — в поиске не нужна
export const metadata: Metadata = {
  title: seoConfig.pages.cart.title,
  description: seoConfig.pages.cart.description,
  robots: { index: false, follow: true },
  alternates: { canonical: "/cart" },
};

export default function CartPage() {
  return <CartClient />;
}