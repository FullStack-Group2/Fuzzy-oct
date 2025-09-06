// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: 
// ID: 

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
    if (user?.role === 'CUSTOMER' && token) {
      setLoading(true);
      fetchCartApi(token)
        .then((data) => {
          console.log(
            `cart data is already setted: ${JSON.stringify(data.carts)}`,
          );
          console.log(`set refresh key: ${refreshKey}`);
          setCart(data.carts || []);
        })
        .catch(() => setError('Failed to fetch cart'))
        .finally(() => setLoading(false));
    } else {
      setCart([]);
    }
  }, [user, refreshKey]);

  const addToCart = async (itemId: string, quantity: number) => {
    if (!token) return;
    const data = await addToCartApi(token, itemId, quantity);
    setRefreshKey((prev) => prev + 1);
    console.log(`add to cart data: ${data}`);
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    if (!token) return;
    const data = await updateCartApi(token, itemId, quantity);
    setRefreshKey((prev) => prev + 1);
    console.log(`updateCartItem data: ${data}`);
  };

  const removeCartItem = async (itemId: string) => {
    if (!token) return;
    const data = await removeCartItemApi(token, itemId);
    setRefreshKey((prev) => prev + 1);
    console.log(`removeCartItem data: ${data}`);
  };

  const createOrder = async () => {
    if (!token) return;
    const data = await createOrderApi(token);
    setRefreshKey((prev) => prev + 1);
    console.log('Order created:', data);
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
