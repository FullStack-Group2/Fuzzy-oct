// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Le Gia Huy
// ID: s3975371

import React from 'react';
import { AuthProvider } from '@/stores/AuthProvider';
import { ShopCartDataProvider } from '@/features/layout/navbar/stores/ShopCartDataContext';

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ShopCartDataProvider>{children}</ShopCartDataProvider>
    </AuthProvider>
  );
}
