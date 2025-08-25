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

  const uiStatus = vendorUiStatus({ vendorDecision: order.vendorDecision, status: order.status });

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-4">
         <button onClick={() => navigate(-1)} className="underline">← Back</button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">
          Order {orderIndex != null ? `#${orderIndex}` : `(ID ${order.id})`}
        </h1>
        <OrderStatusBar status={uiStatus as any} />
      </div>

      <p className="text-sm text-black mt-1">
        <strong>Customer:</strong> {order.customerName}<br />
        <strong>Address:</strong> {order.customerAddress}
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50 text-gray-700 text-sm">
            <tr>
              <th className="px-4 py-3">Product</th>
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
              <td colSpan={4} className="px-4 py-3">
                <div className="w-full flex items-center justify-end gap-2">
                  <span className="font-medium">Vendor Subtotal</span>
                  <span className="font-semibold font-mono tabular-nums">${order.vendorSubtotal.toFixed(2)}</span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Action bar for PENDING */}
      {order.vendorDecision === "PENDING" && (
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onAccept}
            disabled={accepting}
            className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-60"
          >
            {accepting ? "Accepting…" : "Accept"}
          </button>
          <Link
            to={`/vendor/orders/${order.id}/reject`}
            state={{ backgroundLocation: location, orderIndex }}
            className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Reject
          </Link>
        </div>
      )}

      {order.vendorDecision === "REJECTED" && order.vendorRejectReason && (
        <p className="mt-4 text-sm text-red-600">Rejected: {order.vendorRejectReason}</p>
      )}
    </main>
  );
}
