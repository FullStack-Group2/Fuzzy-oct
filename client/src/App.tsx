import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login, LoggedInUser } from './app/auth/Login';
import {
  RegistrationFlow,
  RegisteredUser,
} from './app/auth/sign-up/RegistrationFlow';
import { PasswordResetFlow } from './app/auth/PasswordResetFlow';
import { VendorProfile } from './app/vendor/VendorProfile';
import { CustomerProfile } from './app/customer/CustomerProfile';
import { ShipperProfile } from './app/shipper/ShipperProfile';

type User = LoggedInUser | RegisteredUser | null;

function App() {
  const [user, setUser] = useState<User>(null);

  const handleLoginSuccess = (loggedInUser: LoggedInUser) => {
    setUser(loggedInUser);
    console.log('User logged in:', loggedInUser);
  };

  const handleRegistrationSuccess = (registeredUser: RegisteredUser) => {
    setUser(registeredUser);
    console.log('User registered:', registeredUser);
  };

  // If user is logged in, show appropriate profile based on role
  if (user) {
    const renderProfileComponent = () => {
      // Check user role and render appropriate profile component
      const userRole = (user as LoggedInUser & { role?: string }).role;
      console.log('Rendering profile for role:', userRole);
      
      switch (userRole) {
        case 'VENDOR':
          return (
            <VendorProfile 
              vendorId={user.id} 
              initialVendor={{
                id: user.id,
                username: user.username,
                email: (user as LoggedInUser & { email?: string }).email || 'N/A',
                businessName: (user as LoggedInUser & { businessName?: string }).businessName || 'N/A',
                businessAddress: (user as LoggedInUser & { businessAddress?: string }).businessAddress || 'N/A',
                profilePicture: (user as LoggedInUser & { profilePicture?: string }).profilePicture || '',
              }}
            />
          );
        
        case 'CUSTOMER':
          return (
            <CustomerProfile 
              customerId={user.id} 
              initialCustomer={{
                id: user.id,
                username: user.username,
                email: (user as LoggedInUser & { email?: string }).email || 'N/A',
                name: (user as LoggedInUser & { name?: string }).name || 'N/A',
                address: (user as LoggedInUser & { address?: string }).address || 'N/A',
                profilePicture: (user as LoggedInUser & { profilePicture?: string }).profilePicture || '',
              }}
            />
          );
        
        case 'SHIPPER':
          return (
            <ShipperProfile 
              shipperId={user.id} 
              initialShipper={{
                id: user.id,
                username: user.username,
                email: (user as LoggedInUser & { email?: string }).email || 'N/A',
                assignedHub: (user as LoggedInUser & { assignedHub?: string }).assignedHub || undefined,
                profilePicture: (user as LoggedInUser & { profilePicture?: string }).profilePicture || '',
              }}
            />
          );
        
        default:
          // Fallback to vendor profile if role is not recognized
          return (
            <VendorProfile 
              vendorId={user.id} 
              initialVendor={{
                id: user.id,
                username: user.username,
                email: (user as LoggedInUser & { email?: string }).email || 'N/A',
                businessName: (user as LoggedInUser & { businessName?: string }).businessName || 'N/A',
                businessAddress: (user as LoggedInUser & { businessAddress?: string }).businessAddress || 'N/A',
                profilePicture: (user as LoggedInUser & { profilePicture?: string }).profilePicture || '',
              }}
            />
          );
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header with Logout */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome, {user.username}!
            </h1>
            <button
              onClick={() => setUser(null)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>

          {/* Profile Component based on user role */}
          {renderProfileComponent()}
        </div>
      </div>
    );
  }

  // Show routes for authentication
  return (
    <Routes>
      <Route 
        path="/" 
        element={<Navigate to="/login" replace />} 
      />
      <Route 
        path="/login" 
        element={
          <Login
            onLoginSuccess={handleLoginSuccess}
          />
        } 
      />
      <Route 
        path="/register" 
        element={
          <RegistrationFlow
            onRegistrationSuccess={handleRegistrationSuccess}
          />
        } 
      />
      <Route 
        path="/forgot-password" 
        element={<PasswordResetFlow />} 
      />
    </Routes>
  );
}

export default App;
