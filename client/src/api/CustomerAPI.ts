import type {
  CustomerOrderDetailDTO,
  CustomerOrderListDTO,
} from "../models/CustomerDTO";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:5001/api";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {"Content-Type": "application/json"};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function apiCustomerGetOrders(): Promise<CustomerOrderListDTO[]> {
  const res = await fetch(`${API_BASE}/customer/orders`, {
    headers: authHeaders()
  });
  if (!res.ok) throw new Error("Failed to load orders");
  return res.json();
}

export async function apiCustomerGetOrderDetail(
  orderId: string
): Promise<CustomerOrderDetailDTO> {
  const res = await fetch(`${API_BASE}/customer/orders/${orderId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load order");
  return res.json();
}

export async function apiCustomerCancelOrder(
  orderId: string,
  reason: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/customer/orders/${orderId}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status: "CANCELED", reason }),
  });
  if (!res.ok) {
    let msg = "Failed to cancel order";
    try {
      const t = await res.json();
      if (t?.error) msg = t.error;
    } catch {}
    throw new Error(msg);
  }
}
