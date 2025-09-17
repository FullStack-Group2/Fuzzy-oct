// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri, Tran Tu Tam
// ID: s4010989, s3999159

import type {
  VendorOrderListDTO,
  VendorOrderDetailDTO,
} from '../models/VendorDTO';
import API_BASE from './API';

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
  const qs = params ? `?${params.toString()}` : '';
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

// Define a common Product interface
export interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  vendor: string;
  availableStock: number;
  salesCount?: number;
  sale: number; 
  category: string;
}

// Define a common base URL for the API
const VENDOR_URL = 'http://localhost:5001/api';
const VENDOR_BASE = `${VENDOR_URL}/vendors`;
const UPLOAD_BASE = `${VENDOR_URL}/upload`;

// Fetch all vendor products with sales data
export const getProductsWithSales = async (
  token: string,
): Promise<Product[]> => {
  const response = await fetch(`${VENDOR_BASE}/products`, {
    headers: { Authorization: token },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  const data = await response.json();
  const products: Product[] = data.products;

  const productsWithSales = await Promise.all(
    products.map(async (product: Product) => {
      try {
        const salesResponse = await fetch(
          `${VENDOR_BASE}/product/${product._id}/sales`,
          {
            headers: { Authorization: token },
          },
        );

        if (salesResponse.ok) {
          const salesData = await salesResponse.json();
          return { ...product, salesCount: salesData.totalSold || 0 };
        } else {
          console.error(`Failed to fetch sales for product ${product._id}`);
          return { ...product, salesCount: 0 };
        }
      } catch (err) {
        console.error(`Error fetching sales for product ${product._id}`, err);
        return { ...product, salesCount: 0 };
      }
    }),
  );

  return productsWithSales;
};

// Delete a vendor product by its ID
export const deleteProduct = async (
  productId: string,
  token: string,
): Promise<void> => {
  const response = await fetch(`${VENDOR_BASE}/product/${productId}`, {
    method: 'DELETE',
    headers: { Authorization: token },
  });

  if (!response.ok) {
    throw new Error('Failed to delete product');
  }
};

// Upload a single product image and return its URL
export const uploadProductImage = async (
  token: string,
  file: File,
): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${UPLOAD_BASE}/image`, {
    method: 'POST',
    headers: { Authorization: token },
    body: formData,
  });

  // Handle empty catch blocks properly
  if (!res.ok) {
    let msg = 'Failed to upload image';
    try {
      const data = await res.json();
      msg = data?.message || msg;
    } catch (err) {
      console.error('Error parsing upload image response:', err);
    }
    throw new Error(msg);
  }

  const data = await res.json();
  return data?.image?.url || '';
};

// Create a new product
export interface NewProduct {
  name: string;
  description: string;
  category: string;
  price: number;
  availableStock: number;
  imageUrl: string;
}

export const createProduct = async (
  token: string,
  product: NewProduct,
): Promise<void> => {
  const res = await fetch(`${VENDOR_BASE}/add-product`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify(product),
  });

  if (!res.ok) {
    const ct = res.headers.get('content-type') || '';
    let detail = '';
    try {
      detail = ct.includes('application/json')
        ? JSON.stringify(await res.json())
        : await res.text();
    } catch (err) {
      console.error('Error parsing create product response:', err);
    }
    throw new Error(detail || `Failed to add product (status ${res.status})`);
  }
};

// Update an existing product
export interface UpdateProductPayload {
  name: string;
  description: string;
  category: string;
  price: number;
  availableStock: number;
  imageUrl: string;
}

export const updateProduct = async (
  productId: string,
  token: string,
  payload: UpdateProductPayload,
): Promise<Record<string, unknown> | null> => {
  const res = await fetch(`${VENDOR_BASE}/product/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let msg = 'Failed to update product';
    try {
      const data = await res.json();
      msg = data?.message || msg;
    } catch (err) {
      console.error(
        'Error occurred while parsing update product response:',
        err,
      );
    }
    throw new Error(msg);
  }

  try {
    return await res.json();
  } catch (err) {
    console.error('Error occurred:', err);
    return null;
  }
};

export const getProductById = async (
  productId: string,
  token: string,
): Promise<Product | null> => {
  const res = await fetch(`${VENDOR_BASE}/product/${productId}`, {
    headers: { Authorization: token },
  });
  if (!res.ok) {
    console.error('Failed to fetch product', await res.text());
    return null;
  }
  const data = await res.json();
  return data.product ?? data ?? null;
};