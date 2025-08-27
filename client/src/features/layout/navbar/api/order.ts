const API_BASE = 'http://localhost:5001/api/customers';

export async function createOrderApi(token: string) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to create order');
  return res.json();
}
