// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Tran Tu Tam
// ID: s3999159

import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { updateProduct } from '@/api/VendorAPI';
import { getProductById } from '@/api/VendorAPI';
import { ProductCategory } from '../add';

export const EditProduct: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;
  const token = `Bearer ${localStorage.getItem('token') || ''}`;
  const productId = product?._id || (location.pathname.split('/').pop());

  // Fetch product from backend if not present in location.state
  useEffect(() => {
    if (!productId) return;
    // If location.state?.product is missing, fetch from backend
    if (!product) {
      getProductById(productId, token).then((fetched) => {
        if (fetched) {
          setFormData({
            name: fetched.name ?? '',
            description: fetched.description ?? '',
            category: fetched.category ?? '',
            price: String(fetched.price ?? ''),
            availableStock: String(fetched.availableStock ?? ''),
            imageUrl: String(fetched.imageUrl ?? ''),
            sale: Number(fetched.sale ?? 0),
          });
        }
      });
    }
  }, [productId, product, token]);

  // Initial values
  const baseInitial = useMemo(
    () => ({
      name: product?.name,
      description: product?.description,
      category: product?.category,
      price: product?.price != null ? String(product.price) : '',
      availableStock:
        product?.availableStock != null ? String(product.availableStock) : '',
      imageUrl: product?.imageUrl,
      sale: product?.sale != null ? Number(product.sale) : '',
    }),
    [product],
  );

  // Keep form state
  const [formData, setFormData] = useState(baseInitial);
  useEffect(() => {
    setFormData(baseInitial);
  }, [baseInitial]);

  const [errors, setErrors] = useState({
    name: '',
    description: '',
    price: '',
    availableStock: '',
    sale: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleDeleteImage = () => {
    setFormData((prevData) => ({ ...prevData, imageUrl: '' }));
  };

  const handleReset = () => {
    setFormData(baseInitial); // use initial values
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFormData((prevData) => ({
        ...prevData,
        imageUrl: URL.createObjectURL(file),
      }));
    }
  };

  // Validation
  const validate = (v: typeof formData) => {
    const errs: Record<string, string> = {};
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

    // Sale discount validation
    if (v.sale === '' || v.sale === null || v.sale === undefined) {
      errs.sale = 'Sale discount is required';
    } else if (isNaN(Number(v.sale))) {
      errs.sale = 'Sale discount must be a number';
    } else if (Number(v.sale) < 0 || Number(v.sale) > 100) {
      errs.sale = 'Sale discount must be between 0 and 100';
    }

    return errs;
  };

  // Submit handler
  const handleApplyEdit = async () => {
    const errs = validate(formData);
    setErrors({
      name: errs.name || '',
      description: errs.description || '',
      price: errs.price || '',
      availableStock: errs.availableStock || '',
      sale: errs.sale || '',
    });
    if (Object.values(errs).some((v) => v)) return;

    const payload = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: Number(formData.price),
      availableStock: Number(formData.availableStock),
      imageUrl: formData.imageUrl || '',
      sale: formData.sale ? Number(formData.sale) : 0,
    };

    try {
      const updated = await updateProduct(productId, token, payload);
      if (updated) {
        alert('Product updated successfully');
        // After edit, fetch latest product from backend
        getProductById(productId, token).then((fetched) => {
          if (fetched) {
            setFormData({
              name: fetched.name ?? '',
              description: fetched.description ?? '',
              category: fetched.category ?? '',
              price: String(fetched.price ?? ''),
              availableStock: String(fetched.availableStock ?? ''),
              imageUrl: String(fetched.imageUrl ?? ''),
              sale: Number(fetched.sale ?? 0),
            });
          }
        });
      } else {
        alert('Failed to update product');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating product');
    }
  };

  return (
    <div className="bg-white p-6 text-md lg:text-lg mx-10 lg:mx-28">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="bg-gray-300 text-gray-800 rounded-lg px-4 py-2 mb-4"
      >
        Go Back
      </button>

      <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit product</h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Image Section */}
        <div className="border-2 border-[#E8E8E9] rounded-md p-4 text-center">
          <div>
            <label className="block text-gray-700 text-left">Image</label>
            <label className="block mb-2 text-sm text-left font-thin">
              Uploaded image{' '}
              <span className="text-lg font-thin text-red-500">*</span>
            </label>
          </div>

          <div className="grid justify-center">
            <div className="relative mt-3 h-80 w-80 lg:mt-4 lg:h-96 lg:w-96 mx-auto rounded-lg group">
              {formData.imageUrl ? (
                <div
                  className="absolute inset-0 bg-cover bg-center rounded-lg"
                  style={{ backgroundImage: `url(${formData.imageUrl})` }}
                />
              ) : (
                <div className="bg-[#1E7A5A] bg-opacity-20 rounded-lg border-2 border-dotted border-[#1E7A5A] flex items-center justify-center h-full w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="imageUpload"
                  />
                  <label
                    htmlFor="imageUpload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <div className="text-[#1E7A5A]">Click to upload +</div>
                  </label>
                </div>
              )}

              {formData.imageUrl && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    className="bg-red-700 text-white rounded-lg px-4 py-2"
                  >
                    Delete Image
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="border-2 border-[#E8E8E9] rounded-md p-4">
          {/* Name Field */}
          <label className="block text-gray-700 mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full border rounded-lg p-2 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}

          {/* Description Field */}
          <label className="block text-gray-700 mt-4 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={`w-full border rounded-lg p-2 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}

          {/* Category Field */}
          <label className="block text-gray-700 mt-4 mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="">Select category</option>
            {Object.values(ProductCategory).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Price Field */}
          <label className="block text-gray-700 mt-4 mb-2">Price</label>
          <div className="relative">
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className={`w-full border rounded-lg p-2 pr-10 ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              vnd
            </span>
          </div>
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price}</p>
          )}

          {/* Available Stock Field */}
          <label className="block text-gray-700 mt-4 mb-2">
            Available stock
          </label>
          <input
            type="text"
            name="availableStock"
            value={formData.availableStock}
            onChange={handleInputChange}
            className={`w-full border rounded-lg p-2 ${errors.availableStock ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.availableStock && (
            <p className="text-red-500 text-sm mt-1">{errors.availableStock}</p>
          )}

          {/* Sale Field */}
          <label className="block text-gray-700 mb-2">
            Sale Discount (%)
          </label>
          <input
            type="text"
            name="sale"
            value={formData.sale}
            onChange={handleInputChange}
            className={`w-full border rounded-lg p-2 ${errors.sale ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.sale && (
            <p className="text-red-500 text-sm mt-1">{errors.sale}</p>
          )}
        </div>

        <div className="col-span-1 md:col-span-2 justify-end text-right mt-4 mb-2">
          <button
            type="button"
            onClick={handleReset}
            className="bg-black text-white rounded-lg px-4 py-2 mr-2"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={handleApplyEdit}
            className="bg-green-700 text-white rounded-lg px-4 py-2"
          >
            Apply edit
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
