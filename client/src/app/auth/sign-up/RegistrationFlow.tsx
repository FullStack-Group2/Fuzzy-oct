import React, { useState } from 'react';
import { SelectRegistrationType, RegistrationType } from './SelectRegistrationType';
import { RegisterVendor } from './register-vendor';
import { RegisterShipper } from './register-shipper';
import { RegisterCustomer } from './register-customer';

// Common user type for registration success - flexible to work with all user types
type RegisteredUser = Record<string, unknown>;

interface RegistrationFlowProps {
  onRegistrationSuccess?: (user: RegisteredUser) => void;
  onSwitchToLogin?: () => void;
}

export const RegistrationFlow: React.FC<RegistrationFlowProps> = ({
  onRegistrationSuccess,
  onSwitchToLogin,
}) => {
  const [currentStep, setCurrentStep] = useState<'select-type' | 'register'>('select-type');
  const [selectedType, setSelectedType] = useState<RegistrationType | null>(null);

  const handleTypeSelection = (type: RegistrationType) => {
    setSelectedType(type);
    setCurrentStep('register');
  };

  const handleBackToSelection = () => {
    setCurrentStep('select-type');
    setSelectedType(null);
  };

  const handleRegistrationSuccess = (user: RegisteredUser) => {
    onRegistrationSuccess?.(user);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleVendorSuccess = (vendor: any) => {
    handleRegistrationSuccess(vendor);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleShipperSuccess = (shipper: any) => {
    handleRegistrationSuccess(shipper);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCustomerSuccess = (customer: any) => {
    handleRegistrationSuccess(customer);
  };

  // Render type selection step
  if (currentStep === 'select-type') {
    return (
      <SelectRegistrationType
        onContinue={handleTypeSelection}
        onBack={onSwitchToLogin}
      />
    );
  }

  // Render specific registration form based on selected type
  if (currentStep === 'register' && selectedType) {
    switch (selectedType) {
      case 'vendor':
        return (
          <RegisterVendor
            onRegistrationSuccess={handleVendorSuccess}
            onSwitchToLogin={handleBackToSelection}
          />
        );
      case 'shipper':
        return (
          <RegisterShipper
            onRegistrationSuccess={handleShipperSuccess}
            onSwitchToLogin={handleBackToSelection}
          />
        );
      case 'customer':
        return (
          <RegisterCustomer
            onRegistrationSuccess={handleCustomerSuccess}
            onSwitchToLogin={handleBackToSelection}
          />
        );
      default:
        return (
          <SelectRegistrationType
            onContinue={handleTypeSelection}
            onBack={onSwitchToLogin}
          />
        );
    }
  }

  // Fallback to type selection
  return (
    <SelectRegistrationType
      onContinue={handleTypeSelection}
      onBack={onSwitchToLogin}
    />
  );
};
