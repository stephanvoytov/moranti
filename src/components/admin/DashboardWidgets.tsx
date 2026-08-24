"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Banner, Button, Card, Pill } from "@payloadcms/ui";

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

const STATUS_PILL: Record<string, "error" | "warning" | "success" | "light"> = {
  new: "error",
  processing: "warning",
  completed: "success",
  cancelled: "light",
  refunded: "light",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: "var(--base, 16px)",
  marginTop: "calc(var(--base, 16px) * 0.5)",
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

  const metricCards: {
    label: string;
    value: number;
    href: string;
    accent?: boolean;
  }[] = [
    { label: "Товары (в наличии)", value: m.products, href: "/admin/collections/products" },
    { label: "Заказы — новые", value: m.ordersNew, href: "/admin/collections/orders", accent: m.ordersNew > 0 },
    { label: "Заказы — в работе", value: m.ordersProcessing, href: "/admin/collections/orders", accent: m.ordersProcessing > 0 },
    { label: "Заказы — выполнено", value: m.ordersDone, href: "/admin/collections/orders" },
    { label: "Подписчики", value: m.subscribers, href: "/admin/collections/subscribers" },
    { label: "Покупатели", value: m.customers, href: "/admin/collections/customers" },
  ];

  return (
    <div style={{ marginBottom: "calc(var(--base, 16px) * 2)" }}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 600,
          margin: "4px 0 0",
          color: "var(--theme-text, #111)",
        }}
      >
        Обзор магазина
      </h2>

      <div style={gridStyle}>
        {metricCards.map((c) => (
          <Card
            key={c.label}
            title={c.label}
            href={c.href}
            actions={
              <Pill pillStyle={c.accent ? "error" : "light"}>{c.value}</Pill>
            }
          />
        ))}
      </div>

      {data.attention > 0 && (
        <div style={{ marginTop: "var(--base, 16px)" }}>
          <Banner type="error" alignIcon="left">
            Требует внимания: {data.attention} заказ(ов) в статусе «Новый» или
            «В обработке».{" "}
            <Button
              el="anchor"
              url="/admin/collections/orders"
              size="small"
              buttonStyle="error"
            >
              Перейти к заказам
            </Button>
          </Banner>
        </div>
      )}

      {data.recentOrders.length > 0 && (
        <div style={{ marginTop: "var(--base, 16px)" }}>
          <h3
            style={{
              fontSize: 15,
              margin: "0 0 8px",
              color: "var(--theme-text, #111)",
            }}
          >
            Последние заказы
          </h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
              background: "var(--theme-elevation-0, #fff)",
              border: "1px solid var(--theme-border-color, #e2e2e2)",
            }}
          >
            <thead>
              <tr
                style={{
                  textAlign: "left",
                  color: "var(--theme-elevation-600, #666)",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                <th style={{ padding: "10px 12px" }}>№</th>
                <th style={{ padding: "10px 12px" }}>Статус</th>
                <th style={{ padding: "10px 12px" }}>Сумма</th>
                <th style={{ padding: "10px 12px" }}>Дата</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o) => (
                <tr
                  key={o.id}
                  style={{ borderTop: "1px solid var(--theme-border-color, #eee)" }}
                >
                  <td style={{ padding: "10px 12px" }}>
                    <Link
                      href={`/admin/collections/orders/${o.id}`}
                      style={{
                        color: "var(--theme-success-500, #0f7d4c)",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <Pill pillStyle={STATUS_PILL[o.status] || "light"}>
                      {STATUS_LABELS[o.status] || o.status}
                    </Pill>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {typeof o.total === "number"
                      ? `${o.total.toLocaleString("ru-RU")} ₽`
                      : "—"}
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--theme-elevation-600, #666)" }}>
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
