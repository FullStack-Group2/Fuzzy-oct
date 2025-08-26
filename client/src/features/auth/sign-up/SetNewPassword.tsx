import React, { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import PasswordRequirements, {
  passwordValidationSchema,
} from '@/features/auth/sign-up/PasswordValidation';

// Zod schema for password validation
const passwordSchema = z.object({
  password: passwordValidationSchema,
});

interface SetNewPasswordProps {
  email: string;
  resetToken?: string;
  onPasswordReset?: () => void;
  onBackToLogin?: () => void;
}

export const SetNewPassword: React.FC<SetNewPasswordProps> = ({
  email,
  resetToken,
  onPasswordReset,
}) => {
  const [formData, setFormData] = useState({
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({
    password: false,
  });

  // Password validation checks
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const allChecksPass = Object.values(passwordChecks).every(Boolean);

  const togglePasswordVisibility = (field: 'password') => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear errors when user starts typing
    if (error) setError('');
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    try {
      passwordSchema.parse(formData);
      setFieldErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            errors[issue.path[0] as string] = issue.message;
          }
        });
        setFieldErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if resetToken is available
    if (!resetToken) {
      setError(
        'Reset token is missing. Please restart the password reset process.',
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        'http://localhost:5001/api/auth/reset-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            resetToken: resetToken,
            newPassword: formData.password,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        console.log('Password reset successful:', data);
        onPasswordReset?.();
      } else {
        setError(data.message || 'Failed to reset password');
        console.error('Password reset failed:', data);
      }
    } catch (error) {
      console.error('Error during password reset:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative Image */}
      <div className="flex-1 flex items-center justify-center p-8"></div>

      {/* Right Panel - Set New Password Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-normal text-gray-900 mb-2">
              Set new password
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Create Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Create password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPasswords.password ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange('password', e.target.value)
                  }
                  disabled={loading}
                  className={`pr-10 ${
                    fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant={'ghost'}
                  onClick={() => togglePasswordVisibility('password')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-transparent"
                  disabled={loading}
                >
                  {showPasswords.password ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>

              {fieldErrors.password && (
                <p className="text-red-500 text-sm">{fieldErrors.password}</p>
              )}

              {/* Password Requirements */}
              <PasswordRequirements password={formData.password} />
            </div>

            {/* Reset Password Button */}
            <Button
              type="submit"
              disabled={loading || !allChecksPass || !resetToken}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium "
            >
              {loading ? 'Resetting password...' : 'Reset password'}
            </Button>

            {/* Back to Login Link */}
            <div className="text-center">
              <Link
                to="/auth/login"
                className="text-sm text-gray-600 hover:text-gray-800 inline-flex items-center gap-2"
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
