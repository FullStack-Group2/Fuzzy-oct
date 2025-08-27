import { Routes, Route } from 'react-router-dom';
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from '../features/auth/ProtectedRoute';

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
import { useAuth } from '../stores/AuthProvider';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { Register } from './pages/auth/Register';
import Profile from './pages/Profile';

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
            <Register />
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

        {/* profile routes - requires authentications */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
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
  );
}
