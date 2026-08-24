import type { Metadata } from "next";
import CheckoutClient from "./checkout-client";
import { seoConfig } from "@/config/seo";

export const metadata: Metadata = {
  title: "Оформление заказа — Moranti",
  description: "Оформление заказа на сайте Moranti.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/checkout" },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
