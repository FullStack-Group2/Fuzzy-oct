// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author:
// ID:

import React, { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import PasswordRequirements, {
  passwordValidationSchema,
} from '@/features/auth/sign-up/PasswordValidation';
import toast from 'react-hot-toast';

// Zod schema for vendor registration validation
const vendorRegistrationSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(50, 'Username must be less than 50 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores',
    ),
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: passwordValidationSchema,
  businessName: z
    .string()
    .min(2, 'Business name must be at least 2 characters long')
    .max(100, 'Business name must be less than 100 characters'),
  businessAddress: z
    .string()
    .min(5, 'Business address must be at least 5 characters long')
    .max(200, 'Business address must be less than 200 characters'),
  profilePicture: z.string().optional(),
});

type VendorRegistrationData = z.infer<typeof vendorRegistrationSchema>;

export interface RegisteredVendor {
  id: string;
  username: string;
  businessName: string;
  businessAddress: string;
  profilePicture: string;
  role: string;
}

interface RegisterVendorProps {
  onRegistrationSuccess?: (vendor: RegisteredVendor) => void;
  onSwitchToLogin?: () => void;
}

export const RegisterVendor: React.FC<RegisterVendorProps> = ({
  onRegistrationSuccess,
}) => {
  const [formData, setFormData] = useState<VendorRegistrationData>({
    username: '',
    email: '',
    password: '',
    businessName: '',
    businessAddress: '',
    profilePicture: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear general error and field-specific error when user starts typing
    if (error) setError('');
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    try {
      // Clear previous field errors
      setFieldErrors({});

      // Validate using Zod schema
      vendorRegistrationSchema.parse(formData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to field-specific errors
        const newFieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            const fieldName = issue.path[0] as string;
            newFieldErrors[fieldName] = issue.message;
          }
        });
        setFieldErrors(newFieldErrors);

        // Set general error message with first error
        const firstError = error.issues[0];
        setError(firstError?.message || 'Please fix the validation errors');
      } else {
        setError('Validation failed');
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        businessName: formData.businessName,
        businessAddress: formData.businessAddress,
        profilePicture: formData.profilePicture,
      };

      const response = await fetch(
        'http://localhost:5001/api/auth/register/vendor',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registrationData),
        },
      );

      const data = await response.json();

      if (response.ok) {
        console.log('Vendor registration successful:', data);

        // Store vendor data and token in localStorage
        localStorage.setItem('vendor', JSON.stringify(data.vendor));
        localStorage.setItem('token', data.token);

        onRegistrationSuccess?.(data.vendor);
        toast.success('Vendor registration successful!');
      } else {
        setError(data.message || 'Registration failed');
        console.error('Registration failed:', data);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      {/* Left Panel - Image */}
      <div className="relative hidden md:block md:w-1/2 bg-[#B7F7E1]">
        <img
          src="/backgroundCover.png"
          alt="background cover for shop header"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center text-black text-5xl font-semibold">
          FUZZY
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Sign up</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className=" px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                disabled={loading}
                className={`w-full ${fieldErrors.username ? 'border-red-500' : ''}`}
                required
              />
              {fieldErrors.username && (
                <p className="text-red-500 text-sm">{fieldErrors.username}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                disabled={loading}
                className={`w-full ${fieldErrors.email ? 'border-red-500' : ''}`}
                required
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-sm">{fieldErrors.email}</p>
              )}
            </div>

            {/* Business Name Field */}
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Enter your business name"
                disabled={loading}
                className={`w-full ${fieldErrors.businessName ? 'border-red-500' : ''}`}
                required
              />
              {fieldErrors.businessName && (
                <p className="text-red-500 text-sm">
                  {fieldErrors.businessName}
                </p>
              )}
            </div>

            {/* Business Address Field */}
            <div className="space-y-2">
              <Label htmlFor="businessAddress">Business Address *</Label>
              <Input
                type="text"
                id="businessAddress"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleInputChange}
                placeholder="Enter your business address"
                disabled={loading}
                className={`w-full ${fieldErrors.businessAddress ? 'border-red-500' : ''}`}
                required
              />
              {fieldErrors.businessAddress && (
                <p className=" text-sm">{fieldErrors.businessAddress}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                disabled={loading}
                className={`w-full ${fieldErrors.password ? 'border-red-500' : ''}`}
                required
              />
              {fieldErrors.password && (
                <p className=" text-sm">{fieldErrors.password}</p>
              )}

              {/* Password Requirements */}
              <PasswordRequirements password={formData.password} />
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium"
            >
              {loading ? 'Creating Account...' : 'Create Vendor Account'}
            </Button>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/auth/login"
                  className="font-medium text-green-700 hover:text-green-800"
                >
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
