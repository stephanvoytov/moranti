/* =============================================
   Admin (authenticated) Layout — sidebar + проверка сессии
   ============================================= */

import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin-auth";
import AdminSidebar from "./sidebar";
import AdminToastWrapper from "./toast-wrapper";
import styles from "./layout.module.css";

export default async function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminToastWrapper>
      <div className={styles.layout}>
        <AdminSidebar />
        <main className={styles.content}>{children}</main>
      </div>
    </AdminToastWrapper>
  );
}
