import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authRole from '@/stores/authStore';

type Role = 'customer' | 'vendor' | 'shipper' | null;

/* ---------------- Main Navbar ---------------- */

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-white border-b">
      <div className=" mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        <div className="flex items-center space-x-4">
          <Logo />
          {authRole && <Menu role={authRole} />}
        </div>

        {/* Desktop */}
        <div className="flex items-center space-x-4">
          {!authRole && <AuthLinks />}

          {authRole === 'customer' && <SearchBar />}

          {authRole && <Icons role={authRole} />}
          {/* Mobile toggle */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            <img src="src/assets/icon/menu-hamburger.svg" alt="Menu" className="h-auto min-w-5 w-5" />
          </button>
        </div>
      </div>

      <MobileMenuDropDown
        role={authRole}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </nav>
  );
}

/* ---------------- Sub Components ---------------- */

// Logo
function Logo() {
  return (
    <Link to="/" className="flex items-center">
      <img src="/logo.png" alt="Logo" className="h-auto min-w-8 w-8" />
    </Link>
  );
}

// Menu
function Menu({ role }: { role: Exclude<Role, null> }) {
  const menu = {
    customer: [
      { name: 'Shop', path: '/shop' },
      { name: 'Order', path: '/orders' },
    ],
    vendor: [
      { name: 'Product', path: '/products' },
      { name: 'Order', path: '/orders' },
    ],
    shipper: [{ name: 'Order', path: '/orders' }],
  };

  return (
    <>
      {menu[role].map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className="text-gray-700 hover:text-green-600"
        >
          {item.name}
        </Link>
      ))}
    </>
  );
}

// Search Bar

function SearchBar() {
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
        className="border rounded-full pl-3 pr-10 py-1 text-sm w-[30vw] sm:w-[40vw]"
      />
      <button
        type="submit" // ✅ pressing Enter or clicking this triggers handleSearch
        className="absolute right-2 top-1/2 -translate-y-1/2"
      >
        <img src="src/assets/icon/search.svg" alt="search" className="h-4 w-4" />
      </button>
    </form>
  );
}

// Profile Dropdown
function ProfileDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative h-5">
      {/* Person icon */}
      <button onClick={() => setOpen(!open)}>
        <img
          src="src/assets/icon/profile.svg"
          alt="Profile"
          className="h-auto min-w-5 w-5 cursor-pointer"
        />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg">
          <Link
            to="/my-account"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            My Account
          </Link>
          <Link
            to="/logout"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Logout
          </Link>
        </div>
      )}
    </div>
  );
}

// Icons
function Icons({ role }: { role: Exclude<Role, null> }) {
  return (
    <div className="flex items-center space-x-4 relative">
      {role === 'customer' && (
        <button>
          <img src="/src/assets/icon/cart.svg" alt="Cart" className="h-auto min-w-5 w-5 cursor-pointer" />
        </button>
      )}
      <ProfileDropdown />
    </div>
  );
}

// Auth Links
function AuthLinks() {
  return (
    <div className="hidden md:flex items-center space-x-4">
      <Link to="/auth/register" className="text-gray-700 hover:text-green-600">
        Register
      </Link>
      <Link to="/auth/login" className="text-gray-700 hover:text-green-600">
        Login
      </Link>
    </div>
  );
}

// Mobile dropdown menu
function MobileMenuDropDown({
  role,
  isOpen,
  setIsOpen,
}: {
  role: Role;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  if (!isOpen) return null;

  const menu = {
    customer: [
      { name: 'Shop', path: '/shop' },
      { name: 'Order', path: '/orders' },
    ],
    vendor: [
      { name: 'Product', path: '/products' },
      { name: 'Order', path: '/orders' },
    ],
    shipper: [{ name: 'Order', path: '/orders' }],
    null: [
      { name: 'Register', path: '/register' },
      { name: 'Login', path: '/login' },
    ],
  };

  return (
    <div className="md:hidden bg-white px-4 pb-4 space-y-2">
      {menu[role ?? 'null'].map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className="block py-2 text-gray-700 hover:text-green-600"
          onClick={() => setIsOpen(false)}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}
