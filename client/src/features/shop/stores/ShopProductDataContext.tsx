// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Le Gia Huy
// ID: s3975371

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { VendorType } from './ProductDetailDataContext';
import { useAuth } from '@/stores/AuthProvider';

// ---- Types ----
interface ShopProduct {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  vendor: string;
  availableStock: number;
  category: string;
  __v?: number;
}

interface ShopProductsResponse {
  products: ShopProduct[];
  totalProducts: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  vendor?: VendorType;
}

type ShopProductContextType = {
  data: ShopProductsResponse;
  loading: boolean;
  error: string | null;
};

// ---- Defaults ----
const defaultData: ShopProductsResponse = {
  products: [],
  totalProducts: 0,
  pageIndex: 1,
  pageSize: 0,
  totalPages: 0,
};

const ShopProductContext = createContext<ShopProductContextType>({
  data: defaultData,
  loading: false,
  error: null,
});

// ---- Provider ----
export const ShopProductDataProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { shopId } = useParams<{ shopId?: string }>();

  const [data, setData] = useState<ShopProductsResponse>(defaultData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build query string
  const queryString = useMemo(() => {
    const qs = new URLSearchParams();

    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const category = searchParams.get('category');
    const keyword = searchParams.get('keyword');
    const page = searchParams.get('page');
    const order = searchParams.get('order');

    if (minPrice && minPrice.trim() !== '') qs.set('minPrice', minPrice);
    if (maxPrice && maxPrice.trim() !== '') qs.set('maxPrice', maxPrice);
    if (category && category.trim() !== '') qs.set('category', category);
    if (keyword && keyword.trim() !== '') qs.set('keyword', keyword);
    if (page && page.trim() !== '') qs.set('page', page);
    if (order && order.trim() !== '') qs.set('order', order);
    if (shopId) qs.set('vendor', shopId);

    return qs.toString();
  }, [searchParams, shopId]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    setLoading(true);
    setError(null);
    setData(defaultData);

    const url =
      queryString && queryString.length > 0
        ? `http://localhost:5001/api/customers/products?${queryString}`
        : `http://localhost:5001/api/customers/products`;

    // Check role + token
    const token = localStorage.getItem('token');

    if (user && user.role === 'CUSTOMER' && token) {
      fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((json: ShopProductsResponse) => {
          setData(json);
        })
        .catch((err: any) => {
          if (err.name !== 'AbortError') {
            // console.error('ShopProductData fetch failed:', err);
            setError('Failed to fetch products');
          }
        })
        .finally(() => {
          if (!signal.aborted) setLoading(false);
        });
    } else {
      controller.abort();
      setData(defaultData);
    }
    return () => controller.abort();
  }, [queryString]);

  return (
    <ShopProductContext.Provider value={{ data, loading, error }}>
      {children}
    </ShopProductContext.Provider>
  );
};

export const useShopProducts = () => useContext(ShopProductContext);
