// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Tran Tu Tam
// ID: s3999159

import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm, { ProductFormErrors, ProductFormValues } from '@/components/products/ProductForm';
import { uploadProductImage, createProduct } from '@/api/VendorAPI';

export enum ProductCategory {
  SOFAS = 'SOFAS',
  CHAIRS = 'CHAIRS',
  TABLES = 'TABLES',
  BEDS = 'BEDS',
  WARDROBES = 'WARDROBES',
  CABINETS = 'CABINETS',
  SHELVES = 'SHELVES',
  DECORATION = 'DECORATION',
  OTHERS = 'OTHERS',
}

export const AddProduct: React.FC = () => {
  const token = `Bearer ${localStorage.getItem('token') || ''}`;
  const navigate = useNavigate();

  const initialValues: ProductFormValues = {
    name: '',
    description: '',
    category: '',
    price: '',
    availableStock: '',
    imageUrl: '',
    imageFile: null,
  };

  const validate = (v: ProductFormValues): ProductFormErrors => {
    const errs: ProductFormErrors = {};
    if (!v.name) errs.name = 'Name is required';
    else if (v.name.length < 10 || v.name.length > 20)
      errs.name = 'Name must be between 10 and 20 characters';

    if (!v.description) errs.description = 'Description is required';
    else if (v.description.length > 500)
      errs.description = 'Description must not exceed 500 characters';

    if (!v.price) errs.price = 'Price is required';
    else if (isNaN(Number(v.price))) errs.price = 'Price must be a number';

    if (!v.availableStock) errs.availableStock = 'Available stock is required';
    else if (isNaN(Number(v.availableStock)))
      errs.availableStock = 'Available stock must be a number';

    return errs;
  };

  const onSubmit = async (v: ProductFormValues) => {
    let imageUrl = '';
    if (v.imageFile) {
      imageUrl = await uploadProductImage(token, v.imageFile);
    }

    await createProduct(token, {
      name: v.name,
      description: v.description,
      category: v.category,
      price: Number(v.price),
      availableStock: Number(v.availableStock),
      imageUrl,
    });

    alert('Product added successfully');
  };

  return (
    <div className="bg-white p-6 text-md lg:text-lg mx-10 md:mx-28">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="bg-gray-300 text-gray-800 rounded-lg px-4 py-2 mb-4"
      >
        Go Back
      </button>

      <h2 className="text-2xl font-bold mb-4 text-gray-800">Add new product</h2>

      <ProductForm
        mode="add"
        initialValues={initialValues}
        categories={Object.values(ProductCategory)}
        validate={validate}
        onSubmit={onSubmit}
        resetOnSuccess
        submitLabel="Add product"
      />
    </div>
  );
};

export default AddProduct;
