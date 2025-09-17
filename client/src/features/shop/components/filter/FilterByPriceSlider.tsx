// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Le Gia Huy
// ID: s3975371

import Slider from '@/components/ui/slider';
import React from 'react';

interface FilterByPriceSliderProps {
  value: Array<number>;
  setValue: any;
  step: number;
  max: number;
}

const FilterByPriceSlider: React.FC<FilterByPriceSliderProps> = ({
  value,
  setValue,
  step,
  max,
}) => {
  const [from, to] = value;

  return (
    <div className="w-full flex flex-col gap-3">
      <h1 className="text-xl font-semibold">Filter by price</h1>
      <Slider
        value={value}
        onValueChange={setValue}
        min={0}
        max={max}
        step={step}
      />
      <p className="text-[#B1B1B1] text-md font-extralight">
        Price : {Intl.NumberFormat('vi-VN').format(from)} vnd -{' '}
        {Intl.NumberFormat('vi-VN').format(to)} vnd
      </p>
    </div>
  );
};
export default FilterByPriceSlider;
