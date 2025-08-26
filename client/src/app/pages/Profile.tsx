import React from "react";
import { useAuth } from "../../stores/AuthProvider";
import { ShipperProfile } from "./shipper/ShipperProfile";
import { CustomerProfile } from "./customer/CustomerProfile";
import { VendorProfile } from "./vendor/VendorProfile";

 const Profile: React.FC = () =>{
      const { user, logout } = useAuth();

    return(
        <>
        {user && user.role == 'CUSTOMER' && <CustomerProfile/>}
        {user && user.role == 'VENDOR' && <VendorProfile/>}
        {user && user.role == 'SHIPPER' && <ShipperProfile/>}
    {/* if (user && user.role == 'SHIPPER') return ShipperProfile */}
        </>
    );
 }
export default Profile;