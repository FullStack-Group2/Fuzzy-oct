import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/stores/AuthProvider';

type ProductDetailType = {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  vendor: string; // vendorId reference
  availableStock: number;
  category: string;
  sale:number;
};

export type VendorType = {
  _id: string;
  username: string;
  role: 'VENDOR' | '';
  businessName: string;
  businessAddress: string;
  profilePicture: string;
};

type ProductDetailDataContextType = {
  product: ProductDetailType;
  vendor: VendorType;
  loading: boolean;
  error: string | null;
};

// --- Default empty objects ---
const defaultProduct: ProductDetailType = {
  _id: '',
  name: '',
  price: 0,
  imageUrl: '',
  description: '',
  vendor: '',
  availableStock: 0,
  category: '',
  sale:0,
};

const defaultVendor: VendorType = {
  _id: '',
  username: '',
  role: '',
  businessName: '',
  businessAddress: '',
  profilePicture: '',
};

const ProductDetailDataContext = createContext<ProductDetailDataContextType>({
  product: defaultProduct,
  vendor: defaultVendor,
  loading: false,
  error: null,
});

export const ProductDetailDataProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();

  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<ProductDetailType>(defaultProduct);
  const [vendor, setVendor] = useState<VendorType>(defaultVendor);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- 1) Fetch product ---
  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();
    setError(null);
    setProduct(defaultProduct);
    setVendor(defaultVendor);

    // Check role + token
    const token = localStorage.getItem('token');

    if (user && user.role === 'CUSTOMER' && token) {
      setLoading(true);

      fetch(`http://localhost:5001/api/customers/products/${id}`, {
        signal: controller.signal,
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          // console.log(`check data in product detail: ${JSON.stringify(data)}`);
          setProduct(data.product as ProductDetailType);
          setVendor(data.vendor as VendorType);
        })
        .catch((err: any) => {
          if (err.name !== 'AbortError') {
            setError('Failed to fetch product');
            // console.error('Product fetch failed:', err);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    } else {
      controller.abort();
      setProduct(defaultProduct);
      setVendor(defaultVendor);
    }
    return () => controller.abort();
  }, [id]);

  return (
    <ProductDetailDataContext.Provider
      value={{ product, vendor, loading, error }}
    >
      {children}
    </ProductDetailDataContext.Provider>
  );
};

export const useProductDetail = () => useContext(ProductDetailDataContext);
