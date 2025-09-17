import React, { ReactNode } from 'react';

interface OverlayProps {
  children: ReactNode;
  onClose: () => void;
}

export default function Overlay({ children, onClose }: OverlayProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* background */}
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />
      {/* content */}
      <div className="relative bg-white rounded-lg shadow-lg w-[400px] h-[600px] flex flex-col">
        {/* close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
