import React, { useState, useRef, useEffect } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// Zod schema for OTP validation
const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'Please enter all 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});

interface PasswordRequestProps {
  email: string;
  onOtpVerified?: (resetToken: string) => void;
  onBackToForgotPassword?: () => void;
  onResendOtp?: () => void;
}

export const PasswordRequest: React.FC<PasswordRequestProps> = ({
  email,
  onOtpVerified,
  onResendOtp,
}) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [fieldError, setFieldError] = useState<string>('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers and limit to 1 character
    if (value.length > 1) return;
    if (value !== '' && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear errors when user starts typing
    if (error) setError('');
    if (fieldError) setFieldError('');

    // Auto-focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    // Handle backspace
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    // Check if pasted data is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const validateOtp = (): boolean => {
    const otpString = otp.join('');

    try {
      otpSchema.parse({ otp: otpString });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        setFieldError(firstError?.message || 'Please enter a valid OTP');
      } else {
        setFieldError('Invalid OTP format');
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateOtp()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

      const response = await fetch(
        'http://localhost:5001/api/auth/verify-otp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            code: otp.join(''), // Backend expects 'code', not 'otp'
          }),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok) {
        console.log('OTP verification successful:', data);
        // Extract resetToken from response and pass it to the callback
        const resetToken = data.resetToken;
        if (resetToken) {
          onOtpVerified?.(resetToken);
        } else {
          setError('Reset token not received. Please try again.');
        }
      } else {
        // Handle specific error codes
        if (response.status === 408) {
          setError(
            'Verification service is temporarily unavailable. Please try again.',
          );
        } else if (response.status === 400) {
          setError(data.message || 'Invalid or expired verification code.');
        } else {
          setError(data.message || 'Failed to verify code. Please try again.');
        }
        console.error('OTP verification failed:', data);
      }
    } catch (error: unknown) {
      console.error('Error during OTP verification:', error);

      const err = error as { name?: string };
      if (err.name === 'AbortError') {
        setError(
          'Request timed out. Please check your connection and try again.',
        );
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');

    try {
      await onResendOtp?.();
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative Image */}
      <div className="flex-1 flex items-center justify-center p-8"></div>

      {/* Right Panel - OTP Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-normal mb-2">Password request</h1>
            <p className="text-gray-600 text-sm">
              We have sent a code to your email!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* OTP Input Fields */}
            <div className="space-y-2">
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={loading}
                    className={`
                      w-12 h-12 text-center text-lg font-semibold
                      ${fieldError ? 'border-red-500' : 'border-gray-300'}
                    `}
                  />
                ))}
              </div>

              {fieldError && (
                <p className="text-red-500 text-sm text-center">{fieldError}</p>
              )}
            </div>

            {/* Continue Button */}
            <Button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full py-3 rounded-lg font-medium disabled:bg-gray-300"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </Button>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn&apos;t receive the email?{' '}
                <Button
                  variant="link"
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className=" font-medium p-0 h-auto"
                >
                  Click to send again
                </Button>
              </p>
            </div>

            {/* Back to Forgot Password Link */}
            <div className="text-center">
              <Link
                to="/auth/login"
                className="text-sm inline-flex items-center text-gray-600 hover:text-gray-800 gap-2"
              >
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
