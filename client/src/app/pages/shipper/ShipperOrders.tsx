// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri
// ID: 4010989

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { OrderListDTO } from '@/models/ShipperDTO';
import { apiGetActiveOrders } from '@/api/ShipperAPI';
import { ShipperOrdersTable } from '@/components/ShipperOrdersUI';
import HeroBanner from '@/components/HeroBanner';
import bed3 from '../../../assets/icon/bed3.jpg'

export default function ShipperOrders() {
  const [orders, setOrders] = useState<OrderListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  async function refetch() {
    setLoading(true);
    try {
      setOrders(await apiGetActiveOrders());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    const tick = (location.state as any)?.refreshTick;
    if (!tick) return;
    refetch();
  }, [location.state]);

  return (
    <>
      <HeroBanner
        image={bed3}
        title="Active Deliveries"
        subtitle="All of your deliveries are listed here!"
      />

      <main className="mx-auto w-full max-w-7xl py-4 md:py-6">
        
        <ShipperOrdersTable
          orders={orders}
          loading={loading}
          location={location}
          emptyHint="No active orders for your hub. 🎉"
        />
      </main>
    </>
  );
}
