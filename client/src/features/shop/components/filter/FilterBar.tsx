// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: 
// ID: 

import { useState } from 'react';

import { FaArrowLeftLong } from 'react-icons/fa6';

import PriceSlider from './PriceSlider';

export default function FilterBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState([0, 4_000_000]);
  return (
    <section className="w-full lg:w-[25%] relative">
      {/*cover black*/}
      {isOpen && (
        <div className="bg-black/50 fixed top-0 left-0 w-screen h-screen block lg:hidden z-50" />
      )}

      <div
        className={`bg-white  w-[350px] h-screen p-5 fixed top-0 left-0 z-50 lg:z-0 lg:sticky lg:left-0 lg:top-[50px] lg:w-full lg:flex lg:flex-col lg:gap-4 transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:transition-none`}
      >
        {/* button back only show in mobile when click isOpen filter */}
        <button
          onClick={() => setIsOpen(false)}
          className="block lg:hidden text-black mb-5"
        >
          <FaArrowLeftLong className="inline-block" /> Back
        </button>

        <PriceSlider
          value={value}
          setValue={setValue}
          step={100_000}
          max={4_000_000}
        />
        <button className="w-full text-center bg-[#1E7A5A] text-white p-2 rounded-lg">
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
    </section>
  );
}
