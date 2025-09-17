// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Nhat Minh
// ID: s4019811

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { FaArrowLeftLong } from 'react-icons/fa6';

import { useUpdateSearchParam } from '../../hooks/useUpdateSearchParam';
import FilterByPriceSlider from './FilterByPriceSlider';
import FilterByCategory from './FilterByCategory';

const allowedCategories = [
  '',
  'CABINETS',
  'WARDROBES',
  'SHELVES',
  'TABLES',
  'CHAIRS',
  'SOFAS',
  'DECORATION',
  'OTHERS',
];

export default function FilterBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [priceRangeValue, setPriceRangeValue] = useState([0, 4_000_000]);
  const [categoryValue, setCategoryValue] = useState('');
  const updateSearchParam = useUpdateSearchParam();
  const [searchParams] = useSearchParams();

  function ApplyFilter() {
    const [min, max] = priceRangeValue;

    updateSearchParam({
      minPrice: String(min),
      maxPrice: String(max),
      category: categoryValue,
      page: String(1),
    });
  }

  useEffect(() => {
    const min = parseInt(searchParams.get('minPrice') ?? '0', 10);
    const max = parseInt(searchParams.get('maxPrice') ?? '4000000', 10);
    const category = searchParams.get('category') ?? '';

    // validate min/max
    const safeMin = isNaN(min) || min < 0 ? 0 : min;
    const safeMax = isNaN(max) || max > 4_000_000 ? 4_000_000 : max;

    setPriceRangeValue([safeMin, safeMax]);

    // validate category
    const isValidCategory = allowedCategories.includes(category);
    setCategoryValue(isValidCategory ? category : '');
  }, [searchParams]);

  return (
    <section className="w-full lg:w-[25%] relative">
      {/*----------cover black-----------*/}
      {isOpen && (
        <div className="bg-black/50 fixed top-0 left-0 w-screen h-screen block lg:hidden z-50" />
      )}
      {/*-------------------------------*/}

      <div
        className={`bg-white  w-[350px] h-screen p-5 fixed top-0 left-0 z-50 lg:z-0 lg:sticky lg:left-0 lg:top-[50px] lg:w-full flex flex-col gap-6 items-start transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:transition-none`}
      >
        {/* button back only show in mobile when click isOpen filter */}
        <button
          onClick={() => setIsOpen(false)}
          className="block lg:hidden text-black mb-5"
        >
          <FaArrowLeftLong className="inline-block" /> Back
        </button>
        {/*-------------------------------*/}

        <FilterByPriceSlider
          value={priceRangeValue}
          setValue={setPriceRangeValue}
          step={100_000}
          max={4_000_000}
        />

        <FilterByCategory value={categoryValue} setValue={setCategoryValue} />

        <button
          className="w-full text-center bg-[#1E7A5A] text-white p-2 rounded-lg"
          onClick={() => {
            ApplyFilter();
          }}
        >
          Apply filter
        </button>
      </div>

      {/* button filter only show in mobile*/}
      <button
        onClick={() => setIsOpen(true)}
        className="block lg:hidden w-full md:w-[45%] mb-5 text-center bg-[#1E7A5A] text-white p-2 rounded-lg"
      >
        Filter
      </button>
      {/*-------------------------------*/}
    </section>
  );
}
