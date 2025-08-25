import { Button } from '@/components/ui/button';
import React, { useState, useCallback } from 'react';
import { ChangePassword } from '../auth/ChangePassword';
import { useAuth } from '../../AuthProvider';

interface VendorData {
  id: string;
  username: string;
  email: string;
  businessName: string;
  businessAddress: string;
  profilePicture: string;
}

interface VendorProfileProps {
  vendorId?: string;
  initialVendor?: VendorData;
}

export const VendorProfile: React.FC<VendorProfileProps> = () => {
  const { user, logout } = useAuth();
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    email: '',
    businessName: '',
    businessAddress: '',
  });

  // Initialize vendor data from AuthProvider user
  React.useEffect(() => {
    if (user && user.role === 'VENDOR') {
      setVendor({
        id: user.id,
        username: user.username,
        email: user.email,
        businessName: user.businessName || '',
        businessAddress: user.businessAddress || '',
        profilePicture: user.profilePicture || '',
      });
    }
  }, [user]);

  // Fetch vendor data
  const fetchVendor = useCallback(async () => {
    if (!user || user.role !== 'VENDOR') return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required. Please log in again.');
        logout();
        return;
      }

      const response = await fetch(
        `http://localhost:5001/api/vendors/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log(`Fetching vendor with ID: ${user.id}`);
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        setVendor(data.vendor);
      } else {
        console.error('Failed to fetch vendor');
        alert('Vendor not found or failed to load');
        setVendor(null);
      }
    } catch (error) {
      console.error('Error fetching vendor:', error);
      alert('Error fetching vendor data');
      setVendor(null);
    } finally {
      setLoading(false);
    }
  }, [user, logout]);

  // Update vendor data
  const updateVendor = useCallback(async () => {
    if (!vendor) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      console.log(
        'Token from localStorage:',
        token ? 'Token found' : 'No token found',
      );

      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      console.log('Making PUT request to update vendor:', vendor.id);
      const response = await fetch(
        `http://localhost:5001/api/vendors/${vendor.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: editData.username || vendor.username,
            email: editData.email || vendor.email,
            businessName: editData.businessName || vendor.businessName,
            businessAddress: editData.businessAddress || vendor.businessAddress,
          }),
        },
      );

      console.log('Update response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Update successful:', data);
        setVendor(data.vendor);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Update failed:', errorData);
        alert(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating vendor:', error);
      alert('Error updating profile');
    } finally {
      setUpdating(false);
    }
  }, [vendor, editData]);

  // Initialize edit data when editing starts
  const startEditing = () => {
    if (vendor) {
      setEditData({
        username: vendor.username,
        email: vendor.email,
        businessName: vendor.businessName,
        businessAddress: vendor.businessAddress,
      });
      setIsEditing(true);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setEditData({
      username: '',
      email: '',
      businessName: '',
      businessAddress: '',
    });
  };

  // Load vendor data when user is available
  React.useEffect(() => {
    if (user && user.role === 'VENDOR') {
      fetchVendor();
    }
  }, [user, fetchVendor]);

  return (
    <div className="m-12 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-center text-2xl font-bold mb-4 text-gray-800">
        Vendor Profile
      </h2>

      {loading && (
        <div className="text-center py-8">
          <div className="text-gray-600">Loading vendor profile...</div>
        </div>
      )}

      {!loading && !vendor && (
        <div className="text-center py-8">
          <div className="text-gray-600 mb-4">
            {user?.role !== 'VENDOR'
              ? 'Access denied. This page is only available for vendors.'
              : 'Unable to load vendor profile.'}
          </div>
        </div>
      )}

      {vendor && (
        <div className="space-y-6">
          {/* Profile Image Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Profile Image
            </label>
            <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center">
              <div className="relative">
                {vendor.profilePicture ? (
                  <img
                    src={vendor.profilePicture}
                    alt={`${vendor.businessName} profile`}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 text-2xl font-semibold">
                      {vendor.businessName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <button className="absolute -top-2 -right-2 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm hover:bg-gray-500">
                  ×
                </button>
              </div>
            </div>
          </div>

          {/* Username Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.username}
                onChange={(e) =>
                  setEditData({ ...editData, username: e.target.value })
                }
                className="w-full bg-white p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg border">
                <p className="text-gray-900">{vendor.username}</p>
              </div>
            )}
          </div>

          {/* Email Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
                className="w-full bg-white p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg border">
                <p className="text-gray-900">{vendor.email}</p>
              </div>
            )}
          </div>

          {/* Business Name Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.businessName}
                onChange={(e) =>
                  setEditData({ ...editData, businessName: e.target.value })
                }
                className="w-full bg-white p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg border">
                <p className="text-gray-900">{vendor.businessName}</p>
              </div>
            )}
          </div>

          {/* Business Address Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business address
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.businessAddress}
                onChange={(e) =>
                  setEditData({ ...editData, businessAddress: e.target.value })
                }
                className="w-full bg-white p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg border">
                <p className="text-gray-900">{vendor.businessAddress}</p>
              </div>
            )}
          </div>

          {/* Password Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="flex justify-center">
              <Button
                variant="ghost"
                onClick={() => setShowChangePassword(true)}
                className="w-full p-3 rounded-lg border font-medium"
              >
                Change password
              </Button>
            </div>
          </div>

          {/* Update Account Button */}
          <div className="flex justify-end gap-3">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={cancelEditing}
                  disabled={updating}
                  className="rounded-lg font-medium px-6 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={updateVendor}
                  disabled={updating}
                  className="rounded-lg font-medium px-6 py-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  {updating ? 'Updating...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button
                onClick={startEditing}
                className="rounded-lg font-medium px-6 py-2 bg-green-600 hover:bg-green-700 text-white"
              >
                Update account
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && vendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-0 w-full max-w-md mx-4">
            <ChangePassword
              onPasswordChanged={() => {
                setShowChangePassword(false);
                alert('Password changed successfully!');
              }}
              onCancel={() => setShowChangePassword(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
