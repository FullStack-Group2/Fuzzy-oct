import { Link } from 'react-router-dom';
import { useAuth } from '@/stores/AuthProvider';

import NavLinkItems from '@/features/layout/navbar/components/NavLinkItems';
import SearchBar from '@/features/layout/navbar/components/SearchBar';
import ProfileDropdown from '@/features/layout/navbar/components/ProfileDropDown';
import MobileMenuDropDown from '@/features/layout/navbar/components/MobileMenuDropDown';
import Cart from '@/features/layout/navbar/components/cart/Cart';
import { ShopCartDataProvider } from '@/features/layout/navbar/stores/ShopCartDataContext';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="w-full bg-white border-b sticky left-0 top-0 z-40">
      <div className=" mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        {/*left side of navbar*/}
        <div className="flex items-center space-x-4">
          {/*Logo image*/}
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Logo" className="h-auto min-w-14 w-14" />
          </Link>

          {user?.role && <NavLinkItems role={user.role} />}
        </div>

        {/* right side of navbar */}
        <div className="flex items-center space-x-4">
          {!user?.role && (
            <div className="flex items-center space-x-4">
              <Link
                to="/auth/register"
                className="text-gray-700 hover:text-green-600"
              >
                Register
              </Link>
              <Link
                to="/auth/login"
                className="text-gray-700 hover:text-green-600"
              >
                Login
              </Link>
            </div>
          )}

          {user?.role === 'CUSTOMER' && (
            <>
              <SearchBar />
              <Cart />
            </>
          )}

          {user && <ProfileDropdown />}

          {/* menu toggle */}
          {user && <MobileMenuDropDown role={user.role} />}
        </div>
      </div>
    </nav>
  );
}
