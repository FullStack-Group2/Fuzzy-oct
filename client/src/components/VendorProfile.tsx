import React, { useState, useCallback } from 'react';

interface VendorData {
  id: string;
  username: string;
  businessName: string;
  businessAddress: string;
  profilePicture: string;
  createdAt: string;
  updatedAt: string;
}

interface VendorProfileProps {
  vendorId?: string;
  initialVendor?: VendorData;
}

export const VendorProfile: React.FC<VendorProfileProps> = ({
  vendorId,
  initialVendor,
}) => {
  const [vendor, setVendor] = useState<VendorData | null>(
    initialVendor || null,
  );
  const [loading, setLoading] = useState(false);
  const [inputVendorId, setInputVendorId] = useState(vendorId || '');

  // Fetch vendor data
  const fetchVendor = useCallback(
    async (id?: string) => {
      const targetId = id || inputVendorId;
      if (!targetId) return;

      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5001/api/vendors/${targetId}`,
        );
        console.log(`Fetching vendor with ID: ${targetId}`);
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
    },
    [inputVendorId],
  );

  const handleSearchVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVendorId.trim()) {
      fetchVendor(inputVendorId.trim());
    }
  };

  // Load vendor data on component mount if vendorId is provided
  React.useEffect(() => {
    if (vendorId && !initialVendor) {
      fetchVendor(vendorId);
    }
  }, [vendorId, initialVendor, fetchVendor]);

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Vendor Profile</h2>

      {/* Vendor ID Search Form */}
      {!vendorId && (
        <form onSubmit={handleSearchVendor} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputVendorId}
              onChange={(e) => setInputVendorId(e.target.value)}
              placeholder="Enter Vendor ID"
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
          <div className="text-gray-600">Loading vendor profile...</div>
        </div>
      )}

      {!loading && !vendor && inputVendorId && (
        <div className="text-center py-8">
          <div className="text-gray-600 mb-4">Vendor not found.</div>
          <button
            onClick={() => fetchVendor()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !vendor && !inputVendorId && !vendorId && (
        <div className="text-center py-8 text-gray-600">
          Enter a vendor ID to view profile
        </div>
      )}

      {vendor && (
        <>
          {/* Profile Picture Section */}
          <div className="text-center mb-6 w-24">
            <div className="relative inline-block">
              {vendor.profilePicture ? (
                <img
                  src={vendor.profilePicture}
                  alt={`${vendor.businessName} profile`}
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 rounded-full object-cover border-2 border-gray-200"
                  style={{ width: '200px', height: '200px' }}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
                  <span className="text-gray-500 text-lg">
                    {vendor.businessName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Vendor Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Vendor ID
              </label>
              <p className="mt-1 text-gray-900 font-mono text-sm bg-gray-100 p-2 rounded">
                {vendor.id}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <p className="mt-1 text-gray-900">{vendor.username}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Name
              </label>
              <p className="mt-1 text-gray-900">{vendor.businessName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Address
              </label>
              <p className="mt-1 text-gray-900">{vendor.businessAddress}</p>
            </div>

            <div className="text-xs text-gray-500 pt-4 border-t">
              <p>Created: {new Date(vendor.createdAt).toLocaleDateString()}</p>
              <p>Updated: {new Date(vendor.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="mt-6 pt-4 border-t">
            <button
              onClick={() => fetchVendor(vendor.id)}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
            >
              Refresh Profile
            </button>
          </div>
        </>
      )}
    </div>
  );
};
