import React, { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, X } from 'lucide-react';
import PasswordRequirements, { passwordValidationSchema } from '@/app/components/PasswordValidation';
import { useAuth } from '../../AuthProvider';

// Zod schema for change password validation
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordValidationSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ['confirmPassword'],
  });

interface ChangePasswordProps {
  onPasswordChanged?: () => void;
  onCancel?: () => void;
}

export const ChangePassword: React.FC<ChangePasswordProps> = ({
  onPasswordChanged,
  onCancel,
}) => {
  const { user, logout } = useAuth();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            Authentication required. Please log in to change your password.
          </div>
        </div>
      </div>
    );
  }

  // Password validation checks for new password
  const passwordChecks = {
    length: formData.newPassword.length >= 8,
    uppercase: /[A-Z]/.test(formData.newPassword),
    lowercase: /[a-z]/.test(formData.newPassword),
    number: /\d/.test(formData.newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword),
  };

  const allChecksPass = Object.values(passwordChecks).every(Boolean);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear errors when user starts typing
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = (): boolean => {
    try {
      changePasswordSchema.parse(formData);
      setFieldErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            const fieldName = issue.path[0] as string;
            errors[fieldName] = issue.message;
          }
        });
        setFieldErrors(errors);
        setError('Please fix the validation errors');
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
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        logout();
        return;
      }

      if (!user?.id) {
        setError('User information not available. Please try logging in again.');
        logout();
        return;
      }

      const response = await fetch(
        `http://localhost:5001/api/auth/change-password/${user.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        console.log('Password change successful:', data);
        setSuccessMessage('Password changed successfully!');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => {
          onPasswordChanged?.();
        }, 2000);
      } else {
        setError(data.message || 'Failed to change password');
        console.error('Password change failed:', data);
      }
    } catch (error) {
      console.error('Error during password change:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Change Password</h3>
        <Button
          variant="ghost"
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X size={20} />
        </Button>
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

        {/* Current Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor="currentPassword"
            className="text-sm font-medium text-gray-700"
          >
            Current Password *
          </Label>
          <div className="relative">
            <Input
              type={showPasswords.current ? 'text' : 'password'}
              id="currentPassword"
              value={formData.currentPassword}
              onChange={(e) =>
                handleInputChange('currentPassword', e.target.value)
              }
              placeholder="Enter your current password"
              disabled={loading}
              className={`pr-10 ${fieldErrors.currentPassword ? 'border-red-500' : ''}`}
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPasswords.current ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {fieldErrors.currentPassword && (
            <p className="text-red-500 text-sm">
              {fieldErrors.currentPassword}
            </p>
          )}
        </div>

        {/* New Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor="newPassword"
            className="text-sm font-medium text-gray-700"
          >
            New Password *
          </Label>
          <div className="relative">
            <Input
              type={showPasswords.new ? 'text' : 'password'}
              id="newPassword"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              placeholder="Enter your new password"
              disabled={loading}
              className={`pr-10 ${fieldErrors.newPassword ? 'border-red-500' : ''}`}
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPasswords.new ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {fieldErrors.newPassword && (
            <p className="text-red-500 text-sm">{fieldErrors.newPassword}</p>
          )}
            {/* Password Requirements */}
              <PasswordRequirements password={formData.newPassword} />
        </div>

        {/* Confirm New Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-gray-700"
          >
            Confirm New Password *
          </Label>
          <div className="relative">
            <Input
              type={showPasswords.confirm ? 'text' : 'password'}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange('confirmPassword', e.target.value)
              }
              placeholder="Confirm your new password"
              disabled={loading}
              className={`pr-10 ${fieldErrors.confirmPassword ? 'border-red-500' : ''}`}
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPasswords.confirm ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-red-500 text-sm">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg font-medium px-6 py-2"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              loading ||
              !allChecksPass ||
              !formData.confirmPassword ||
              !formData.currentPassword
            }
            className="rounded-lg font-medium px-6 py-2 text-white"
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </Button>
        </div>
      </form>
    </div>
  );
};
