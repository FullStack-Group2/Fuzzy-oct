// src/api/ShipperAPI.ts
import type { OrderListDTO, OrderDetailDTO } from "../models/ShipperDTO";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:5001/api";
// ^ the `as any` avoids transient TS noise if your editor lags on vite types

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function apiGetActiveOrders(hubId?: string): Promise<OrderListDTO[]> {
  const url = new URL(`${API_BASE}/shipper/orders`);
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load orders");
  return res.json();
}

export async function apiGetOrderDetail(orderId: string): Promise<OrderDetailDTO> {
  const res = await fetch(`${API_BASE}/shipper/orders/${orderId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load order");
  return res.json();
}

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
