// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Nhat Minh
// ID: s4019811

import HeroBanner from '@/components/HeroBanner';
import FilterBar from '@/features/shop/components/filter/FilterBar';
import ShopPage from '@/features/shop/components/ShopPage';
import ShopPagination from '@/features/shop/components/ShopPagination';
import VendorHeader from '@/features/shop/components/VendorHeader';
import kitchen from '../../assets/icon/kitchen.jpg';

const Shop = () => {
  return (
    <>
      <HeroBanner image={kitchen} title="Shop Page" subtitle="" />

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
