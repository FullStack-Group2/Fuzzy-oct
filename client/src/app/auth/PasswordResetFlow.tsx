import React, { useState } from 'react';
import { ForgotPassword } from './ForgotPassword';
import { PasswordRequest } from './PasswordRequest';
import { SetNewPassword } from './SetNewPassword';

type PasswordResetStep =
  | 'forgot-password'
  | 'verify-otp'
  | 'set-new-password'
  | 'reset-complete';

interface PasswordResetFlowProps {
  onBackToLogin?: () => void;
  onPasswordResetComplete?: () => void;
}

export const PasswordResetFlow: React.FC<PasswordResetFlowProps> = ({
  onBackToLogin,
  onPasswordResetComplete,
}) => {
  const [currentStep, setCurrentStep] =
    useState<PasswordResetStep>('forgot-password');
  const [email, setEmail] = useState<string>('');

  const handleOtpSent = (userEmail: string) => {
    setEmail(userEmail);
    setCurrentStep('verify-otp');
  };

  const handleOtpVerified = () => {
    setCurrentStep('set-new-password');
  };

  const handlePasswordReset = () => {
    setCurrentStep('reset-complete');
    // Show success message for 2 seconds then redirect to login
    setTimeout(() => {
      onPasswordResetComplete?.();
    }, 2000);
  };

  const handleBackToForgotPassword = () => {
    setCurrentStep('forgot-password');
  };

  const handleResendOtp = async () => {
    // Resend OTP by calling the forgot-password endpoint again
    try {
      const response = await fetch(
        'http://localhost:5001/api/auth/forgot-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
          }),
        },
      );

      if (response.ok) {
        console.log('OTP resent successfully');
      } else {
        throw new Error('Failed to resend OTP');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw error;
    }
  };

  // Show success message
  if (currentStep === 'reset-complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Password Reset Successfully!
          </h1>
          <p className="text-gray-600 mb-6">
            Your password has been updated. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  // Show set new password step
  if (currentStep === 'set-new-password') {
    return (
      <SetNewPassword
        email={email}
        onPasswordReset={handlePasswordReset}
        onBackToLogin={onBackToLogin}
      />
    );
  }

  // Show OTP verification step
  if (currentStep === 'verify-otp') {
    return (
      <PasswordRequest
        email={email}
        onOtpVerified={handleOtpVerified}
        onBackToForgotPassword={handleBackToForgotPassword}
        onResendOtp={handleResendOtp}
      />
    );
  }

  // Show forgot password step (default)
  return (
    <ForgotPassword onOtpSent={handleOtpSent} onBackToLogin={onBackToLogin} />
  );
};
