import React, { useState, useEffect } from 'react';
import { Login } from './Login';
import { VendorRegistration } from '../vendor/VendorRegistration';
import { Logout } from './Logout';

interface LoggedInUser {
  id: string;
  email: string;
}

interface RegisteredVendor {
  id: string;
  username: string;
  businessName: string;
  businessAddress: string;
  profilePicture: string;
}

interface AuthenticationProps {
  onUserLoggedIn?: (user: LoggedInUser) => void;
  onUserLoggedOut?: () => void;
  onVendorRegistered?: (vendor: RegisteredVendor) => void;
}

export const Authentication: React.FC<AuthenticationProps> = ({
  onUserLoggedIn,
  onUserLoggedOut,
  onVendorRegistered,
}) => {
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login');
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);

  // Check for existing user session on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setLoggedInUser(user);
        onUserLoggedIn?.(user);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, [onUserLoggedIn]);

  const handleLoginSuccess = (user: LoggedInUser) => {
    setLoggedInUser(user);
    onUserLoggedIn?.(user);
  };

  const handleLogoutSuccess = () => {
    setLoggedInUser(null);
    if (onUserLoggedOut) {
      onUserLoggedOut();
    }
  };

  const handleRegistrationSuccess = (vendor: RegisteredVendor) => {
    onVendorRegistered?.(vendor);
    // After successful registration, switch to login view
    setCurrentView('login');
    alert('Registration successful! Please login with your credentials.');
  };

  // If user is logged in, show logout component
  if (loggedInUser) {
    return (
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome Back!
          </h2>
          <p className="text-gray-600">You are currently logged in.</p>
        </div>
        <Logout user={loggedInUser} onLogoutSuccess={handleLogoutSuccess} />
      </div>
    );
  }

  // If user is not logged in, show login/register forms
  return (
    <div className="max-w-md mx-auto">
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setCurrentView('login')}
            className={`py-2 px-4 font-medium text-sm ${
              currentView === 'login'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setCurrentView('register')}
            className={`py-2 px-4 font-medium text-sm ${
              currentView === 'register'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Register
          </button>
        </div>
      </div>

      {/* Content */}
      {currentView === 'login' ? (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setCurrentView('register')}
        />
      ) : (
        <VendorRegistration onRegistrationSuccess={handleRegistrationSuccess} />
      )}

      {/* Quick Switch Links */}
      <div className="mt-4 text-center">
        {currentView === 'login' ? (
          <p className="text-gray-600 text-sm">
            New to our platform?{' '}
            <button
              onClick={() => setCurrentView('register')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Create an account
            </button>
          </p>
        ) : (
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <button
              onClick={() => setCurrentView('login')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign in here
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
