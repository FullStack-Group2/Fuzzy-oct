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
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold mb-1">Shipper - Active Orders</h1>
      <p className="text-sm text-gray-600 mb-4">Below are your list of orders</p>

      <ShipperOrdersTable
        orders={orders}
        loading={loading}
        location={location}
        emptyHint="No active orders for your hub. 🎉"
      />
    </main>
  );
}
