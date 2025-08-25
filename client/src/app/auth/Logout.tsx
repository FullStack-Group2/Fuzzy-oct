import { Button } from '@/components/ui/button';
import React, { useState } from 'react';

interface LoggedInUser {
  id: string;
  email: string;
}

interface LogoutProps {
  user: LoggedInUser;
  onLogoutSuccess?: () => void;
}

export const Logout: React.FC<LogoutProps> = ({ user, onLogoutSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Clear user data from localStorage
        localStorage.removeItem('user');

        console.log('Logout successful');
        onLogoutSuccess?.();
        alert('Logged out successfully!');
      } else {
        console.error('Logout failed');
        alert('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Network error during logout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center">
            <span className="font-medium text-sm">
              {user.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.email}</p>
          </div>
        </div>

        <Button
          onClick={handleLogout}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium text-sm ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
          } text-white`}
        >
          {loading ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
    </div>
  );
};
