// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri
// ID: 4010989

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiCustomerGetOrders } from '@/api/CustomerAPI';
import type { CustomerOrderListDTO } from '@/models/CustomerDTO';
import { CustomerOrdersTable } from '@/components/CustomerOrdersUI';
import HeroBanner from '@/components/HeroBanner';
import bed from "../../../assets/icon/bed2.jpg"

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
    <>
      <HeroBanner
        image={bed}
        title="Your orders"
        subtitle="All of your orders are listed here!"
      />

      <main className="mx-auto w-full max-w-7xl py-4 md:py-6">
        <CustomerOrdersTable
          orders={orders}
          loading={loading}
          location={location}
        />
      </main>
    </>
  );
}
