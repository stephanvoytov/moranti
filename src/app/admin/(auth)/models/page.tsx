import { redirect } from "next/navigation";

// Раздел «Модели» объединён с «Товарами»: канбан живёт в /admin/products?view=kanban
export default function ModelsRedirectPage() {
  redirect("/admin/products?view=kanban");
}
