import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthProvider';

import { MdOutlinePerson } from 'react-icons/md';

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  // Determine profile path based on user role
  const getProfilePath = () => {
    if (!user) return '/auth/login';

    switch (user.role) {
      case 'VENDOR':
        return '/vendor/profile';
      case 'CUSTOMER':
        return '/customer/profile';
      case 'SHIPPER':
        return '/shipper/profile';
      default:
        return '/profile';
    }
  };

  return (
    <div className="relative h-[32px]">
      <button onClick={() => setOpen(!open)}>
        <MdOutlinePerson className="size-8" />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg">
          <Link
            to={getProfilePath()}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            My Account
          </Link>
          <Link
            to="/auth/logout"
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
