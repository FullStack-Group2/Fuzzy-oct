// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri
// ID: 4010989

import type {
  CustomerOrderDetailDTO,
  CustomerOrderListDTO,
} from "../models/CustomerDTO";
import API_BASE from "./API";

// Build the request headers (attach Content-Type and Authorization if token exists)
function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

// Fetch all orders that belong to the logged-in customer
export async function apiCustomerGetOrders(
  params?: URLSearchParams,
): Promise<CustomerOrderListDTO[]> {
  const qs = params ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/customers/orders${qs}`, {
    headers: authHeaders()
  });
  console.log(`check response: ${JSON.stringify(res)}`);
  if (!res.ok) throw new Error("Failed to load orders");
  return res.json();
}

// Fetch the details of a single customer order by its ID
export async function apiCustomerGetOrderDetail(
  orderId: string
): Promise<CustomerOrderDetailDTO> {
  const res = await fetch(`${API_BASE}/customers/orders/${orderId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load order");
  return res.json();
}

// Cancel a customer order by sending a PATCH request with status and reason
export async function apiCustomerCancelOrder(
  orderId: string,
  reason: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/customers/orders/${orderId}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status: "CANCELED", reason }),
  });
  if (!res.ok) {
    let msg = "Failed to cancel order";
      const t = await res.json();
      if (t?.error) msg = t.error;
    throw new Error(msg);
  }
}
