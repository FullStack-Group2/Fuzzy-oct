import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import type { VendorOrderDetailDTO } from "@/models/VendorDTO";
import { apiVendorAcceptOrder, apiVendorGetOrderDetail } from "@/api/VendorAPI";
import OrderStatusBar, { vendorUiStatus } from "@/components/OrderStatusBar";

type LocationState = { orderIndex?: number };

export default function VendorOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useLocation();
  const orderIndex = (state as LocationState)?.orderIndex ?? null;

  const [order, setOrder] = useState<VendorOrderDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (!orderId) return;
        const data = await apiVendorGetOrderDetail(orderId);
        setOrder(data);
      } catch (e) {
        console.error(e);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  async function onAccept() {
    if (!orderId) return;
    setAccepting(true);
    try {
      await apiVendorAcceptOrder(orderId);
      const data = await apiVendorGetOrderDetail(orderId);
      setOrder(data);
    } finally {
      setAccepting(false);
    }
  }

  if (loading) return <main className="p-6">Loading…</main>;
  if (!order) {
    return (
      <main className="p-6">
        <button onClick={() => navigate(-1)} className="underline">← Back</button>
        <p className="mt-2 text-sm text-red-600">Order not found.</p>
      </main>
    );
  }

  const uiStatus = vendorUiStatus({ status: order.status });

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <h1 className="absolute left-4 top-4 text-2xl font-semibold">
          {orderIndex != null ? `#${orderIndex}` : `(ID ${order.id})`}
        </h1>

      </div>

      <div className="mt-2 flex justify-center">
        <OrderStatusBar status={uiStatus as any} className="w-2/3 mx-auto" />
      </div>

      <p className="text-sm text-black mt-1">
        <strong>Customer name:</strong> {order.customerName}<br />
        <strong>Customer address:</strong> {order.customerAddress}
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50 text-gray-700 text-sm">
            <tr>
              <th className="px-4 py-3">Product name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {order.items.map((it) => (
              <tr key={it.id} className="text-sm">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={it.imageUrl} alt={it.productName} className="h-12 w-12 rounded object-cover" />
                    <span>{it.productName}</span>
                  </div>
                </td>
                <td className="px-4 py-3">${it.priceAtPurchase.toFixed(2)}</td>
                <td className="px-4 py-3">{it.quantity}</td>
                <td className="px-4 py-3">${it.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td></td>
              <td></td>
              <td className="px-4 py-3 font-medium">
                Total price
              </td>
              <td className="px-4 py-3 font-semibold">
                ${order.vendorSubtotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Action bar for PENDING */}
      {order.status === "PENDING" && (
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onAccept}
            disabled={accepting}
            className="inline-flex items-center w-32 justify-center rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-60"
          >
            {accepting ? "Accepting…" : "Accept"}
          </button>
          <Link
            to={`/vendor/orders/${order.id}/reject`}
            state={{ backgroundLocation: location, orderIndex }}
            className="inline-flex items-center w-32 justify-center rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Reject
          </Link>
        </div>
      )}

      {order.status === "CANCELED" && order.cancelReason && (
        <p className="mt-4 text-sm text-red-600">Canceled: {order.cancelReason}</p>
      )}
    </main>
  );
}
