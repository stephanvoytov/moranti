"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Button from "@/components/ui/Button";
import styles from "./page.module.css";

const STATUS: Record<string, string> = {
  new: "Новый",
  processing: "В обработке",
  completed: "Выполнен",
  cancelled: "Отменён",
  refunded: "Возврат",
};
const PAY: Record<string, string> = {
  pending: "Ожидает оплаты",
  paid: "Оплачен",
  failed: "Ошибка оплаты",
  refunded: "Возврат средств",
};

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}
interface Order {
  id: number | string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export default function AccountClient() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch(
      `/api/orders?where[email][equals]=${encodeURIComponent(user.email)}&limit=50&sort=-createdAt&depth=0`,
      { credentials: "include" },
    )
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setOrders(d.docs ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading || !user) {
    return (
      <div className={styles.page}>
        <p className={styles.loading}>Загрузка…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <h1 className={styles.title}>Личный кабинет</h1>
        <div className={styles.profileRow}>
          <span>
            <b>Email:</b>
            {user.email}
          </span>
          {user.firstName && (
            <span>
              <b>Имя:</b>
              {user.firstName}
            </span>
          )}
          {user.phone && (
            <span>
              <b>Телефон:</b>
              {user.phone}
            </span>
          )}
        </div>
        <Button variant="outline" onClick={() => logout()}>
          Выйти
        </Button>
      </section>

      <section className={styles.section}>
        <h2 className={styles.title}>Мои заказы</h2>
        {ordersLoading ? (
          <p className={styles.loading}>Загрузка…</p>
        ) : orders.length === 0 ? (
          <p className={styles.empty}>У вас пока нет заказов.</p>
        ) : (
          <div className={styles.orders}>
            {orders.map((o) => (
              <div key={o.id} className={styles.order}>
                <div className={styles.orderHead}>
                  <span className={styles.orderNum}>№{o.orderNumber}</span>
                  <span className={styles.orderDate}>
                    {new Date(o.createdAt).toLocaleDateString("ru-RU")}
                  </span>
                </div>
                <div className={styles.badges}>
                  <span className={styles.badge}>
                    {STATUS[o.status] || o.status}
                  </span>
                  <span
                    className={`${styles.badge} ${
                      o.paymentStatus === "paid" ? styles.badgePaid : ""
                    }`}
                  >
                    {PAY[o.paymentStatus] || o.paymentStatus}
                  </span>
                </div>
                <ul className={styles.items}>
                  {(o.items || []).map((it, i) => (
                    <li key={i}>
                      {it.name} — {it.quantity} шт. ×{" "}
                      {it.price?.toLocaleString("ru-RU")} ₽
                    </li>
                  ))}
                </ul>
                <div className={styles.total}>
                  Итого: {o.total?.toLocaleString("ru-RU")} ₽
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
