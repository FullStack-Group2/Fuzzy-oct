import React, { useMemo } from 'react';
import { Check } from 'lucide-react';
import { z } from 'zod';

// Reusable Zod schema for password validation
export const passwordValidationSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(100, 'Password must be less than 100 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

// Password validation checks interface
export interface PasswordChecks {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

// Hook to get password validation checks
export const usePasswordChecks = (password: string): PasswordChecks => {
  return useMemo(() => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }), [password]);
};

// Helper function to check if all password requirements are met
export const isPasswordValid = (passwordChecks: PasswordChecks): boolean => {
  return Object.values(passwordChecks).every(Boolean);
};

interface PasswordRequirementsProps {
  password: string;
  showOnlyWhenTyping?: boolean;
  className?: string;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  showOnlyWhenTyping = true,
  className = '',
}) => {
  const passwordChecks = usePasswordChecks(password);

  // Only show requirements when password has content or showOnlyWhenTyping is false
  if (showOnlyWhenTyping && !password) {
    return null;
  }

  return (
    <div className={`mt-3 space-y-2 ${className}`}>
      <p className="text-sm font-medium text-gray-700">
        Password requirements:
      </p>
      <div className="grid grid-cols-1 gap-2">
        <div className="flex items-center gap-2">
          <Check
            size={16}
            className={
              passwordChecks.length
                ? 'text-emerald-500'
                : 'text-gray-300'
            }
          />
          <span
            className={`text-sm ${passwordChecks.length ? 'text-emerald-600' : 'text-gray-500'}`}
          >
            At least 8 characters
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Check
            size={16}
            className={
              passwordChecks.uppercase
                ? 'text-emerald-500'
                : 'text-gray-300'
            }
          />
          <span
            className={`text-sm ${passwordChecks.uppercase ? 'text-emerald-600' : 'text-gray-500'}`}
          >
            At least one uppercase letter
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Check
            size={16}
            className={
              passwordChecks.lowercase
                ? 'text-emerald-500'
                : 'text-gray-300'
            }
          />
          <span
            className={`text-sm ${passwordChecks.lowercase ? 'text-emerald-600' : 'text-gray-500'}`}
          >
            At least one lowercase letter
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Check
            size={16}
            className={
              passwordChecks.number
                ? 'text-emerald-500'
                : 'text-gray-300'
            }
          />
          <span
            className={`text-sm ${passwordChecks.number ? 'text-emerald-600' : 'text-gray-500'}`}
          >
            At least one number
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Check
            size={16}
            className={
              passwordChecks.special
                ? 'text-emerald-500'
                : 'text-gray-300'
            }
          />
          <span
            className={`text-sm ${passwordChecks.special ? 'text-emerald-600' : 'text-gray-500'}`}
          >
            At least one special character
          </span>
        </div>
      </div>
    </div>
  );
};

// Enhanced password field component with validation
interface PasswordFieldProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  showRequirements?: boolean;
  showToggle?: boolean;
  label?: string;
  required?: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder = "••••••••",
  disabled = false,
  hasError = false,
  errorMessage,
  showRequirements = true,
  showToggle = false,
  label = "Password *",
  required = true,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          type={showToggle && showPassword ? 'text' : 'password'}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            hasError ? 'border-red-500' : 'border-gray-300'
          } ${showToggle ? 'pr-10' : ''}`}
          required={required}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m0 0l3.121 3.121M12 12l-3.121-3.121m9.121 9.121L21 21" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
      
      {errorMessage && (
        <p className="text-red-500 text-sm">{errorMessage}</p>
      )}
      
      {showRequirements && (
        <PasswordRequirements password={value} />
      )}
    </div>
  );
};

export default PasswordRequirements;
