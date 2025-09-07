// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: 
// ID: 

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Store, Truck, User } from 'lucide-react';

export type RegistrationType = 'vendor' | 'shipper' | 'customer';

interface SelectRegistrationTypeProps {
  onContinue: (type: RegistrationType) => void;
  onBack?: () => void;
}

export const SelectRegistrationType: React.FC<SelectRegistrationTypeProps> = ({
  onContinue,
  onBack,
}) => {
  const [selectedType, setSelectedType] = useState<RegistrationType | null>(
    null,
  );

  const handleTypeSelect = (type: RegistrationType) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (selectedType) {
      onContinue(selectedType);
    }
  };

  const registrationTypes = [
    {
      id: 'vendor' as RegistrationType,
      title: 'VENDOR',
      icon: Store,
    },
    {
      id: 'shipper' as RegistrationType,
      title: 'SHIPPER',
      icon: Truck,
    },
    {
      id: 'customer' as RegistrationType,
      title: 'CUSTOMER',
      icon: User,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-emerald-700 mb-2">
            SELECT REGISTER TYPE
          </h1>
        </div>

        {/* Registration Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {registrationTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;

            return (
              <div
                key={type.id}
                onClick={() => handleTypeSelect(type.id)}
                className={`
                  group relative cursor-pointer rounded-2xl p-8 text-center transition-all duration-200 hover:scale-105
                  ${
                    isSelected
                      ? 'bg-[#1E7A5A] text-white shadow-lg'
                      : 'bg-[#E0FED0] text-[#1E7A5A] hover:bg-[#1E7A5A] hover:text-white'
                  }
                `}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div
                    className={`
                    p-4 rounded-xl
                    ${isSelected ? 'bg-white/20' : 'bg-white/60'}
                  `}
                  >
                    <Icon
                      size={48}
                      className={`
                        ${isSelected ? 'text-white' : 'text-[#1E7A5A] group-hover:text-white'}
                      `}
                    />
                  </div>
                  <h3 className="font-bold text-lg tracking-wide">
                    {type.title}
                  </h3>
                  <p
                    className={`
                    text-sm opacity-80
                    ${isSelected ? 'text-white' : 'text-emerald-600'}
                  `}
                  ></p>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="px-8 py-3 border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Back to Login
            </Button>
          )}

          <Button
            onClick={handleContinue}
            disabled={!selectedType}
            className={`
              px-12 py-3 rounded-lg font-medium transition-all duration-200
              ${
                selectedType
                  ? ''
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};
