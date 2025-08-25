import React, { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// Zod schema for forgot password validation
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordProps {
  onOtpSent?: (email: string) => void;
  onBackToLogin?: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  onOtpSent,
}) => {
  const [formData, setFormData] = useState<ForgotPasswordData>({
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user starts typing
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
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
      forgotPasswordSchema.parse(formData);
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
    setSuccessMessage('');

    try {
      const response = await fetch(
        'http://localhost:5001/api/auth/forgot-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        console.log('Forgot password request successful:', data);
        setSuccessMessage('OTP has been sent to your email address.');
        // Proceed to OTP verification step
        onOtpSent?.(formData.email);
      } else {
        setError(data.message || 'Failed to send password reset email');
        console.error('Forgot password failed:', data);
      }
    } catch (error) {
      console.error('Error during forgot password request:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative Image */}
      <div className="flex-1 flex items-center justify-center p-8"></div>

      {/* Right Panel - Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-normal text-center mb-2">
              Forgot password ?
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {successMessage}
              </div>
            )}
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </Label>
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

            {/* Continue Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg font-medium"
            >
              {loading ? 'Sending...' : 'Continue'}
            </Button>

            {/* Back to Login Link */}
            <div className="text-center">
              <Link
                to="/auth/login"
                className="text-sm inline-flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to log in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
