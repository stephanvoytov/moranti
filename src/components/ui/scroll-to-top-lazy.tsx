"use client";

import dynamic from "next/dynamic";

// Кнопка «Наверх» появляется только после прокрутки >600px — JS не нужен
// при первом рендере ни одной страницы. Грузим лениво (отдельный чанк,
// вне начального бандла) и без SSR: до гидрации кнопка не нужна вовсе.
const ScrollToTop = dynamic(() => import("./scroll-to-top"), {
  ssr: false,
});

export default function ScrollToTopLazy() {
  return <ScrollToTop />;
}