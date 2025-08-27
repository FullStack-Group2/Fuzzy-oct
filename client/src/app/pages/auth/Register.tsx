import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SelectRegistrationType } from '@/features/auth/sign-up/SelectRegistrationType';
import {
  RegisterVendor,
  RegisteredVendor,
} from '@/features/auth/sign-up/register-vendor';
import {
  RegisterCustomer,
  RegisteredCustomer,
} from '@/features/auth/sign-up/register-customer';
import {
  RegisterShipper,
  RegisteredShipper,
} from '@/features/auth/sign-up/register-shipper';

// Types for registration roles
export type RegistrationType = 'vendor' | 'shipper' | 'customer';

// Common user type for registration success - union of all possible user types
export type RegisteredUser =
  | RegisteredVendor
  | RegisteredShipper
  | RegisteredCustomer;

interface RegistrationFlowProps {
  onRegistrationSuccess?: (user: RegisteredUser) => void;
}

export const Register: React.FC<RegistrationFlowProps> = ({
  onRegistrationSuccess,
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'select-type' | 'register'>(
    'select-type',
  );
  const [selectedType, setSelectedType] = useState<RegistrationType | null>(
    null,
  );

  const handleTypeSelection = (type: RegistrationType) => {
    setSelectedType(type);
    setCurrentStep('register');
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleBackToSelection = () => {
    setCurrentStep('select-type');
    setSelectedType(null);
  };

  const handleRegistrationSuccess = (user: RegisteredUser) => {
    onRegistrationSuccess?.(user);
  };

  // Render type selection step
  if (currentStep === 'select-type') {
    return (
      <SelectRegistrationType
        onContinue={handleTypeSelection}
        onBack={handleBackToLogin}
      />
    );
  }

  // Render specific registration form based on selected type
  if (currentStep === 'register' && selectedType) {
    switch (selectedType) {
      case 'vendor':
        return (
          <RegisterVendor
            onRegistrationSuccess={handleRegistrationSuccess}
            onSwitchToLogin={handleBackToSelection}
          />
        );
      case 'shipper':
        return (
          <RegisterShipper
            onRegistrationSuccess={handleRegistrationSuccess}
            onSwitchToLogin={handleBackToSelection}
          />
        );
      case 'customer':
        return (
          <RegisterCustomer
            onRegistrationSuccess={handleRegistrationSuccess}
            onSwitchToLogin={handleBackToSelection}
          />
        );
      default:
        return (
          <SelectRegistrationType
            onContinue={handleTypeSelection}
            onBack={handleBackToLogin}
          />
        );
    }
  }

  // Fallback to type selection
  return (
    <SelectRegistrationType
      onContinue={handleTypeSelection}
      onBack={handleBackToLogin}
    />
  );
};
