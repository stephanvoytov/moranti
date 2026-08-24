"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  total?: number;
  createdAt?: string;
}

interface Stats {
  metrics: {
    products: number;
    ordersNew: number;
    ordersProcessing: number;
    ordersDone: number;
    subscribers: number;
    customers: number;
  };
  attention: number;
  recentOrders: RecentOrder[];
}

const STATUS_LABELS: Record<string, string> = {
  new: "Новый",
  processing: "В обработке",
  completed: "Выполнен",
  cancelled: "Отменён",
  refunded: "Возврат",
};

const card: React.CSSProperties = {
  background: "var(--theme-elevation-100, #f5f5f5)",
  border: "1px solid var(--theme-border-color, #e2e2e2)",
  borderRadius: 8,
  padding: "16px 18px",
  minWidth: 150,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
  gap: 12,
  marginTop: 12,
};

export default function DashboardWidgets() {
  const [data, setData] = useState<Stats | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    fetch("/api/admin-stats")
      .then((r) => r.json())
      .then((d) => (d.ok ? setData(d) : setErr(true)))
      .catch(() => setErr(true));
  }, []);

  if (err) return null;
  if (!data) return null;

  const m = data.metrics;

  const metricCards: { label: string; value: number; accent?: boolean }[] = [
    { label: "Товары (в наличии)", value: m.products },
    { label: "Заказы — новые", value: m.ordersNew, accent: m.ordersNew > 0 },
    {
      label: "Заказы — в работе",
      value: m.ordersProcessing,
      accent: m.ordersProcessing > 0,
    },
    { label: "Заказы — выполнено", value: m.ordersDone },
    { label: "Подписчики", value: m.subscribers },
    { label: "Покупатели", value: m.customers },
  ];

  return (
    <div style={{ marginBottom: 28 }}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 600,
          margin: "4px 0",
          color: "var(--theme-text, #111)",
        }}
      >
        Обзор магазина
      </h2>

      <div style={grid}>
        {metricCards.map((c) => (
          <div
            key={c.label}
            style={{
              ...card,
              borderColor: c.accent
                ? "var(--theme-error-500, #d23)"
                : "var(--theme-border-color, #e2e2e2)",
            }}
          >
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                lineHeight: 1.1,
                color: c.accent
                  ? "var(--theme-error-500, #d23)"
                  : "var(--theme-text, #111)",
              }}
            >
              {c.value}
            </div>
            <div
              style={{
                fontSize: 13,
                marginTop: 6,
                color: "var(--theme-text, #111)",
                opacity: 0.75,
              }}
            >
              {c.label}
            </div>
          </div>
        ))}
      </div>

      {data.attention > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: "12px 16px",
            borderRadius: 8,
            background: "var(--theme-error-100, #fde8e8)",
            border: "1px solid var(--theme-error-500, #d23)",
            color: "var(--theme-text, #111)",
          }}
        >
          <strong>Требует внимания:</strong> {data.attention} заказ(ов) в статусе
          «Новый» или «В обработке».{" "}
          <Link href="/admin/collections/orders" style={{ fontWeight: 600 }}>
            Перейти к заказам →
          </Link>
        </div>
      )}

      {data.recentOrders.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: 15, margin: "0 0 8px", color: "var(--theme-text, #111)" }}>
            Последние заказы
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", opacity: 0.7 }}>
                <th style={{ padding: "6px 8px" }}>№</th>
                <th style={{ padding: "6px 8px" }}>Статус</th>
                <th style={{ padding: "6px 8px" }}>Сумма</th>
                <th style={{ padding: "6px 8px" }}>Дата</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o) => (
                <tr
                  key={o.id}
                  style={{ borderTop: "1px solid var(--theme-border-color, #eee)" }}
                >
                  <td style={{ padding: "6px 8px" }}>
                    <a href={`/admin/collections/orders/${o.id}`}>
                      {o.orderNumber}
                    </a>
                  </td>
                  <td style={{ padding: "6px 8px" }}>
                    {STATUS_LABELS[o.status] || o.status}
                  </td>
                  <td style={{ padding: "6px 8px" }}>
                    {typeof o.total === "number" ? `${o.total} ₽` : "—"}
                  </td>
                  <td style={{ padding: "6px 8px" }}>
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleDateString("ru-RU")
                      : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
