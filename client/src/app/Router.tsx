import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import authRole from '@/stores/authStore';

import NotFound from './pages/NotFound';
import Home from './pages';
import Orders from './pages/Orders';
import Products from './pages/products';
import AddProduct from './pages/products/add';
import EditProduct from './pages/products/[productId]/edit';
import ProductDetail from './pages/products/[productId]';
import Shop from './pages/Shop';
import StoreDetail from './pages/stores/[storeId]';
import Login from './pages/auth/Login';
import Logout from './pages/auth/Logout';
import ForgotPassword from './pages/auth/ForgotPassword';
import Register from './pages/auth/Register';
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

export default function AppRouter() {
  return (
    <BrowserRouter>
      <InnerRoutes></InnerRoutes>
    </BrowserRouter>
  );

  function InnerRoutes() {
    const location = useLocation();
    const state = location.state as
      | { backgroundLocation?: Location }
      | undefined;
    const backgroundLocation = state?.backgroundLocation;

    return (
      <>
        <Routes location={backgroundLocation || location}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />

            {authRole !== null && <Route path="/orders" element={<Orders />} />}

            {authRole == 'vendor' && (
              <>
                <Route path="/products" element={<Products />} />
                <Route path="/products/add" element={<AddProduct />} />
                <Route path="/products/:id/edit" element={<EditProduct />} />
                <Route path="/vendor/orders" element={<VendorOrders />} />
                <Route path="/vendor/orders/:orderId" element={<VendorOrderDetails />} />
                <Route path="/vendor/orders/:orderId/reject" element={<VendorCancelOrder />} />
              </>
            )}

            {authRole == 'customer' && (
              <>
                <Route path="/shop" element={<Shop />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/stores/:id" element={<StoreDetail />} />
                <Route path="/customer/orders" element={<CustomerOrders />} />
                <Route path="/customer/orders/:orderId" element={<CustomerOrderDetails />} />
                <Route path="/customer/orders/:orderId/cancel" element={<CustomerCancelOrder />} />
              </>
            )}

            {/* Auth */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/logout" element={<Logout />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />

            {authRole == 'shipper' && (
              <>
                <Route path="/shipper/orders" element={<ShipperOrders />} />
                <Route path="/shipper/orders/:orderId" element={<ShipperOrderDetail />} />
                <Route path="/shipper/orders/:orderId/cancel" element={<ShipperCancelOrder />} />
              </>
            )}

            <Route path="/privacy" element={<PrivacyPolicy />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        {backgroundLocation && (
          <Routes>
            <Route
              path="/shipper/orders/:orderId"
              element={
                <Modal>
                  <ShipperOrderDetail />
                </Modal>
              }
            />
            <Route
              path="/shipper/orders/:orderId/cancel"
              element={
                <Modal>
                  <ShipperCancelOrder />
                </Modal>
              }
            />

            <Route
              path="/vendor/orders/:orderId"
              element={
                <Modal>
                  <VendorOrderDetails />
                </Modal>
              }
            />
            <Route
              path="/vendor/orders/:orderId/reject"
              element={
                <Modal>
                  <VendorCancelOrder />
                </Modal>
              }
            />
            <Route
              path="/customer/orders/:orderId"
              element={
                <Modal>
                  <CustomerOrderDetails />
                </Modal>
              }
            />
            <Route
              path="/customer/orders/:orderId/cancel"
              element={
                <Modal>
                  <CustomerCancelOrder />
                </Modal>
              }
            />
          </Routes>
        )}
      </>
    );
  }
}
