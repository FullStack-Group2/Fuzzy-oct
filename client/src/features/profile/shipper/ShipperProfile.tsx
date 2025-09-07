// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: 
// ID: 

import { Button } from '@/components/ui/button';
import React, { useState, useCallback, useEffect } from 'react';
import { ChangePassword } from '@/features/auth/sign-up/ChangePassword';
import { useAuth } from '../../../stores/AuthProvider';
import toast from 'react-hot-toast';

interface ShipperData {
  id: string;
  username: string;
  email: string;
  distributionHub?:
    | {
        _id: string;
        hubName: string;
        hubLocation: string;
      }
    | string; // Can be either populated object or just ID string
  profilePicture: string;
}

export const ShipperProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [shipper, setShipper] = useState<ShipperData | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    email: '',
  });

  // Fetch shipper data
  const fetchShipper = useCallback(async () => {
    if (!user || user.role !== 'SHIPPER') return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        logout();
        return;
      }

      const response = await fetch(
        `http://localhost:5001/api/shippers/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log(`Fetching shipper with ID: ${user.id}`);
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        setShipper(data.shipper);
      } else {
        console.error('Failed to fetch shipper');
        toast.error('Shipper not found or failed to load');
        setShipper(null);
      }
    } catch (error) {
      console.error('Error fetching shipper:', error);
      toast.error('Error fetching shipper data');
      setShipper(null);
    } finally {
      setLoading(false);
    }
  }, [user, logout]);

  // Update shipper data
  const updateShipper = useCallback(async () => {
    if (!shipper || !user) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      console.log(
        'Token from localStorage:',
        token ? 'Token found' : 'No token found',
      );

      if (!token) {
        toast.error('Authentication required. Please log in again.');
        logout();
        return;
      }

      console.log('Making PUT request to update shipper:', shipper.id);
      const response = await fetch(
        `http://localhost:5001/api/shippers/${shipper.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: editData.username || shipper.username,
            email: editData.email || shipper.email,
          }),
        },
      );

      console.log('Update response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Update successful:', data);
        setShipper(data.shipper);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Update failed:', errorData);
        toast.error(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating shipper:', error);
      toast.error('Error updating profile');
    } finally {
      setUpdating(false);
    }
  }, [shipper, editData, user, logout]);

  // Initialize edit data when editing starts
  const startEditing = () => {
    if (shipper) {
      setEditData({
        username: shipper.username,
        email: shipper.email,
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
    });
  };

  // Load shipper data when user is available
  useEffect(() => {
    if (user && user.role === 'SHIPPER') {
      fetchShipper();
    }
  }, [user, fetchShipper]);

  // Check if user is authorized
  if (!user || user.role !== 'SHIPPER') {
    return (
      <div className="m-12 bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            Access denied. This page is only available for shippers.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="m-12 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-center text-2xl font-bold mb-4 text-gray-800">
        Shipper Profile
      </h2>

      {loading && (
        <div className="text-center py-8">
          <div className="text-gray-600">Loading shipper profile...</div>
        </div>
      )}

      {!loading && !shipper && (
        <div className="text-center py-8">
          <div className="text-gray-600 mb-4">
            {user?.role !== 'SHIPPER'
              ? 'Access denied. This page is only available for shippers.'
              : 'Unable to load shipper profile.'}
          </div>
        </div>
      )}

      {shipper && (
        <div className="space-y-6">
          {/* Profile Image Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Profile Image
            </label>
            <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center">
              <div className="relative">
                {shipper.profilePicture ? (
                  <img
                    src={shipper.profilePicture}
                    alt={`${shipper.username} profile`}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 text-2xl font-semibold">
                      {shipper.username.charAt(0).toUpperCase()}
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
                <p className="text-gray-900">{shipper.username}</p>
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
                <p className="text-gray-900">{shipper.email}</p>
              </div>
            )}
          </div>

          {/* Assigned Hub Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned Hub
            </label>
            <div className="bg-gray-50 p-3 rounded-lg border">
              <p className="text-gray-900">
                {shipper.distributionHub
                  ? typeof shipper.distributionHub === 'string'
                    ? shipper.distributionHub
                    : `${shipper.distributionHub.hubName} - ${shipper.distributionHub.hubLocation}`
                  : 'Not assigned'}
              </p>
            </div>
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
                  onClick={updateShipper}
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
      {showChangePassword && shipper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-0 w-full max-w-md mx-4">
            <ChangePassword
              onPasswordChanged={() => {
                setShowChangePassword(false);
                toast.success('Password changed successfully!');
              }}
              onCancel={() => setShowChangePassword(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
