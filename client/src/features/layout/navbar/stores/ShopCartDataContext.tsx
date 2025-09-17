// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Le Gia Huy
// ID: s3975371

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/stores/AuthProvider';
import {
  fetchCartApi,
  addToCartApi,
  updateCartApi,
  removeCartItemApi,
} from '../api/cart';
import { createOrderApi } from '../api/order';

type CartItem = {
  _id: string;
  product: any;
  quantity: number;
};

type ShopCartContextType = {
  cart: CartItem[];
  loading: boolean;
  error: string | null;
  addToCart: (itemId: string, quantity: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeCartItem: (itemId: string) => Promise<void>;
  createOrder: () => Promise<void>;
};

const ShopCartContext = createContext<ShopCartContextType>({
  cart: [],
  loading: false,
  error: null,
  addToCart: async () => {},
  updateCartItem: async () => {},
  removeCartItem: async () => {},
  createOrder: async () => {},
});

export const ShopCartDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const token = localStorage.getItem('token');

  // Load cart once when user logs in
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    setLoading(true);
    setError(null);
    setCart([]);

    if (user?.role === 'CUSTOMER' && token) {
      fetchCartApi(token, signal)
        .then((data) => {
          setCart(data.carts || []);
        })
        .catch((err: any) => {
          if (err.name !== 'AbortError') {
            setError('Failed to fetch cart');
          }
        })
        .finally(() => {
          if (!signal.aborted) setLoading(false);
        });
    } else {
      setCart([]);
      controller.abort();
    }
  }, [user, refreshKey]);

  const addToCart = async (itemId: string, quantity: number) => {
    if (!token) return;
    const data = await addToCartApi(token, itemId, quantity);
    setRefreshKey((prev) => prev + 1);
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    if (!token) return;
    const data = await updateCartApi(token, itemId, quantity);
    setRefreshKey((prev) => prev + 1);
  };

  const removeCartItem = async (itemId: string) => {
    if (!token) return;
    const data = await removeCartItemApi(token, itemId);
    setRefreshKey((prev) => prev + 1);
  };

  const createOrder = async () => {
    if (!token) return;
    const data = await createOrderApi(token);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <ShopCartContext.Provider
      value={{
        cart,
        loading,
        error,
        addToCart,
        updateCartItem,
        removeCartItem,
        createOrder,
      }}
    >
      {children}
    </ShopCartContext.Provider>
  );
};

export const useShopCart = () => useContext(ShopCartContext);
