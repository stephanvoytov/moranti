"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useAllProducts } from "@/lib/use-products";
import type { Product } from "@/data/products";
import type { MarketplaceLink } from "@/data/products";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import styles from "./page.module.css";

interface Row {
  item: { article: number; qty: number };
  product: Product;
}

export default function CheckoutClient() {
  const { products } = useAllProducts();
  const { cart, count, itemsCount, clearCart } = useCart();

  const allRows: Row[] = cart
    .map((item) => {
      const product = products.find((p) => p.wbArticle === item.article);
      return product ? { item, product } : null;
    })
    .filter((r): r is Row => r != null);

  // Только прямые продажи оформляются на сайте
  const rows = allRows.filter((r) => r.product.isDirectSale);
  const mpRows = allRows.filter((r) => !r.product.isDirectSale);

  const priceOf = (p: Product) =>
    typeof p.directPrice === "number" ? p.directPrice : p.price;

  const total = rows.reduce(
    (sum, { item, product }) => sum + item.qty * priceOf(product),
    0,
  );

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    shippingMethod: "Курьер",
    paymentMethod: "cod",
    notes: "",
  });
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rows.length === 0) return;
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: rows.map((r) => ({
            productId: Number(r.product.id),
            qty: r.item.qty,
          })),
          customer: {
            email: form.email,
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
          },
          address: form.address,
          shippingMethod: form.shippingMethod,
          paymentMethod: form.paymentMethod,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не удалось оформить заказ");
        setStatus("error");
        return;
      }
      setOrderNumber(data.order.orderNumber);
      clearCart();
      setStatus("success");
    } catch {
      setError("Сетевая ошибка. Попробуйте ещё раз.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className={styles.page}>
        <section className={styles.section}>
          <header className={styles.header}>
            <span className={styles.label}>Готово</span>
            <h1 className={styles.title}>Спасибо за заказ!</h1>
          </header>
          <div className={styles.successBox}>
            <p>
              Ваш заказ <b>№{orderNumber}</b> принят. Мы свяжемся с вами для
              подтверждения.
            </p>
            <Button variant="outline" href="/catalog">
              Вернуться в каталог
            </Button>
          </div>
        </section>
      </div>
    );
  }

  if (allRows.length === 0) {
    return (
      <div className={styles.page}>
        <section className={styles.section}>
          <header className={styles.header}>
            <span className={styles.label}>Оформление</span>
            <h1 className={styles.title}>Корзина пуста</h1>
          </header>
          <div className={styles.empty}>
            <Button variant="outline" href="/catalog">
              Перейти в каталог
            </Button>
          </div>
        </section>
      </div>
    );
  }

  // В корзине только товары маркетплейсов — на сайте оформить нельзя
  if (rows.length === 0) {
    return (
      <div className={styles.page}>
        <section className={styles.section}>
          <header className={styles.header}>
            <span className={styles.label}>Оформление</span>
            <h1 className={styles.title}>Покупка на сайте недоступна</h1>
          </header>
          <div className={styles.empty}>
            <p>
              Эти товары продаются только на маркетплейсах. Оформите заказ там по
              ссылкам ниже.
            </p>
            <MpList rows={mpRows} />
            <Button variant="outline" href="/cart">
              Вернуться в корзину
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <header className={styles.header}>
          <span className={styles.label}>Оформление</span>
          <h1 className={styles.title}>
            {rows.length > 0
              ? `${rows.length} ${plural(rows.length, "товар", "товара", "товаров")}`
              : "Оформление заказа"}
          </h1>
        </header>

        <div className={styles.grid}>
          <form className={styles.form} onSubmit={submit}>
            <h2 className={styles.blockTitle}>Контактные данные</h2>
            <Field
              label="Имя"
              name="firstName"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              placeholder="Как к вам обращаться"
            />
            <Field
              label="Фамилия"
              name="lastName"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
            />
            <Field
              label="Email *"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="example@mail.ru"
            />
            <Field
              label="Телефон"
              name="phone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+7 ..."
            />

            <h2 className={styles.blockTitle}>Доставка</h2>
            <Field
              label="Адрес доставки"
              name="address"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Город, улица, дом"
            />
            <Field
              as="select"
              label="Способ доставки"
              name="shippingMethod"
              value={form.shippingMethod}
              onChange={(e) => update("shippingMethod", e.target.value)}
            >
              <option value="Курьер">Курьер</option>
              <option value="Почта России">Почта России</option>
              <option value="СДЭК">СДЭК</option>
              <option value="Самовывоз">Самовывоз</option>
            </Field>
            <Field
              as="select"
              label="Способ оплаты"
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={(e) => update("paymentMethod", e.target.value)}
            >
              <option value="cod">Наложенный платёж</option>
              <option value="invoice">Счёт</option>
              <option value="yookassa">Онлайн (ЮKassa)</option>
            </Field>
            <Field
              as="textarea"
              label="Комментарий"
              name="notes"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
            />

            {error && <p className={styles.error}>{error}</p>}

            <Button type="submit" variant="primary" disabled={status === "submitting"}>
              {status === "submitting" ? "Отправляем…" : "Оформить заказ"}
            </Button>
          </form>

          <aside className={styles.summary}>
            <h2 className={styles.blockTitle}>Ваш заказ</h2>
            <ul className={styles.list}>
              {rows.map(({ item, product }) => (
                <li key={item.article} className={styles.row}>
                  <span className={styles.rowName}>
                    {product.name}
                    <span className={styles.rowQty}>× {item.qty}</span>
                  </span>
                  <span>
                    {(item.qty * priceOf(product)).toLocaleString("ru-RU")} ₽
                  </span>
                </li>
              ))}
            </ul>
            <div className={styles.summaryRow}>
              <span>Итого</span>
              <span className={styles.summaryTotal}>
                {total.toLocaleString("ru-RU")} ₽
              </span>
            </div>

            {mpRows.length > 0 && (
              <div className={styles.mpNote}>
                <p>Также в корзине — покупаются на маркетплейсах:</p>
                <MpList rows={mpRows} />
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}

function MpList({ rows }: { rows: Row[] }) {
  return (
    <ul className={styles.mpList}>
      {rows.map(({ item, product }) => (
        <li key={item.article}>
          <span>{product.name}</span>
          <span className={styles.mpLinks}>
            {(product.marketplaces || []).map((m: MarketplaceLink) => (
              <a key={m.name} href={m.url} target="_blank" rel="noreferrer">
                {m.name}
              </a>
            ))}
            {(product.marketplaces || []).length === 0 && "—"}
          </span>
        </li>
      ))}
    </ul>
  );
}

function plural(
  n: number,
  one: string,
  few: string,
  many: string,
): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
