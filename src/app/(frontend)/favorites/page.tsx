import type { Metadata } from "next";
import FavoritesClient from "./favorites-client";
import { seoConfig } from "@/config/seo";

// Клиентская страница (localStorage) — в поиске не нужна, но title свой задаём
export const metadata: Metadata = {
  title: seoConfig.pages.favorites.title,
  description: seoConfig.pages.favorites.description,
  robots: { index: false, follow: true },
  alternates: { canonical: "/favorites" },
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
