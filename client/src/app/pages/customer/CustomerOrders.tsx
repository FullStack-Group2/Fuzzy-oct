// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri
// ID: 4010989

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiCustomerGetOrders } from "@/api/CustomerAPI";
import type { CustomerOrderListDTO } from "@/models/CustomerDTO";
import { CustomerOrdersTable } from "@/components/CustomerOrdersUI";

export default function CustomerOrders() {
  const [orders, setOrders] = useState<CustomerOrderListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  async function refetch() {
    setLoading(true);
    try {
      const customerOrder = await apiCustomerGetOrders();
      if (customerOrder) {
        setOrders(customerOrder);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refetch();
  }, []);

  // support refresh after modal mutations (refreshTick)
  useEffect(() => {
    const tick = (location.state as any)?.refreshTick;
    if (!tick) return;
    refetch();
  }, [location.state]);

  return (
    <main className="mx-auto w-full max-w-7xl py-4 md:py-6">
      <h1 className="text-xl md:text-2xl font-semibold mb-1">My Orders</h1>
      <p className="text-xs md:text-sm text-gray-600 mb-4">
        All of your orders!
      </p>

      <CustomerOrdersTable
        orders={orders}
        loading={loading}
        location={location}
      />
    </main>
  );
}
