import type { Metadata } from "next";
import FavoritesClient from "./favorites-client";

// Клиентская страница (localStorage) — в поиске не нужна, но title свой задаём
export const metadata: Metadata = {
  title: "Избранное",
  robots: { index: false, follow: true },
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
