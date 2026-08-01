"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import KanbanBoard from "@/components/admin/products/kanban-board";
import ProductList from "@/components/admin/products/product-list";
import styles from "./products-hub.module.css";

const VIEW_STORAGE_KEY = "moranti_admin_products_view";

type ProductView = "kanban" | "list";

const VIEW_TABS: { value: ProductView; label: string; icon: string }[] = [
  { value: "kanban", label: "Канбан", icon: "▤" },
  { value: "list", label: "Список", icon: "☰" },
];

export default function ProductsHub() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");

  // Дефолт из localStorage (запоминаем последний вид); query ?view= — приоритет.
  const [rememberedView] = useState<ProductView>(() => {
    if (typeof window === "undefined") return "kanban";
    try {
      return localStorage.getItem(VIEW_STORAGE_KEY) === "list" ? "list" : "kanban";
    } catch {
      return "kanban";
    }
  });

  const activeView: ProductView =
    viewParam === "kanban" || viewParam === "list" ? viewParam : rememberedView;

  function switchView(view: ProductView) {
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, view);
    } catch { /* ignore */ }
    router.replace(`/admin/products?view=${view}`);
  }

  return (
    <>
      <div className={styles.viewTabs} role="tablist" aria-label="Вид товаров">
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={activeView === tab.value}
            className={`${styles.viewTab} ${activeView === tab.value ? styles.viewTabActive : ""}`}
            onClick={() => switchView(tab.value)}
          >
            <span className={styles.viewIcon}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeView === "kanban" ? <KanbanBoard /> : <ProductList />}
    </>
  );
}
