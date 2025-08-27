import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { VendorOrderListDTO } from '@/models/VendorDTO';
import { apiVendorGetOrders } from '@/api/VendorAPI';
import { VendorOrdersTable } from '@/components/VendorOrdersUi';

export default function VendorOrders() {
  const [orders, setOrders] = useState<VendorOrderListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Function to refresh in real-time
  async function refetch() {
    setLoading(true);
    try {
      setOrders(await apiVendorGetOrders());
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
    // no need to scrub state here unless you want; your detail modal already does replace-state
  }, [location.state]);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold mb-1">Vendor - Orders</h1>
      <p className="text-sm text-gray-600 mb-4">All orders that include your products.</p>

      <VendorOrdersTable orders={orders} loading={loading} location={location} />
    </main>
  );
}
