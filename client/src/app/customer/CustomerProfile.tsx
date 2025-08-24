import { Button } from '@/components/ui/button';
import React, { useState, useCallback } from 'react';

interface CustomerData {
  id: string;
  username: string;
  email: string;
  name: string;
  address: string;
  profilePicture: string;
}

interface CustomerProfileProps {
  customerId?: string;
  initialCustomer?: CustomerData;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({
  customerId,
  initialCustomer,
}) => {
  const [customer, setCustomer] = useState<CustomerData | null>(
    initialCustomer || null,
  );
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [inputCustomerId, setInputCustomerId] = useState(customerId || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    email: '',
    name: '',
    address: '',
  });

  // Fetch customer data
  const fetchCustomer = useCallback(
    async (id?: string) => {
      const targetId = id || inputCustomerId;
      if (!targetId) return;

      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Authentication required. Please log in again.');
          return;
        }

        const response = await fetch(
          `http://localhost:5001/api/customers/${targetId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        console.log(`Fetching customer with ID: ${targetId}`);
        console.log('Response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          setCustomer(data.customer);
        } else {
          console.error('Failed to fetch customer');
          alert('Customer not found or failed to load');
          setCustomer(null);
        }
      } catch (error) {
        console.error('Error fetching customer:', error);
        alert('Error fetching customer data');
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    },
    [inputCustomerId],
  );

  const handleSearchCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCustomerId.trim()) {
      fetchCustomer(inputCustomerId.trim());
    }
  };

  // Update customer data
  const updateCustomer = useCallback(async () => {
    if (!customer) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? 'Token found' : 'No token found');
      
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      console.log('Making PUT request to update customer:', customer.id);
      const response = await fetch(`http://localhost:5001/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: editData.username || customer.username,
          email: editData.email || customer.email,
          name: editData.name || customer.name,
          address: editData.address || customer.address,
        }),
      });

      console.log('Update response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Update successful:', data);
        setCustomer(data.customer);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Update failed:', errorData);
        alert(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Error updating profile');
    } finally {
      setUpdating(false);
    }
  }, [customer, editData]);

  // Initialize edit data when editing starts
  const startEditing = () => {
    if (customer) {
      setEditData({
        username: customer.username,
        email: customer.email,
        name: customer.name,
        address: customer.address,
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
      name: '',
      address: '',
    });
  };

  // Load customer data on component mount if customerId is provided
  React.useEffect(() => {
    if (customerId && !initialCustomer) {
      fetchCustomer(customerId);
    }
  }, [customerId, initialCustomer, fetchCustomer]);

  return (
    <div className="m-12 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-center text-2xl font-bold mb-4 text-gray-800">Customer Profile</h2>

      {/* Customer ID Search Form */}
      {!customerId && (
        <form onSubmit={handleSearchCustomer} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputCustomerId}
              onChange={(e) => setInputCustomerId(e.target.value)}
              placeholder="Enter Customer ID"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
          </div>
        </form>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="text-gray-600">Loading customer profile...</div>
        </div>
      )}

      {!loading && !customer && inputCustomerId && (
        <div className="text-center py-8">
          <div className="text-gray-600 mb-4">Customer not found.</div>
          <Button
            onClick={() => fetchCustomer()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      )}

      {!loading && !customer && !inputCustomerId && !customerId && (
        <div className="text-center py-8 text-gray-600">
          Enter a customer ID to view profile
        </div>
      )}

      {customer && (
        <div className="space-y-6">
          {/* Profile Image Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Profile Image
            </label>
            <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center">
              <div className="relative">
                {customer.profilePicture ? (
                  <img
                    src={customer.profilePicture}
                    alt={`${customer.name} profile`}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 text-2xl font-semibold">
                      {customer.name.charAt(0).toUpperCase()}
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
                onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                className="w-full bg-white p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg border">
                <p className="text-gray-900">{customer.username}</p>
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
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className="w-full bg-white p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg border">
                <p className="text-gray-900">{customer.email}</p>
              </div>
            )}
          </div>

          {/* Name Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full bg-white p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg border">
                <p className="text-gray-900">{customer.name}</p>
              </div>
            )}
          </div>

          {/* Address Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.address}
                onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                className="w-full bg-white p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg border">
                <p className="text-gray-900">{customer.address}</p>
              </div>
            )}
          </div>

          {/* Password Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="flex justify-center">
              <Button variant="ghost" className="w-full p-3 rounded-lg border font-medium">
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
                  onClick={updateCustomer}
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
    </div>
  );
};