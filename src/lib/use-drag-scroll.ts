"use client";

import { useRef, useCallback, useEffect } from "react";

/**
 * Добавляет drag-to-scroll (нажал и тащишь мышкой) для горизонтального скролла.
 * Использовать: `const scrollRef = useDragScroll<HTMLDivElement>()`
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    // Не перехватывать клики по ссылкам, кнопкам, инпутам
    const target = e.target as HTMLElement;
    if (target.closest("a, button, input, select, textarea")) return;

    isDragging.current = true;
    startX.current = e.pageX - (ref.current?.offsetLeft ?? 0);
    scrollLeft.current = ref.current?.scrollLeft ?? 0;
    ref.current?.style.setProperty("cursor", "grabbing");
    ref.current?.style.setProperty("user-select", "none");
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - (ref.current.offsetLeft ?? 0);
    const walk = (x - startX.current) * 1.2; // multiplier for feel
    ref.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const onMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    ref.current?.style.removeProperty("cursor");
    ref.current?.style.removeProperty("user-select");
  }, []);

  // Prevent native image drag that interferes with drag-to-scroll
  const onDragStart = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Global mouseup/mouseleave to stop dragging even outside element
    const globalUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        el.style.removeProperty("cursor");
        el.style.removeProperty("user-select");
      }
    };
    window.addEventListener("mouseup", globalUp);
    window.addEventListener("mouseleave", globalUp);

    return () => {
      window.removeEventListener("mouseup", globalUp);
      window.removeEventListener("mouseleave", globalUp);
    };
  }, []);

  return { ref, onMouseDown, onMouseMove, onMouseUp, onDragStart };
}
