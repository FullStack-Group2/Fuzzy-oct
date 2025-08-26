import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { VendorOrderListDTO } from "@/models/VendorDTO";
import { apiVendorGetOrders } from "@/api/VendorAPI";

export default function VendorOrders() {
  const [orders, setOrders] = useState<VendorOrderListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    (async () => {
      try { setOrders(await apiVendorGetOrders()); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold mb-1">Vendor — Orders</h1>
      <p className="text-sm text-gray-600 mb-4">All orders that include your products.</p>

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border p-6 text-sm text-gray-600">No orders yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50 text-gray-700 text-sm">
              <tr>
                <th className="px-4 py-3 w-16">No.</th>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((o, idx) => (
                <tr key={o.id} className="text-sm">
                  <td className="px-4 py-3 font-medium">{idx + 1}</td>
                  <td className="px-4 py-3 font-mono text-gray-500">{o.id}</td>
                  <td className="px-4 py-3">{o.customerName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium
                        ${o.status === "PENDING" ? "text-gray-700" :
                        o.status === "ACTIVE" ? "text-blue-700" :
                        o.status === "DELIVERED" ? "text-emerald-700" :
                        o.status === "CANCELED" ? "text-red-700" : ""}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">${o.totalPrice.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/vendor/orders/${o.id}`}
                      state={{ backgroundLocation: location, orderIndex: idx + 1 }}
                      className="inline-flex items-center rounded-md bg-black text-white px-3 py-1.5 text-sm hover:bg-black/85 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    >
                      View
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
