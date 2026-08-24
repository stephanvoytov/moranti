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

    const recentOrders = (recent.docs as any[]).map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt,
    }));

    return NextResponse.json({
      ok: true,
      metrics: {
        products: products.total,
        ordersNew: ordersNew.total,
        ordersProcessing: ordersProcessing.total,
        ordersDone: ordersDone.total,
        subscribers: subscribers.total,
        customers: customers.total,
      },
      attention: ordersNew.total + ordersProcessing.total,
      recentOrders,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message },
      { status: 500 },
    );
  }
}
