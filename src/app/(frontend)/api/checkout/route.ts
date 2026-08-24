/* =============================================
    POST /api/checkout — оформление заказа на сайте.
    Только прямые продажи (isDirectSale). Списывает stockQuantity.
    Создаёт (или находит) покупателя, создаёт заказ, шлёт уведомления.
    Публичный роут (без авторизации): валидация Zod.
   ============================================= */

import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { randomBytes } from "crypto";
import { checkoutSchema } from "@/lib/schemas";
import { logger } from "@/lib/logger";
import { sendMail, getAdminEmail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

interface CheckoutProduct {
  id?: number | string;
  isDirectSale?: boolean;
  name?: string;
  stockQuantity?: number;
  directPrice?: number;
  price?: number;
}
interface OrderItem {
  product: number;
  name: string;
  price: number;
  quantity: number;
}

function formatItems(items: { name: string; price: number; quantity: number }[]) {
  return items
    .map(
      (i) =>
        `• ${i.name} — ${i.quantity} шт. × ${i.price.toLocaleString("ru-RU")} ₽`,
    )
    .join("<br>");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Некорректные данные" },
        { status: 400 },
      );
    }

    const { items, customer, address, shippingMethod, paymentMethod, notes } =
      parsed.data;

    const payload = await getPayload({ config });

    // Загружаем товары одним запросом
    const productsRes = await payload.find({
      collection: "products",
      where: { id: { in: items.map((i) => i.productId) } },
      limit: items.length,
      depth: 0,
    });
    const productMap = new Map<number, CheckoutProduct>();
    for (const p of productsRes.docs as unknown as CheckoutProduct[]) {
      productMap.set(Number(p.id), p);
    }

    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = productMap.get(Number(item.productId));
      if (!product) {
        return NextResponse.json(
          { error: `Товар #${item.productId} не найден` },
          { status: 400 },
        );
      }
      // Только прямые продажи оформляются на сайте
      if (!product.isDirectSale) {
        return NextResponse.json(
          { error: `«${product.name}» доступен только на маркетплейсах` },
          { status: 400 },
        );
      }
      const currentStock =
        typeof product.stockQuantity === "number" ? product.stockQuantity : null;
      if (currentStock !== null && currentStock < item.qty) {
        return NextResponse.json(
          { error: `Недостаточно на складе: «${product.name}»` },
          { status: 400 },
        );
      }
      // Для прямой продажи — directPrice, иначе обычная цена
      const price =
        typeof product.directPrice === "number"
          ? product.directPrice
          : typeof product.price === "number"
            ? product.price
            : 0;
      subtotal += price * item.qty;
      orderItems.push({
        product: Number(product.id),
        name: product.name ?? "",
        price,
        quantity: item.qty,
      });
    }

    // Найти или создать покупателя
    const existing = await payload.find({
      collection: "customers",
      where: { email: { equals: customer.email } },
      limit: 1,
      depth: 0,
    });

    let customerId: number | string;
    if (existing.totalDocs > 0) {
      customerId = (existing.docs[0] as { id: number | string }).id;
    } else {
      const created = await payload.create({
        collection: "customers",
        overrideAccess: true,
        data: {
          email: customer.email,
          firstName: customer.firstName || "",
          lastName: customer.lastName || "",
          phone: customer.phone || "",
          // auth-коллекция требует пароль — генерируем случайный
          // (пользователь сможет сбросить через email при необходимости)
          password: randomBytes(16).toString("hex"),
        },
      });
      customerId = (created as { id: number | string }).id;
    }

    const shippingCost = 0; // MVP: бесплатная доставка / считается позже
    const total = subtotal + shippingCost;

    const order = await payload.create({
      collection: "orders",
      overrideAccess: true,
      data: {
        customer: customerId as number,
        email: customer.email,
        phone: customer.phone || "",
        items: orderItems,
        subtotal,
        shippingCost,
        total,
        shippingMethod: shippingMethod || "",
        address: address || "",
        paymentMethod,
        paymentStatus: "pending",
        notes: notes || "",
      },
    });

    const orderId = (order as { id: number | string }).id;
    const orderNumber = (order as { orderNumber?: string | number }).orderNumber;

    // Списываем остаток со своего склада
    for (const item of orderItems) {
      const product = productMap.get(Number(item.product));
      const currentStock =
        typeof product?.stockQuantity === "number" ? product.stockQuantity : null;
      if (currentStock !== null) {
        await payload.update({
          collection: "products",
          id: Number(item.product),
          data: { stockQuantity: Math.max(0, currentStock - item.quantity) },
          overrideAccess: true,
        });
      }
    }

    logger.info("Order created via checkout", { orderId, orderNumber, total });

    // Уведомления (не блокируем ответ при ошибке отправки)
    try {
      const itemsHtml = formatItems(orderItems);
      await sendMail({
        to: customer.email,
        subject: `Заказ №${orderNumber} — Moranti`,
        html: `
          <h2>Спасибо за заказ, ${customer.firstName || "друг"}!</h2>
          <p>Ваш заказ <b>№${orderNumber}</b> принят и скоро будет обработан.</p>
          <p>${itemsHtml}</p>
          <p>Итого: <b>${total.toLocaleString("ru-RU")} ₽</b></p>
          <p>Способ доставки: ${shippingMethod || "—"}</p>
          <p>Мы свяжемся с вами для подтверждения.</p>
          <hr>
          <p style="color:#888;font-size:12px">Moranti — натуральная кожа ручной работы.</p>
        `,
      });
      await sendMail({
        to: getAdminEmail(),
        subject: `Новый заказ №${orderNumber}`,
        html: `
          <h2>Новый заказ №${orderNumber}</h2>
          <p>Клиент: ${customer.firstName || ""} ${customer.lastName || ""} (${customer.email}, ${customer.phone || "—"})</p>
          <p>${itemsHtml}</p>
          <p>Итого: <b>${total.toLocaleString("ru-RU")} ₽</b></p>
          <p>Доставка: ${shippingMethod || "—"} / ${address || "—"}</p>
          <p>Оплата: ${paymentMethod} (${customer.email})</p>
          ${notes ? `<p>Комментарий: ${notes}</p>` : ""}
        `,
      });
    } catch (mailErr) {
      logger.error("Order notification failed", {
        error: (mailErr as Error)?.message,
      });
    }

    return NextResponse.json({
      ok: true,
      order: { id: orderId, orderNumber, total },
    });
  } catch (err) {
    logger.error("Checkout failed", { error: (err as Error)?.message });
    return NextResponse.json(
      { error: "Не удалось оформить заказ. Попробуйте позже." },
      { status: 500 },
    );
  }
}
