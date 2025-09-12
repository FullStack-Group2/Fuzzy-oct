import React, { useState, useEffect } from "react";
import ChatPage from "./ChatPage";

export default function ChatPanel() {
  const [listOfCustomer, setListOfCustomer] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // const res = await axios.get("http://localhost:5001/api/customers");
        setListOfCustomer(res.data);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    };
    fetchCustomers();
  }, []);

  const handleSetCustomer = (customer: any) => {
    setSelectedCustomer(customer);
  };

  return (
    <div className="flex h-[90vh] border border-gray-300 rounded-lg shadow-md bg-white">
      {/* Sidebar bên trái */}
      <div className="w-64 border-r border-gray-200 p-4 bg-gray-50">
        <h3 className="text-lg font-semibold mb-3">Customers</h3>
        {listOfCustomer.length === 0 ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          listOfCustomer.map((customer) => (
            <button
              key={customer._id}
              onClick={() => handleSetCustomer(customer)}
              className={`w-full px-4 py-2 mb-2 rounded-lg text-left transition-colors ${
                selectedCustomer?._id === customer._id
                  ? "bg-blue-100 text-blue-600 border border-blue-300"
                  : "bg-white hover:bg-gray-100 border border-gray-300"
              }`}
            >
              {customer.name}
            </button>
          ))
        )}
      </div>

      {/* ChatPage bên phải */}
      <div className="flex-1 p-5">
        {selectedCustomer ? (
          <ChatPage receiver={selectedCustomer} />
        ) : (
          <p className="text-gray-500 text-center mt-20">
            👈 Chọn một khách hàng để bắt đầu chat
          </p>
        )}
      </div>
    </div>
  );
}
