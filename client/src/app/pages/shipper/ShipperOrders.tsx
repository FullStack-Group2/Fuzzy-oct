// src/pages/shipper/ShipperOrders.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { OrderListDTO } from "../../../models/ShipperDTO";
import { apiGetActiveOrders } from "../../../api/ShipperAPI";

export default function ShipperOrders() {
  const [orders, setOrders] = useState<OrderListDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // 👇 call your API helper (backend must provide hubId via auth)
        const data = await apiGetActiveOrders();
        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Shipper — Active Orders</h1>
      <p className="text-xl mb-4">Below are your list of orders</p>

      {loading ? (
        <p className="text-sm text-gray-500">Loading orders…</p>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border p-6 text-sm text-gray-600">
          No active orders for your hub. 🎉
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50 text-gray-700 text-sm">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Total Price</th>
                <th className="px-4 py-3">Customer Name</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((o) => (
                <tr key={o.id} className="text-sm">
                  <td className="px-4 py-3 font-mono">{o.id}</td>
                  <td className="px-4 py-3">${o.totalPrice.toFixed(2)}</td>
                  <td className="px-4 py-3">{o.customerName}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/shipper/orders/${o.id}`}
                      className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
