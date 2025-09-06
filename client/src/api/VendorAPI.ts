// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri
// ID: 4010989

import type {
  VendorOrderListDTO,
  VendorOrderDetailDTO,
} from '../models/VendorDTO';
import API_BASE from "./API";

// Build the request headers (attach Authorization header if token exists)
function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

// Fetch all vendor orders (pending & active, not rejected)
export async function apiVendorGetOrders(
  params?: URLSearchParams,
): Promise<VendorOrderListDTO[]> {
  const qs = params ? `?${params.toString()}` : "";
  const res = await fetch(`${API_BASE}/vendors/orders${qs}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load orders');
  return res.json();
}

// Fetch the details of a single vendor order by its ID
export async function apiVendorGetOrderDetail(
  orderId: string,
): Promise<VendorOrderDetailDTO> {
  const res = await fetch(`${API_BASE}/vendors/orders/${orderId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load order');
  return res.json();
}

// Accept a vendor order by updating its status
export async function apiVendorAcceptOrder(
  orderId: string,
): Promise<{ ok: true }> {
  const res = await fetch(`${API_BASE}/vendors/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ action: 'ACCEPT' }),
  });
  return jsonOrThrow(res);
}

// Reject a vendor order by updating its status and including a reason
export async function apiVendorRejectOrder(
  orderId: string,
  reason: string,
): Promise<{ ok: true }> {
  const res = await fetch(`${API_BASE}/vendors/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ action: 'REJECT', reason }),
  });
  if (!res.ok) throw new Error('Failed to reject order');
  return res.json();
}

// Helper: parse JSON or throw a detailed error
async function jsonOrThrow(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(
      data?.error || data?.message || `HTTP ${res.status}`,
    ) as any;
    Object.assign(err, data);
    throw err;
  }
  return data;
}
