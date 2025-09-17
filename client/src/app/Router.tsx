// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri,
// ID: 4010989,

import { Routes, Route, useLocation } from 'react-router-dom';
import type { Location } from 'react-router-dom';

import {
  ProtectedRoute,
  PublicOnlyRoute,
} from '../features/auth/ProtectedRoute';

import Layout from './Layout';
import NotFound from './pages/NotFound';
import Home from './pages';
import Orders from './pages/Orders';
import Products from './pages/products';
import AddProduct from './pages/products/add';
import EditProduct from './pages/products/[productId]/edit';
import ProductDetail from './pages/products/[productId]';
import Shop from './pages/Shop';

import { Login } from './pages/auth/Login';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { Register } from './pages/auth/Register';
import { Logout } from './pages/auth/Logout';

import PrivacyPolicy from './pages/PrivacyPolicy';
import Contact from './pages/Contact';
import Profile from './pages/Profile';

import ShipperOrders from './pages/shipper/ShipperOrders';
import ShipperOrderDetail from './pages/shipper/ShipperOrderDetails';
import ShipperCancelOrder from './pages/shipper/ShipperCancelOrder';

import VendorOrders from './pages/vendor/VendorOrders';
import VendorOrderDetails from './pages/vendor/VendorOrderDetails';
import VendorCancelOrder from './pages/vendor/VendorCancelOrder';

import CustomerCancelOrder from './pages/customer/CustomerCancelOrder';
import CustomerOrders from './pages/customer/CustomerOrders';
import CustomerOrderDetails from './pages/customer/CustomerOrderDetails';

import Modal from '@/components/Modal';
import { useAuth } from '../stores/AuthProvider';
import Faq from './pages/Faq';
import { ProductDetailDataProvider } from '@/features/shop/stores/ProductDetailDataContext';
import { ShopProductDataProvider } from '@/features/shop/stores/ShopProductDataContext';
import { toast, Toaster, ToastBar } from 'react-hot-toast';
import About from './pages/About';
import ChatPanel from './pages/ChatPanel';
import ChatPage from './pages/ChatPage';
import HomeGate from '@/components/HomeGate';

// Wrapper for Logout if it needs user from context
const LogoutWrapper = () => {
  const { user } = useAuth();
  if (!user) return null;
  return <Logout />;
};

export default function AppRouter() {
  return <InnerRoutes />;
}

function InnerRoutes() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | undefined;
  const backgroundLocation = state?.backgroundLocation;

  return (
    <>
      {/*Toaster to show error or success message*/}
      <Toaster>
        {(t) => (
          <ToastBar toast={t}>
            {({ icon, message }) => (
              <>
                {icon}
                {message}
                {t.type !== 'loading' && (
                  <button onClick={() => toast.dismiss(t.id)}>X</button>
                )}
              </>
            )}
          </ToastBar>
        )}
      </Toaster>

      {/* Base routes (render page content). If a backgroundLocation exists, these render "behind" a modal. */}
      <Routes location={backgroundLocation || location}>
        <Route element={<Layout />}>
          {/* Public routes */}
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          <Route path="/contact" element={<Contact />} />

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
                <HomeGate />
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
                <ShopProductDataProvider>
                  <Shop />
                </ShopProductDataProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop/:shopId"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <ShopProductDataProvider>
                  <Shop />
                </ShopProductDataProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <ProductDetailDataProvider>
                  <ProductDetail />
                </ProductDetailDataProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/orders"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/orders/:orderId"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerOrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/orders/:orderId/cancel"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerCancelOrder />
              </ProtectedRoute>
            }
          />

          {/* VENDOR */}
          {/* <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:senderId/:receiverId"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPanel /> {/* sidebar + Outlet */}
              </ProtectedRoute>
            }
          >
            <Route path=":senderId/:receiverId" element={<ChatPage />} />
          </Route>

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
            path="/vendors/orders"
            element={
              <ProtectedRoute allowedRoles={['VENDOR']}>
                <VendorOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendors/orders/:orderId"
            element={
              <ProtectedRoute allowedRoles={['VENDOR']}>
                <VendorOrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendors/orders/:orderId/reject"
            element={
              <ProtectedRoute allowedRoles={['VENDOR']}>
                <VendorCancelOrder />
              </ProtectedRoute>
            }
          />

          {/* SHIPPER */}
          <Route
            path="/shippers/orders"
            element={
              <ProtectedRoute allowedRoles={['SHIPPER']}>
                <ShipperOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shippers/orders/:orderId"
            element={
              <ProtectedRoute allowedRoles={['SHIPPER']}>
                <ShipperOrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shippers/orders/:orderId/cancel"
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
          {/* SHIPPER (fixed to plural paths) */}
          <Route
            path="/shippers/orders/:orderId"
            element={
              <ProtectedRoute allowedRoles={['SHIPPER']}>
                <Modal>
                  <ShipperOrderDetail />
                </Modal>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shippers/orders/:orderId/cancel"
            element={
              <ProtectedRoute allowedRoles={['SHIPPER']}>
                <Modal>
                  <ShipperCancelOrder />
                </Modal>
              </ProtectedRoute>
            }
          />

          {/* VENDOR (fixed to plural paths) */}
          <Route
            path="/vendors/orders/:orderId"
            element={
              <ProtectedRoute allowedRoles={['VENDOR']}>
                <Modal>
                  <VendorOrderDetails />
                </Modal>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendors/orders/:orderId/reject"
            element={
              <ProtectedRoute allowedRoles={['VENDOR']}>
                <Modal>
                  <VendorCancelOrder />
                </Modal>
              </ProtectedRoute>
            }
          />

          {/* CUSTOMER (fixed to plural paths) */}
          <Route
            path="/customers/orders/:orderId"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <Modal>
                  <CustomerOrderDetails />
                </Modal>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/orders/:orderId/cancel"
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
