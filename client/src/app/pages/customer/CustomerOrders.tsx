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
      setOrders(await apiCustomerGetOrders());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refetch(); }, []);

  // support refresh after modal mutations (refreshTick)
  useEffect(() => {
    const tick = (location.state as any)?.refreshTick;
    if (!tick) return;
    refetch();
  }, [location.state]);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold mb-1">My Orders</h1>
      <p className="text-sm text-gray-600 mb-4">All of your orders!</p>

      <CustomerOrdersTable
        orders={orders}
        loading={loading}
        location={location}
      />
    </main>
  );
}
