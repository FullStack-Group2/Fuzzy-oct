import { Link } from 'react-router-dom';
import authRole from '@/stores/authStore';

import NavLinkItems from '@/features/navbar/NavLinkItems';
import SearchBar from '@/features/navbar/SearchBar';
import ProfileDropdown from '@/features/navbar/ProfileDropDown';
import MobileMenuDropDown from '@/features/navbar/MobileMenuDropDown';
import Cart from '@/features/navbar/Cart/Cart';

export default function Navbar() {
  return (
    <nav className="w-full bg-white border-b sticky left-0 top-0 z-40">
      <div className=" mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        {/*left side of navbar*/}
        <div className="flex items-center space-x-4">
          {/*Logo image*/}
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Logo" className="h-auto min-w-14 w-14" />
          </Link>

          {authRole && <NavLinkItems role={authRole} />}
        </div>

        {/* right side of navbar */}
        <div className="flex items-center space-x-4">
          {!authRole && (
            <div className="hidden md:flex items-center space-x-4">
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

          {authRole === 'customer' && (
            <>
              <SearchBar />
              <Cart />
            </>
          )}

          <ProfileDropdown />

          {/* menu toggle */}
          <MobileMenuDropDown role={authRole} />
        </div>
      </div>
    </nav>
  );
}
