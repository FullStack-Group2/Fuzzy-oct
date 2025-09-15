// import React, { useState, useEffect } from "react";
// import ChatPage from "./ChatPage";

// export default function ChatPanel() {
//   const [listOfCustomer, setListOfCustomer] = useState<any[]>([]);
//   const [selectedCustomer, setSelectedCustomer] = useState<string>('');

//   useEffect(() => {
//     const fetchCustomers = async () => {
//       try {
//         // const res = await axios.get("http://localhost:5001/api/customers");
//         setListOfCustomer(res.data);
//       } catch (err) {
//         console.error("Error fetching customers:", err);
//       }
//     };
//     fetchCustomers();
//   }, []);

//   const handleSetCustomer = (customer: any) => {
//     setSelectedCustomer(customer);
//   };

//   return (
//     <div className="flex h-[90vh] border border-gray-300 rounded-lg shadow-md bg-white">
//       {/* Sidebar bên trái */}
//       <div className="w-64 border-r border-gray-200 p-4 bg-gray-50">
//         <h3 className="text-lg font-semibold mb-3">Customers</h3>
//         {listOfCustomer.length === 0 ? (
//           <p className="text-gray-500">Loading...</p>
//         ) : (
//           listOfCustomer.map((customer) => (
//             <button
//               key={customer._id}
//               onClick={() => handleSetCustomer(customer)}
//               className={`w-full px-4 py-2 mb-2 rounded-lg text-left transition-colors ${
//                 selectedCustomer?._id === customer._id
//                   ? "bg-blue-100 text-blue-600 border border-blue-300"
//                   : "bg-white hover:bg-gray-100 border border-gray-300"
//               }`}
//             >
//               {customer.name}
//             </button>
//           ))
//         )}
//       </div>

//       {/* ChatPage bên phải */}
//       <div className="flex-1 p-5">
//         {selectedCustomer ? (
//           <ChatPage receiver={selectedCustomer} />
//         ) : (
//           <p className="text-gray-500 text-center mt-20">
//             👈 Chọn một khách hàng để bắt đầu chat
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/stores/AuthProvider';
import { useNavigate, useParams } from 'react-router-dom';
import ChatPage from './ChatPage';

interface Customer {
  _id: string;
  name?: string;
  username: string;
  email?: string;
  role: string;
}

export default function ChatPanel() {
  const { user, isAuth } = useAuth();
  const navigate = useNavigate();
  const { receiverId } = useParams<{ receiverId: string }>();
  const [listOfCustomers, setListOfCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!isAuth || !user) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await fetch(
          'http://localhost:5001/api/chat/conversations',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setListOfCustomers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Failed to fetch conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [isAuth, user]);

  // Update selectedCustomer when receiverId changes from URL
  useEffect(() => {
    if (receiverId && listOfCustomers.length > 0) {
      const customer = listOfCustomers.find((c) => c._id === receiverId);
      if (customer) {
        setSelectedCustomer(customer);
      }
    }
  }, [receiverId, listOfCustomers]);

  const handleSetCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    navigate(`/chat/${user!.id}/${customer._id}`);
  };

  if (!isAuth || !user) {
    return (
      <div className="flex h-[90vh] items-center justify-center">
        <p className="text-gray-500">Please log in to access the chat panel.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[90vh] border border-gray-300 rounded-lg shadow-md bg-white">
      {/* Sidebar on the left */}
      <div className="w-64 border-r border-gray-200 p-4 bg-gray-50 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-3">Customer Chats</h3>

        {loading ? (
          <p className="text-gray-500">Loading conversations...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : listOfCustomers.length === 0 ? (
          <p className="text-gray-500">No active conversations.</p>
        ) : (
          listOfCustomers.map((customer) => (
            <button
              key={customer._id}
              onClick={() => handleSetCustomer(customer)}
              className={`w-full px-4 py-2 mb-2 rounded-lg text-left transition-colors ${
                receiverId === customer._id
                  ? 'bg-blue-100 text-blue-600 border border-blue-300'
                  : 'bg-white hover:bg-gray-100 border border-gray-300'
              }`}
            >
              <div className="font-medium">
                {customer.name || customer.username}
              </div>
              {customer.email && (
                <div className="text-sm text-gray-500">{customer.email}</div>
              )}
            </button>
          ))
        )}
      </div>

      {/* ChatPage on the right */}
      <div className="flex-1 flex flex-col p-5">
        {receiverId ? (
          <div className="flex-1 flex flex-col">
            <div className="mb-4 pb-2 border-b">
              <h2 className="text-lg font-semibold">
                Chat with{' '}
                {selectedCustomer?.name ||
                  selectedCustomer?.username ||
                  'Customer'}
              </h2>
            </div>
            <ChatPage />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 text-center">
              👈 Select a customer to view the conversation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
