import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // prevent full page reload
    if (inputRef.current) {
      const query = inputRef.current.value.trim();
      if (query) {
        console.log('Search value:', query);
        // Example: navigate to a search page
        navigate(`/shop?search=${encodeURIComponent(query)}`);
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
        type="submit" // ✅ pressing Enter or clicking this triggers handleSearch
        className="absolute right-2 top-1/2 -translate-y-1/2"
      >
        <img
          src="/src/assets/icon/search.svg"
          alt="search"
          className="h-4 w-4"
        />
      </button>
    </form>
  );
}
