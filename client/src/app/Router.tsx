import { Routes, Route } from 'react-router-dom';

import { AuthProvider } from './AuthProvider';
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from './pages/routers/ProtectedRoute';

import NotFound from './pages/NotFound';
import Home from './pages';
import Orders from './pages/Orders';
import Products from './pages/products';
import AddProduct from './pages/products/add';
import EditProduct from './pages/products/[productId]/edit';
import ProductDetail from './pages/products/[productId]';
import Shop from './pages/Shop';
import StoreDetail from './pages/stores/[storeId]';
import { Login } from './pages/auth/Login';
import { Logout } from './pages/auth/Logout';

import Layout from './Layout';
import { useAuth } from './AuthProvider';
import { RegistrationFlow } from './pages/auth/sign-up/RegistrationFlow';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ShipperProfile } from './pages/shipper/ShipperProfile';
import { CustomerProfile } from './pages/customer/CustomerProfile';
import { VendorProfile } from './pages/vendor/VendorProfile';

// Wrapper component for Logout that injects user from context
const LogoutWrapper = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return <Logout />;
};

export default function AppRouter() {
  return (
    <AuthProvider>
      <Routes>
        {/* Auth routes - only accessible when NOT logged in */}
        <Route
          path="/auth/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/auth/register"
          element={
            <PublicOnlyRoute>
              <RegistrationFlow />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/auth/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPassword />
            </PublicOnlyRoute>
          }
        />
        <Route element={<Layout />}>
          {/* Public routes accessible to everyone */}

          {/* Protected routes that require authentication */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          {/* Vendor-only routes */}
          <Route
            path="/vendor/profile"
            element={
              <ProtectedRoute allowedRoles={['VENDOR']}>
                <VendorProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={['VENDOR']}>
                <Products />
              </ProtectedRoute>
            }
          />

          <Route
            path="/products/add"
            element={
              <ProtectedRoute allowedRoles={['VENDOR']}>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['VENDOR']}>
                <EditProduct />
              </ProtectedRoute>
            }
          />

          {/* Customer-only routes */}

          <Route
            path="/customer/profile"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <Shop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <ProductDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stores/:id"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <StoreDetail />
              </ProtectedRoute>
            }
          />
          {/* Shipper routes */}
          <Route
            path="/shipper/profile"
            element={
              <ProtectedRoute allowedRoles={['SHIPPER']}>
                <ShipperProfile />
              </ProtectedRoute>
            }
          />
          {/* Logout route - requires authentication */}
          <Route
            path="/auth/logout"
            element={
              <ProtectedRoute>
                <LogoutWrapper />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
