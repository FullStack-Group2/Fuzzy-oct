import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { useAuth } from '../../../stores/AuthProvider';
import { useNavigate } from 'react-router-dom';

interface LogoutProps {
  onLogoutSuccess?: () => void;
}

export const Logout: React.FC<LogoutProps> = ({ onLogoutSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);

    try {
      // Use AuthProvider's logout method instead of manual API call
      await logout(true); // Pass true to show success toast

      console.log('Logout successful');
      onLogoutSuccess?.();
      navigate('/auth/login');
      alert('Logged out successfully!');
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
