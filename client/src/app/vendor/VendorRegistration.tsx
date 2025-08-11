import { Button } from '@/components/ui/button';
import React, { useState } from 'react';

interface VendorRegistrationData {
  username: string;
  password: string;
  businessName: string;
  businessAddress: string;
  profilePicture?: string;
}

interface RegisteredVendor {
  id: string;
  username: string;
  businessName: string;
  businessAddress: string;
  profilePicture: string;
}

interface VendorRegistrationProps {
  onRegistrationSuccess?: (vendor: RegisteredVendor) => void;
}

export const VendorRegistration: React.FC<VendorRegistrationProps> = ({
  onRegistrationSuccess,
}) => {
  const [formData, setFormData] = useState<VendorRegistrationData>({
    username: '',
    password: '',
    businessName: '',
    businessAddress: '',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);
  const [registering, setRegistering] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfileImage = async (): Promise<string | null> => {
    if (!profileImage) return null;

    const formDataUpload = new FormData();
    formDataUpload.append('image', profileImage);

    try {
      const response = await fetch('http://localhost:5001/api/upload/image', {
        method: 'POST',
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        return data.image.url;
      } else {
        console.error('Image upload failed');
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);

    try {
      // First upload the profile image if selected
      let profilePictureUrl = '';
      if (profileImage) {
        setUploading(true);
        console.log('Uploading profile image...');
        const imageUrl = await uploadProfileImage();
        setUploading(false);

        if (imageUrl) {
          profilePictureUrl = imageUrl;

          console.log('Profile image uploaded successfully:', imageUrl);
        } else {
          alert('Failed to upload profile image. Please try again.');
          return;
        }
      }

      // Then register the vendor with the uploaded image URL
      const vendorData = {
        ...formData,
        profilePicture: profilePictureUrl,
      };

      console.log('Registering vendor with data:', {
        ...vendorData,
        password: '[HIDDEN]',
      });

      // Note: Replace this with your actual vendor registration endpoint
      const response = await fetch(
        'http://localhost:5001/api/auth/register/vendor',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(vendorData),
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Vendor registered successfully:', data);
        onRegistrationSuccess?.(data.vendor);

        // Reset form
        setFormData({
          username: '',
          password: '',
          businessName: '',
          businessAddress: '',
        });
        setProfileImage(null);
        setProfileImagePreview(null);

        alert('Vendor registered successfully!');
      } else {
        const errorData = await response.json();
        console.error('Registration failed:', errorData);
        alert(`Registration failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Error during registration. Please try again.');
    } finally {
      setRegistering(false);
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Register as Vendor
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Profile Picture Upload */}
        <div className="text-center">
          <div className="mb-4">
            {profileImagePreview ? (
              <img
                src={profileImagePreview}
                alt="Profile preview"
                className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-gray-200"
                style={{ width: '200px', height: '200px' }}
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto border-4 border-gray-200">
                <span className="text-gray-500 text-2xl">📷</span>
              </div>
            )}
          </div>

          <label className="block">
            <span className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 text-sm">
              {profileImage
                ? 'Change Profile Picture'
                : 'Upload Profile Picture'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>

          {uploading && (
            <p className="text-sm text-blue-600 mt-2">Uploading image...</p>
          )}
        </div>

        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Username *
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your username"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
          />
        </div>

        {/* Business Name */}
        <div>
          <label
            htmlFor="businessName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Business Name *
          </label>
          <input
            type="text"
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your business name"
          />
        </div>

        {/* Business Address */}
        <div>
          <label
            htmlFor="businessAddress"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Business Address *
          </label>
          <textarea
            id="businessAddress"
            name="businessAddress"
            value={formData.businessAddress}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your business address"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={registering || uploading}
          className={`w-full py-2 px-4 rounded-lg font-medium ${
            registering
          } text-white`}
        >
          {registering ? 'Registering...' : 'Register Vendor'}
        </Button>
      </form>
    </div>
  );
};
