// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author:
// ID:

import { useState } from 'react';
import FilterBar from '@/features/shop/components/filter/FilterBar';
import ShopPage from '@/features/shop/components/ShopPage';
import ShopPagination from '@/features/shop/components/ShopPagination';
import VendorHeader from '@/features/shop/components/VendorHeader';

const Shop = () => {
  return (
    <>
      <header className="relative mb-5 w-full h-56 bg-[#B7F7E1]">
        <img
          src="/backgroundCover.png"
          alt="background cover for shop header"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center text-black text-5xl font-semibold">
          Shop page
        </div>
      </header>
      <section className="w-[90vw] mx-auto mb-5 flex flex-col lg:flex-row lg:justify-between gap-5">
        <FilterBar />
        <section className="w-full lg:w-[73%]">
          <VendorHeader />
          <ShopPage />
          <ShopPagination />
        </section>
      </section>
    </>
  );
};

export default Shop;
