import type { OrderListDTO, OrderDetailDTO } from "../models/ShipperDTO";
import API_BASE from "./API";

// Build the request headers (attach Authorization header if token exists)

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

// Fetch all active orders assigned to the shipper
export async function apiGetActiveOrders(): Promise<OrderListDTO[]> {
  const url = new URL(`${API_BASE}/shipper/orders`);
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load orders");
  return res.json();
}

// Fetch the details of a single order by its ID
export async function apiGetOrderDetail(orderId: string): Promise<OrderDetailDTO> {
  const res = await fetch(`${API_BASE}/shipper/orders/${orderId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load order");
  return res.json();
}

// Update the status of a shipper's order (either DELIVERED or CANCELED)
// If status is CANCELED, a reason can be included
export async function apiPatchOrderStatus(
  orderId: string,
  status: "DELIVERED" | "CANCELED",
  reason?: string
) {
  const res = await fetch(`${API_BASE}/shipper/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ status, reason }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json() as Promise<{ ok: true }>;
}
