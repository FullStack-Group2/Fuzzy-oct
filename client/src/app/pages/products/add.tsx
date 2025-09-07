// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Tran Tu Tam
// ID: s3999159

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageIcon } from '@radix-ui/react-icons';
import toast from 'react-hot-toast';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      let imageUrl = '';

      if (formData.image) {
        const formDataForImage = new FormData();
        formDataForImage.append('image', formData.image);

        const imageResponse = await fetch(
          'http://localhost:5001/api/upload/image',
          {
            method: 'POST',
            headers: {
              Authorization: token,
            },
            body: formDataForImage,
          },
        );

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          imageUrl = imageData.image.url;
        } else {
          const errorData = await imageResponse.json();
          console.error('Error uploading image:', errorData);
          toast.error('Failed to upload image');
          return;
        }
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category, // Updated field name
        price: Number(formData.price),
        availableStock: Number(formData.availableStock),
        imageUrl,
      };

      console.log('Submitting product data:', productData); // Log productData for debugging

      const productResponse = await fetch(
        'http://localhost:5001/api/vendors/add-product',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
          body: JSON.stringify(productData),
        },
      );

      if (productResponse.ok) {
        toast.success('Product added successfully');
        setFormData({
          name: '',
          description: '',
          category: '', // Updated field name
          price: '',
          availableStock: '',
          image: null,
        });
        setImagePreview(null);
      } else {
        const errorData = await productResponse.json();
        console.error('Error adding product:', errorData); // Log backend response
        toast.error(`Failed to add product: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Error adding product');
    }
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
