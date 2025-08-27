import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/stores/AuthProvider";

type ShopProductContextType = {
  products: any[];
  loading: boolean;
  error: string | null;
};

const ShopProductContext = createContext<ShopProductContextType>({
  products: [],
  loading: false,
  error: null,
});

export const ShopProductDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    // Reset state every time user changes
    setProducts([]);
    setError(null);

    // Check role + token
    const token = localStorage.getItem("token");

    if (user && user.role === "CUSTOMER" && token) {
      setLoading(true);

      fetch("http://localhost:5001/api/customers/products", {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
            console.log(`ShopProductData is already setted:`+ JSON.stringify(data.products));
            setProducts(data.products);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            setError("Failed to fetch products");
            console.log(`ShopProductData is failed :(`);
          }
        })
        .finally(() => {
          if (!signal.aborted) setLoading(false);
        });
    } else {
      // If not logged in as CUSTOMER → abort + clear data
      controller.abort();
      setProducts([]);
    }

    return () => controller.abort(); // cleanup abort when unmount or user changes
  }, [user]);

  return (
    <ShopProductContext.Provider value={{ products, loading, error }}>
      {children}
    </ShopProductContext.Provider>
  );
};

export const useShopProducts = () => useContext(ShopProductContext);
