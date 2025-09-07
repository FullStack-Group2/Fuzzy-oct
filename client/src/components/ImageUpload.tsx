// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: 
// ID: 

import React, { useState } from 'react';

interface ImageData {
  id: string;
  filename: string;
  url: string;
  path: string;
}

interface ImageUploadProps {
  onImageUpload?: (imageData: ImageData) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<ImageData | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const file = formData.get('image') as File;

    if (!file) {
      alert('Please select a file');
      return;
    }

    setUploading(true);

    try {
      const response = await fetch('http://localhost:5001/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedImage(data.image);
        onImageUpload?.(data.image);
        console.log('Upload successful:', data);
      } else {
        console.error('Upload failed');
        alert('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Upload Image</h2>

      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Choose Image
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 
                       file:mr-4 file:py-2 file:px-4 
                       file:rounded-full file:border-0 
                       file:text-sm file:font-semibold 
                       file:bg-blue-50 file:text-blue-700 
                       hover:file:bg-blue-100"
            required
          />
        </div>

        {preview && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className={`w-full py-2 px-4 rounded-lg font-medium ${
            uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </form>

      {uploadedImage && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Upload Successful!
          </h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Filename:</strong> {uploadedImage.filename}
            </p>
            <p>
              <strong>URL:</strong>{' '}
              <a
                href={uploadedImage.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {uploadedImage.url}
              </a>
            </p>
            <p>
              <strong>ID:</strong> {uploadedImage.id}
            </p>
          </div>
          <div className="mt-3">
            <img
              src={uploadedImage.url}
              alt="Uploaded"
              className="w-full h-48 object-cover rounded-lg border-2 border-green-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};
