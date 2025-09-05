import { useRef } from 'react';
import { useUpdateSearchParam } from '@/features/shop/hooks/useUpdateSearchParam';
import { CiSearch } from 'react-icons/ci';

export default function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const updateSearchParam = useUpdateSearchParam();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRef.current) {
      const query = inputRef.current.value.trim();
      if (query) {
        updateSearchParam({ keyword: query });
      }
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder="Enter keyword ..."
        className="border rounded-full pl-3 pr-10 py-1 text-sm w-[45vw]"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2"
      >
        <CiSearch className="size-5" />
      </button>
    </form>
  );
}
