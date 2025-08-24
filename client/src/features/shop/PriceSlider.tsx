import { useState } from 'react';
import Slider from '@/components/ui/slider/slider';
import React from 'react';

interface PriceSliderProps {
    value: Array<number>,
    setValue: any,
    step: number,
    max: number,
}

const PriceSlider: React.FC<PriceSliderProps> = ({value, setValue, step, max}) => {
  const [from, to] = value;

  return (
    <div className='flex flex-col gap-3'>
      <h1 className='text-xl font-semibold'>Filter by price</h1>
      <Slider
        value={value}
        onValueChange={setValue}
        min={0}
        max={max}
        step={step}
      />
      <p className="text-[#B1B1B1] text-md font-extralight">
        Price : {Intl.NumberFormat("vi-VN").format(from)} vnd - {Intl.NumberFormat("vi-VN").format(to)} vnd
      </p>
    </div>
  );
}
export default PriceSlider;
