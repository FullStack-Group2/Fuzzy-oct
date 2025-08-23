/*
import {
  customers, hubs, products, orders, orderItems,
  sleep, fmt2, type OrderStatus
} from "./MockDB";
import type { OrderDetailDTO, OrderItemDTO, OrderListDTO } from "../../../client/src/models/ShipperDTO";

// Compute totals from items (trust but verify totalPrice in Order)
function computeOrderTotal(orderId: string) {
  const items = orderItems.filter(i => i.order === orderId);
  const total = items.reduce((sum, it) => sum + it.priceAtPurchase * it.quantity, 0);
  return fmt2(total);
}

/**
 * LIST: Active orders for a hub (like GET /api/shipper/orders?hubId=...)
 * Returns minimal list DTO for your table: id, totalPrice, customerName
 
export async function getActiveOrdersForHub(hubId: string): Promise<OrderListDTO[]> {
  await sleep(150);

  const result = orders
    .filter(o => o.hub === hubId && o.status === "ACTIVE")
    .map(o => {
      const cust = customers.find(c => c._id === o.customer);
      const recomputed = computeOrderTotal(o._id);
      return {
        id: o._id,
        status: o.status,
        totalPrice: recomputed, // keep consistent with items
        customerName: cust?.name ?? "Unknown",
      };
    });

  return result;
}

/**
 * DETAIL: One order populated with customer + items + product info
 * (like GET /api/shipper/orders/:id with populate)
 
export async function getOrderDetail(orderId: string): Promise<OrderDetailDTO | null> {
  await sleep(150);
  const o = orders.find(x => x._id === orderId);
  if (!o) return null;

  const cust = customers.find(c => c._id === o.customer);
  const itemsRaw = orderItems.filter(i => i.order === o._id);

  const items: OrderItemDTO[] = itemsRaw.map(it => {
    const prod = products.find(p => p._id === it.product);
    const subtotal = fmt2(it.priceAtPurchase * it.quantity);
    return {
      id: it._id,
      productName: prod?.name ?? "Unknown Product",
      imageUrl: prod?.imageUrl ?? "",
      priceAtPurchase: it.priceAtPurchase,
      quantity: it.quantity,
      subtotal,
    };
  });

  const total = fmt2(items.reduce((sum, i) => sum + i.subtotal, 0));

  return {
    id: o._id,
    status: o.status,
    orderDate: o.orderDate,
    totalPrice: total, // synchronized with computed items
    hubId: o.hub,
    customerName: cust?.name ?? "Unknown",
    customerAddress: cust?.address ?? "Unknown",
    items,
  };
}

/**
 * MUTATION: Update status (PATCH /api/shipper/orders/:id/status)
 * Optionally accept `reason` for cancellation.
 
export async function updateOrderStatus(
  orderId: string,
  status: Extract<OrderStatus, "DELIVERED" | "CANCELED">,
  reason?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  await sleep(150);
  const idx = orders.findIndex(o => o._id === orderId);
  if (idx === -1) return { ok: false, error: "Order not found" };

  // Only ACTIVE orders can transition
  if (orders[idx].status !== "ACTIVE") {
    return { ok: false, error: "Order is not ACTIVE" };
  }

  // Record optional reason somewhere if you want (e.g., a side map or log)
  // For now we ignore it in the mock but keep the signature stable for your real API.

  orders[idx] = { ...orders[idx], status };
  return { ok: true };
}
*/