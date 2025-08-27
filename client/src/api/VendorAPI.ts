import type {
  VendorOrderListDTO,
  VendorOrderDetailDTO,
} from '../models/VendorDTO';

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:5001/api';

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/** GET /api/vendor/orders — pending & active (non-rejected) */
export async function apiVendorGetOrders(): Promise<VendorOrderListDTO[]> {
  const res = await fetch(`${API_BASE}/vendor/orders`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load orders');
  return res.json();
}

/** GET /api/vendor/orders/:orderId */
export async function apiVendorGetOrderDetail(
  orderId: string,
): Promise<VendorOrderDetailDTO> {
  const res = await fetch(`${API_BASE}/vendor/orders/${orderId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load order');
  return res.json();
}

/** PATCH /api/vendor/orders/:orderId/status — ACCEPT */
export async function apiVendorAcceptOrder(
  orderId: string,
): Promise<{ ok: true }> {
  const res = await fetch(`${API_BASE}/vendor/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ action: 'ACCEPT' }),
  });
  return jsonOrThrow(res);
}

/** PATCH /api/vendor/orders/:orderId/status — REJECT (with reason) */
export async function apiVendorRejectOrder(
  orderId: string,
  reason: string,
): Promise<{ ok: true }> {
  const res = await fetch(`${API_BASE}/vendor/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ action: 'REJECT', reason }),
  });
  if (!res.ok) throw new Error('Failed to reject order');
  return res.json();
}

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
