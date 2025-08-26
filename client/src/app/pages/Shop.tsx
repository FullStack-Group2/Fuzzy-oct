import { useState } from 'react';
import FilterBar from '@/features/shop/components/filter/FilterBar';
import ShopPage from '@/features/shop/components/ShopPage';
import ShopPagination from '@/features/shop/ShopPagination';
const Shop = () => {
  const [pageIndex, setPageIndex] = useState(0);

  return (
    <>
      <header className="relative mb-5 w-screen h-48 bg-[#B7F7E1]">
        <img
          src="/backgroundCover.png"
          alt="background cover for shop header"
          className="w-full h-full object-contain"
        />
        <div className="absolute inset-0 flex items-center justify-center text-black text-5xl font-semibold">
          Shop page
        </div>
      </header>

      <section className="w-[90vw] mx-auto mb-5 flex flex-col md:flex-row md:justify-between gap-5">
        <FilterBar />
        <div className='w-full md:w-[73%]'>
          <ShopPage index={1} />

          <ShopPagination pageIndex={pageIndex} setPageIndex={setPageIndex} />
        </div>
      </section>
    </>
  );
};

export default Shop;
