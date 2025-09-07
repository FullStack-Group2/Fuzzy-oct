// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Tran Tu Tam
// ID: s3999159

import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductForm, { ProductFormErrors, ProductFormValues } from '@/components/products/ProductForm';
import { updateProduct } from '@/api/VendorAPI';
import { ProductCategory } from '../add';

export const EditProduct: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;
  const token = `Bearer ${localStorage.getItem('token') || ''}`;

  // Initial values from the passed product
  const baseInitial: ProductFormValues = useMemo(() => ({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    price: product?.price != null ? String(product.price) : '',
    availableStock: product?.availableStock != null ? String(product.availableStock) : '',
    imageUrl: product?.imageUrl || '',
    imageFile: null,
  }), [product]);

  // key to force re-mount on Reset
  const [formKey, setFormKey] = useState(0);

  const validate = (v: ProductFormValues): ProductFormErrors => {
    const errs: ProductFormErrors = {};
    if (!v.name) errs.name = 'Name is required';
    else if (v.name.length < 10 || v.name.length > 20) errs.name = 'Name must be between 10 and 20 characters';

    if (!v.description) errs.description = 'Description is required';
    else if (v.description.length > 500) errs.description = 'Description must not exceed 500 characters';

    if (!v.price) errs.price = 'Price is required';
    else if (isNaN(Number(v.price))) errs.price = 'Price must be a number';

    if (!v.availableStock) errs.availableStock = 'Available stock is required';
    else if (isNaN(Number(v.availableStock)))
      errs.availableStock = 'Available stock must be a number';

    return errs;
  };

  const onSubmit = async (v: ProductFormValues) => {
    const payload: Parameters<typeof updateProduct>[2] = {
      name: v.name,
      description: v.description,
      category: v.category,
      price: Number(v.price),
      availableStock: Number(v.availableStock),
      imageUrl: v.imageUrl || '',
    };

    const data = await updateProduct(product?._id, token, payload);

    if (data) {
      alert('Product updated successfully');
      const updated = data?.product ?? payload;

      navigate('.', { replace: true, state: { product: updated } });
    } else {
      alert('Failed to update product');
    }
  };

  const onReset = () => {
    setFormKey((k) => k + 1);
  };

  return (
    <div className="bg-white p-6 text-md lg:text-lg">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="bg-gray-300 text-gray-800 rounded-lg px-4 py-2 mb-4"
      >
        Go Back
      </button>

      <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit product</h2>

      <div key={formKey}>
        <ProductForm
          mode="edit"
          initialValues={baseInitial}
          categories={Object.values(ProductCategory)}
          validate={validate}
          onSubmit={onSubmit}
          onReset={onReset}
          submitLabel="Apply edit"
        />
      </div>
    </div>
  );
};

export default EditProduct;