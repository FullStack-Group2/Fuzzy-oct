import React, { useState } from 'react';
import { VendorProfile } from './components/VendorProfile';
import { VendorRegistration } from './components/VendorRegistration';
import { Login } from './components/Login';

interface RegisteredVendor {
  id: string;
  username: string;
  businessName: string;
  businessAddress: string;
  profilePicture: string;
}

interface LoggedInUser {
  id: string;
  email: string;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    'home' | 'login' | 'register' | 'profile'
  >('home');
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
  const [registeredVendor, setRegisteredVendor] =
    useState<RegisteredVendor | null>(null);

  // Check for existing user session on component mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setLoggedInUser(user);
        setCurrentView('profile');
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLoginSuccess = (user: LoggedInUser) => {
    setLoggedInUser(user);
    setCurrentView('profile');
    console.log('User logged in:', user);
  };

  const handleRegistrationSuccess = (vendor: RegisteredVendor) => {
    setRegisteredVendor(vendor);
    setCurrentView('login');
    alert('Registration successful! Please login with your credentials.');
    console.log('Vendor registered:', vendor);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setRegisteredVendor(null);
    localStorage.removeItem('user');
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              E-Commerce Vendor Management
            </h1>
            <div className="flex items-center space-x-4">
              {loggedInUser && (
                <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  Logged in: {loggedInUser.email}
                </div>
              )}
              <div className="text-sm text-gray-500">
                Vendor Registration System
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Home View - Show Login/Register buttons */}
          {currentView === 'home' && (
            <div className="text-center">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to Vendor Portal
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Manage your vendor profile and business information
                </p>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setCurrentView('login')}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  🔐 Login
                </button>
                <button
                  onClick={() => setCurrentView('register')}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  🏪 Register
                </button>
              </div>
            </div>
          )}

          {/* Login View */}
          {currentView === 'login' && (
            <div>
              <div className="text-center mb-6">
                <button
                  onClick={() => setCurrentView('home')}
                  className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
                >
                  ← Back to Home
                </button>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Vendor Login
                </h2>
              </div>

              <Login
                onLoginSuccess={handleLoginSuccess}
                onSwitchToRegister={() => setCurrentView('register')}
              />
            </div>
          )}

          {/* Register View */}
          {currentView === 'register' && (
            <div>
              <div className="text-center mb-6">
                <button
                  onClick={() => setCurrentView('home')}
                  className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
                >
                  ← Back to Home
                </button>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Vendor Registration
                </h2>
              </div>

              <VendorRegistration
                onRegistrationSuccess={handleRegistrationSuccess}
              />

              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  Already have an account?{' '}
                  <button
                    onClick={() => setCurrentView('login')}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Login here
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Profile View - Only accessible when logged in */}
          {currentView === 'profile' && loggedInUser && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Vendor Profile
                </h2>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vendor Profile */}
                <VendorProfile
                  vendorId={loggedInUser.id}
                  initialVendor={
                    registeredVendor
                      ? {
                          ...registeredVendor,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        }
                      : undefined
                  }
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
