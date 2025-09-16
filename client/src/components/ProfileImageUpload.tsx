// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author:
// ID:

import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  userName: string;
  onImageUpload: (imageUrl: string) => void;
  className?: string;
}

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImageUrl,
  userName,
  onImageUpload,
  className = '',
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Auto-upload the file
      uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:5001/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Upload successful:', data);
        onImageUpload(data.image.url);
        toast.success('Profile picture updated successfully!');
        setPreview(null); // Clear preview since we now have the uploaded image
      } else {
        const errorData = await response.json();
        console.error('Upload failed:', errorData);
        toast.error(errorData.message || 'Upload failed');
        setPreview(null);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error uploading file');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    onImageUpload(''); // Set empty string to remove image
    setPreview(null);
    toast.success('Profile picture removed');
  };

  const displayImage = preview || currentImageUrl;

  return (
    <div
      className={`bg-gray-50 p-6 rounded-lg flex flex-col items-center ${className}`}
    >
      <div className="relative">
        {displayImage ? (
          <img
            src={displayImage}
            alt={`${userName} profile`}
            className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-24 h-24 rounded-lg bg-gray-300 flex items-center justify-center border-2 border-gray-200">
            <span className="text-gray-600 text-2xl font-semibold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Remove button - only show if there's an image */}
        {displayImage && !uploading && (
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-sm transition-colors"
            title="Remove profile picture"
          >
            ×
          </button>
        )}

        {/* Upload indicator */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Upload button */}
      <div className="mt-4">
        <label
          htmlFor="profile-image-upload"
          className={`cursor-pointer inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
            uploading
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              Uploading...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              {displayImage ? 'Change Picture' : 'Upload Picture'}
            </>
          )}
        </label>
        <input
          id="profile-image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {/* File format info */}
      <p className="text-xs text-gray-500 mt-2 text-center">
        PNG, JPG, GIF up to 5MB
      </p>
    </div>
  );
};
