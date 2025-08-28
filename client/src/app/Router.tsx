// src/Router.tsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

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
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { Register } from './pages/auth/Register';

import Layout from './Layout';

import ShipperOrders from './pages/shipper/ShipperOrders';
import ShipperOrderDetail from './pages/shipper/ShipperOrderDetails';
import ShipperCancelOrder from './pages/shipper/ShipperCancelOrder';

import PrivacyPolicy from './pages/PrivacyPolicy';

import VendorOrders from './pages/vendor/VendorOrders';
import VendorOrderDetails from './pages/vendor/VendorOrderDetails';
import VendorCancelOrder from './pages/vendor/VendorCancelOrder';

import Modal from '@/components/Modal';

import CustomerCancelOrder from './pages/customer/CustomerCancelOrder';
import CustomerOrders from './pages/customer/CustomerOrders';
import CustomerOrderDetails from './pages/customer/CustomerOrderDetails';

import Profile from './pages/Profile';
import { useAuth } from '../stores/AuthProvider';

// Wrapper for Logout if it needs user from context (from dev branch)
const LogoutWrapper = () => {
  const { user } = useAuth();
  if (!user) return null;
  return <Logout />;
};

export default function AppRouter() {
  return (
      <InnerRoutes />
  );
}

function InnerRoutes() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | undefined;
  const backgroundLocation = state?.backgroundLocation;

  return (
    <>
      {/* Base routes (render page content). If a backgroundLocation exists, these render "behind" a modal. */}
      <Routes location={backgroundLocation || location}>
        <Route element={<Layout />}>
          {/* Public route */}
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* Auth (public-only) */}
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

          {/* Protected (any authenticated user) */}
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
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/auth/logout"
            element={
              <ProtectedRoute>
                <LogoutWrapper />
              </ProtectedRoute>
            }
          />

          {/* CUSTOMER */}
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
          <Route
            path="/customer/orders"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/orders/:orderId"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerOrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/orders/:orderId/cancel"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerCancelOrder />
              </ProtectedRoute>
            }
          />

          {/* VENDOR */}
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
            path="/vendor/orders"
            element={
              <ProtectedRoute allowedRoles={['VENDOR']}>
                <VendorOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/orders/:orderId"
            element={
              <ProtectedRoute allowedRoles={['VENDOR']}>
                <VendorOrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/orders/:orderId/reject"
            element={
              <ProtectedRoute allowedRoles={['VENDOR']}>
                <VendorCancelOrder />
              </ProtectedRoute>
            }
          />

          {/* SHIPPER */}
          <Route
            path="/shipper/orders"
            element={
              <ProtectedRoute allowedRoles={['SHIPPER']}>
                <ShipperOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shipper/orders/:orderId"
            element={
              <ProtectedRoute allowedRoles={['SHIPPER']}>
                <ShipperOrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shipper/orders/:orderId/cancel"
            element={
              <ProtectedRoute allowedRoles={['SHIPPER']}>
                <ShipperCancelOrder />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      {/* Modal routes (render on top when backgroundLocation exists) */}
      {backgroundLocation && (
        <Routes>
          <Route
            path="/shipper/orders/:orderId"
            element={
              <ProtectedRoute allowedRoles={['SHIPPER']}>
                <Modal>
                  <ShipperOrderDetail />
                </Modal>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shipper/orders/:orderId/cancel"
            element={
              <ProtectedRoute allowedRoles={['SHIPPER']}>
                <Modal>
                  <ShipperCancelOrder />
                </Modal>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/orders/:orderId"
            element={
              <ProtectedRoute allowedRoles={['VENDOR']}>
                <Modal>
                  <VendorOrderDetails />
                </Modal>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/orders/:orderId/reject"
            element={
              <ProtectedRoute allowedRoles={['VENDOR']}>
                <Modal>
                  <VendorCancelOrder />
                </Modal>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/orders/:orderId"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <Modal>
                  <CustomerOrderDetails />
                </Modal>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/orders/:orderId/cancel"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <Modal>
                  <CustomerCancelOrder />
                </Modal>
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </>
  );
}
