import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import About from './pages/About';
import FAQ from './pages/FAQ';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />

          {authRole !== null && <Route path="/orders" element={<Orders />} />}

          {authRole == 'vendor' && (
            <>
              <Route path="/products" element={<Products />} />
              <Route path="/products/add" element={<AddProduct />} />
              <Route path="/products/:id/edit" element={<EditProduct />} />
            </>
          )}

          {authRole == 'customer' && (
            <>
              <Route path="/shop" element={<Shop />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/stores/:id" element={<StoreDetail />} />
            </>
          )}

          {/* Auth */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/logout" element={<Logout />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
