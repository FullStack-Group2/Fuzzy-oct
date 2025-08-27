const API_BASE = 'http://localhost:5001/api/customers';

export async function fetchCartApi(token: string) {
  const res = await fetch(`${API_BASE}/cart`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch cart');
  return res.json();
}

export async function addToCartApi(
  token: string,
  itemId: string,
  quantity: number,
) {
  const res = await fetch(`${API_BASE}/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ itemId, quantity }),
  });
  if (!res.ok) throw new Error('Failed to add to cart');
  return res.json();
}

export async function updateCartApi(
  token: string,
  itemId: string,
  quantity: number,
) {
  const res = await fetch(`${API_BASE}/cart`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ itemId, quantity }),
  });
  if (!res.ok) throw new Error('Failed to update cart');
  return res.json();
}

export async function removeCartItemApi(token: string, itemId: string) {
  const res = await fetch(`${API_BASE}/cart/${itemId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to remove cart item');
  return res.json();
}
