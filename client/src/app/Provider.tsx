import React from "react";
import { AuthProvider } from "@/stores/AuthProvider";
import { ShopCartDataProvider } from "@/features/layout/navbar/stores/ShopCartDataContext";
import { ShopProductDataProvider } from "@/features/shop/stores/ShopProductDataContext";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ShopCartDataProvider>
        <ShopProductDataProvider>
          {children}
        </ShopProductDataProvider>
      </ShopCartDataProvider>
    </AuthProvider>
  );
}
