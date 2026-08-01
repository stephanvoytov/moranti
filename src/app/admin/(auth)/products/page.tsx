import { Suspense } from "react";
import ProductsHub from "./products-hub";

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<p style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: 14 }}>Загрузка...</p>}>
      <ProductsHub />
    </Suspense>
  );
}
