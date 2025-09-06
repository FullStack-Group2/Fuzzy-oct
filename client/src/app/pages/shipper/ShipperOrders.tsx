// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri
// ID: 4010989

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import type { OrderListDTO } from "@/models/ShipperDTO";
import { apiGetActiveOrders } from "@/api/ShipperAPI";
import { ShipperOrdersTable } from "@/components/ShipperOrdersUI";

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

  useEffect(() => { refetch(); }, []);

  useEffect(() => {
    const tick = (location.state as any)?.refreshTick;
    if (!tick) return;
    refetch();
  }, [location.state]);

  return (
    <main className="mx-auto w-full max-w-7xl py-4 md:py-6">
      <h1 className="text-xl md:text-2xl font-semibold mb-1">Shipper - Active Orders</h1>
      <p className="text-xs md:text-sm text-gray-600 mb-4">Below are your list of orders</p>

      <ShipperOrdersTable
        orders={orders}
        loading={loading}
        location={location}
        emptyHint="No active orders for your hub. 🎉"
      />
    </main>
  );
}
