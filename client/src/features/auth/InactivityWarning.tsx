import React from 'react';
import { useAuth } from '../../stores/AuthProvider';

export const InactivityWarning: React.FC = () => {
  const {
    showInactivityWarning,
    setShowInactivityWarning,
    resetInactivityTimer,
    logout,
  } = useAuth();

  const handleStayLoggedIn = () => {
    setShowInactivityWarning(false);
    resetInactivityTimer();
  };

  const handleLogout = () => {
    logout(false);
  };

  if (!showInactivityWarning) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Session Timeout Warning
          </h3>
        </div>

        <p className="text-gray-600 mb-6">
          Your session will expire in 2 minutes due to inactivity. Would you
          like to stay logged in?
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleStayLoggedIn}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Stay Logged In
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default InactivityWarning;
