import { getPayload } from "payload";
import config from "@payload-config";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getPayload({ config });
    const [
      products,
      ordersNew,
      ordersProcessing,
      ordersDone,
      subscribers,
      customers,
      recent,
    ] = await Promise.all([
      payload.count({
        collection: "products",
        where: { inStock: { equals: true } },
      }),
      payload.count({ collection: "orders", where: { status: { equals: "new" } } }),
      payload.count({
        collection: "orders",
        where: { status: { equals: "processing" } },
      }),
      payload.count({
        collection: "orders",
        where: { status: { equals: "completed" } },
      }),
      payload.count({ collection: "subscribers" }),
      payload.count({ collection: "customers" }),
      payload.find({
        collection: "orders",
        sort: "-createdAt",
        limit: 5,
        depth: 0,
      }),
    ]);

    const recentOrders = (
      recent.docs as Array<{
        id: unknown;
        orderNumber?: string;
        status?: string;
        total?: number;
        createdAt?: string;
      }>
    ).map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt,
    }));

    const totalOf = (r: unknown): number => {
      const r2 = r as { total?: number; totalDocs?: number }
      return r2.total ?? r2.totalDocs ?? 0
    }

    return NextResponse.json({
      ok: true,
      metrics: {
        products: totalOf(products),
        ordersNew: totalOf(ordersNew),
        ordersProcessing: totalOf(ordersProcessing),
        ordersDone: totalOf(ordersDone),
        subscribers: totalOf(subscribers),
        customers: totalOf(customers),
      },
      attention: totalOf(ordersNew) + totalOf(ordersProcessing),
      recentOrders,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка сервера";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}
