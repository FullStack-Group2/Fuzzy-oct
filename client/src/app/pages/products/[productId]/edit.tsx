import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const EditProduct: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;
  const token = localStorage.getItem('Authorization') || '';

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    categories: product?.categories || '',
    price: product?.price || '',
    availableStock: product?.availableStock || '',
    imageUrl: product?.imageUrl || '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleDeleteImage = () => {
    setFormData((prevData) => ({ ...prevData, imageUrl: '' }));
  };

  const handleReset = () => {
    setFormData({
      name: product?.name || '',
      description: product?.description || '',
      categories: product?.categories || '',
      price: product?.price || '',
      availableStock: product?.availableStock || '',
      imageUrl: product?.imageUrl || '',
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFormData((prevData) => ({ ...prevData, imageUrl: URL.createObjectURL(file) }));
    }
  };

  const handleApplyEdit = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/vendors/${product?._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token || '',
          },
          body: JSON.stringify({
            ...formData,
            price: Number(formData.price),
            availableStock: Number(formData.availableStock),
          }),
        },
      );

      if (response.ok) {
        alert('Product updated successfully');
        const data = await response.json().catch(() => null);
        const updated = data?.product;

        if (updated && typeof updated === 'object') {
          setFormData({
            name: updated.name ?? formData.name,
            description: updated.description ?? formData.description,
            categories: updated.categories ?? formData.categories,
            price: String(updated.price ?? formData.price),
            availableStock: String(updated.availableStock ?? formData.availableStock),
            imageUrl: updated.imageUrl ?? formData.imageUrl,
          });

          navigate('.', { replace: true, state: { product: updated } });
        }
      } else {
        alert('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
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

      <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit product</h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Image Section */}
        <div className="border-2 border-[#E8E8E9] rounded-md p-4 text-center">
          <div>
            <label className="block text-gray-700 text-left">Image</label>
            <label className="block mb-2 text-sm text-left font-thin">
              Uploaded image <span className="text-lg font-thin text-red-500">*</span>
            </label>
          </div>

          <div className="grid justify-center">
            <div
              className="relative mt-3 h-80 w-80
              lg:mt-4 lg:h-96 lg:w-96
              mx-auto rounded-lg group"
            >
              {formData.imageUrl ? (
                <div
                  className="absolute inset-0 bg-cover bg-center rounded-lg"
                  style={{ backgroundImage: `url(${formData.imageUrl})` }}
                ></div>
              ) : (
                <div
                  className="bg-[#1E7A5A] bg-opacity-20 rounded-lg border-2 border-dotted border-[#1E7A5A] flex items-center justify-center h-full w-full"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="imageUpload"
                  />
                  <label htmlFor="imageUpload" className="cursor-pointer flex flex-col items-center">
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
          <label className="block text-gray-700 mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          />

          <label className="block text-gray-700 mt-4 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          ></textarea>

          {/* <label className="block text-gray-700 mt-4 mb-2">Categories</label>
          <select
            name="categories"
            value={formData.categories}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="">Select category</option>
            <option value="Chairs & Seating">Chairs & Seating</option>
            <option value="Tables">Tables</option>
            <option value="Storage">Storage</option>
          </select> */}

          <label className="block text-gray-700 mt-4 mb-2">Price</label>
          <input
            type="text"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          />

          <label className="block text-gray-700 mt-4 mb-2">Available stock</label>
          <input
            type="text"
            name="availableStock"
            value={formData.availableStock}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
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
