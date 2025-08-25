import React, { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import {
  PasswordRequirements,
  passwordValidationSchema,
} from '../../../components/PasswordValidation';

// Zod schema for customer registration validation
const customerRegistrationSchema = z.object({
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
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must be less than 100 characters'),
  password: passwordValidationSchema,
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters long')
    .max(200, 'Address must be less than 200 characters'),
  profilePicture: z.string().optional(),
});

type CustomerRegistrationData = z.infer<typeof customerRegistrationSchema>;

export interface RegisteredCustomer {
  id: string;
  email: string;
  username: string;
  name: string;
  address: string;
  profilePicture: string;
  role: string;
}

interface RegisterCustomerProps {
  onRegistrationSuccess?: (Customer: RegisteredCustomer) => void;
  onSwitchToLogin?: () => void;
}

export const RegisterCustomer: React.FC<RegisterCustomerProps> = ({
  onRegistrationSuccess,
}) => {
  const [formData, setFormData] = useState<CustomerRegistrationData>({
    username: '',
    email: '',
    name: '',
    password: '',
    address: '',
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
      customerRegistrationSchema.parse(formData);
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
        name: formData.name,
        password: formData.password,
        address: formData.address,
        profilePicture: formData.profilePicture,
      };

      const response = await fetch(
        'http://localhost:5001/api/auth/register/customer',
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
        console.log('Customer registration successful:', data);

        // Store Customer data and token in localStorage
        localStorage.setItem('Customer', JSON.stringify(data.Customer));
        localStorage.setItem('token', data.token);

        onRegistrationSuccess?.(data.Customer);
        alert('Customer registration successful!');
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
    <div className="min-h-screen flex">
      {/* Left Panel - Image */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-80 h-80 rounded-lg flex items-center justify-center">
          <span className="text-lg">Fuzzy</span>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Sign up</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
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

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                disabled={loading}
                className={`w-full ${fieldErrors.name ? 'border-red-500' : ''}`}
                required
              />
              {fieldErrors.name && (
                <p className="text-red-500 text-sm">{fieldErrors.name}</p>
              )}
            </div>

            {/* Address Field */}
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your address"
                disabled={loading}
                className={`w-full ${fieldErrors.address ? 'border-red-500' : ''}`}
                required
              />
              {fieldErrors.address && (
                <p className="text-red-500 text-sm">{fieldErrors.address}</p>
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
                <p className="text-red-500 text-sm">{fieldErrors.password}</p>
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
              {loading ? 'Creating Account...' : 'Create Customer Account'}
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
