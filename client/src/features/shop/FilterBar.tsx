import { useState } from 'react';

import { FaArrowLeftLong } from 'react-icons/fa6';

import PriceSlider from './PriceSlider';

export default function FilterBar() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState([0, 4_000_000]);
  return (
    <section className="w-full md:w-[25%] relative">
      {/*cover black*/}
      {open && (
        <div className="bg-black/50 fixed top-0 left-0 w-screen h-screen block md:hidden z-50" />
      )}

      <div
        className={`w-[350px] md:w-full h-screen p-5 fixed top-0 left-0 z-50 md:z-0 md:sticky md:left-0 md:top-[50px] bg-white md:flex md:flex-col md:gap-4 transform transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:transition-none`}
      >
        <button
          onClick={() => setOpen(false)}
          className="block md:hidden text-black mb-5"
        >
          <FaArrowLeftLong className="inline-block" /> Back
        </button>

        <PriceSlider
          value={value}
          setValue={setValue}
          step={100_000}
          max={4_000_000}
        />
        {/* <PriceSlider/> */}

        <button className="w-full text-center bg-[#1E7A5A] text-white p-2 rounded-lg">
          Apply filter
        </button>
      </div>

      {/* button filter only show in mobile*/}
      <button
        onClick={() => setOpen(true)}
        className="block md:hidden w-full sm:w-[45%] mb-5 text-center bg-[#1E7A5A] text-white p-2 rounded-lg"
      >
        Filter
      </button>
    </section>
  );
}
