// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Nhat Minh
// ID: s4019811

import Slider from '@/components/ui/slider';
import React from 'react';

interface FilterByCategoryProp {
  value: string | null;
  setValue: any;
}
const categories = [
  { value: '', label: 'All' },
  { value: 'CABINETS', label: 'Cabinets' },
  { value: 'WARDROBES', label: 'Wardrobes' },
  { value: 'SHELVES', label: 'Shelves' },
  { value: 'TABLES', label: 'Tables' },
  { value: 'CHAIRS', label: 'Chairs' },
  { value: 'SOFAS', label: 'Sofas' },
  { value: 'DECORATION', label: 'Decorations' },
  { value: 'OTHERS', label: 'Others' },
];
const FilterByCategory: React.FC<FilterByCategoryProp> = ({
  value,
  setValue,
}) => {
  return (
    <fieldset className="space-y-3">
      <h1 className="text-xl font-semibold">Filter by category</h1>
      {categories.map((opt) => (
        <label
          key={opt.value}
          className="flex items-center gap-3 cursor-pointer select-none black"
        >
          <input
            type="radio"
            name="category"
            value={opt.value}
            checked={value === opt.value}
            onChange={(e) => setValue(e.target.value)}
            className="h-4 w-4 accent-black"
          />
          {opt.label}
        </label>
      ))}
    </fieldset>
  );
};
export default FilterByCategory;
