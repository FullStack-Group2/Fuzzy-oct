// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author:
// ID:

import React from 'react';
import { AuthProvider } from '@/stores/AuthProvider';
import { ShopCartDataProvider } from '@/features/layout/navbar/stores/ShopCartDataContext';
import { ShopProductDataProvider } from '@/features/shop/stores/ShopProductDataContext';

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ShopCartDataProvider>{children}</ShopCartDataProvider>
    </AuthProvider>
  );
}
