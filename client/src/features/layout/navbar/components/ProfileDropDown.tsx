import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../stores/AuthProvider';

import { MdOutlinePerson } from 'react-icons/md';

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setOpen(false);

    try {
      await logout(true); // Pass true to show success toast
      console.log('Logout successful');
    } catch (error) {
      console.error('Error during logout:', error);
      // You might want to show an error message here
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative h-[32px]">
      <button onClick={() => setOpen(!open)} disabled={isLoggingOut}>
        <MdOutlinePerson className="size-8" />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg">
          <Link
            to="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            My Account
          </Link>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      )}
    </div>
  );
}
