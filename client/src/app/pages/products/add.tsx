import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageIcon } from '@radix-ui/react-icons';

export const AddProduct: React.FC = () => {
  const token = localStorage.getItem('Authorization') || '';
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categories: '',
    price: '',
    availableStock: '',
    image: null as File | null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [errors, setErrors] = useState({
    name: '',
    description: '',
    price: '',
    availableStock: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFormData((prevData) => ({ ...prevData, image: file }));

      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setFormData((prevData) => ({ ...prevData, image: null }));
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      description: '',
      price: '',
      availableStock: '',
    };

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price))) {
      newErrors.price = 'Price must be a number';
    }

    if (!formData.availableStock) {
      newErrors.availableStock = 'Available stock is required';
    } else if (isNaN(Number(formData.availableStock))) {
      newErrors.availableStock = 'Available stock must be a number';
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => !error);
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
          alert('Failed to upload image');
          return;
        }
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        categories: formData.categories,
        price: Number(formData.price),
        availableStock: Number(formData.availableStock),
        imageUrl,
      };

      const productResponse = await fetch(
        'http://localhost:5001/api/vendors/add',
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
        alert('Product added successfully');
        setFormData({
          name: '',
          description: '',
          categories: '',
          price: '',
          availableStock: '',
          image: null,
        });
        setImagePreview(null);
      } else {
        const errorData = await productResponse.json();
        console.error('Error adding product:', errorData);
        alert('Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product');
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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Image Upload Section */}
        <div className="border-2 border-[#E8E8E9] rounded-md p-4 text-center">
          <div>
            <label className="block text-gray-700 text-left">Image</label>
            <label className="block mb-2 text-sm text-left font-thin">
              Upload 1 image only <span className="text-lg font-thin text-red-500">*</span>
            </label>
          </div>

          <div className="grid justify-center">
            <div
              className="relative mt-3 h-80 w-80 lg:mt-4 lg:h-96 lg:w-96 mx-auto rounded-lg group"
            >
              {imagePreview ? (
                <div
                  className="absolute inset-0 bg-cover bg-center rounded-lg"
                  style={{ backgroundImage: `url(${imagePreview})` }}
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
                    <ImageIcon width={130} height={130} className="text-[#6D6D6D]" />
                    <div className="text-[#1E7A5A] lg:mt-10">Click to upload +</div>
                  </label>
                </div>
              )}

              {imagePreview && (
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
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}

          {/* Description Field */}
          <label className="block text-gray-700 mt-4 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={`w-full border rounded-lg p-2 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
          ></textarea>
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}

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
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">vnd</span>
          </div>
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}

          {/* Available Stock Field */}
          <label className="block text-gray-700 mt-4 mb-2">Available stock</label>
          <input
            type="text"
            name="availableStock"
            value={formData.availableStock}
            onChange={handleInputChange}
            className={`w-full border rounded-lg p-2 ${errors.availableStock ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.availableStock && <p className="text-red-500 text-sm mt-1">{errors.availableStock}</p>}
        </div>
        <div className="col-span-1 md:col-span-2 justify-end text-right mt-4 mb-2">
            <button
              type="submit"
              className="bg-green-700 text-white rounded-lg px-4 py-2"
            >
              Add product
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
