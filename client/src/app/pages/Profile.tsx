// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Le Gia Huy
// ID: s3975371

import React from 'react';
import { useAuth } from '../../stores/AuthProvider';
import { ShipperProfile } from '../../features/profile/shipper/ShipperProfile';
import { CustomerProfile } from '../../features/profile/customer/CustomerProfile';
import { VendorProfile } from '../../features/profile/vendor/VendorProfile';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      {user && user.role == 'CUSTOMER' && <CustomerProfile />}
      {user && user.role == 'VENDOR' && <VendorProfile />}
      {user && user.role == 'SHIPPER' && <ShipperProfile />}
      {/* if (user && user.role == 'SHIPPER') return ShipperProfile */}
    </>
  );
};
export default Profile;
