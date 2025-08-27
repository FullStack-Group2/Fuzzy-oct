import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import type { VendorOrderDetailDTO } from '@/models/VendorDTO';
import { apiVendorAcceptOrder, apiVendorGetOrderDetail } from '@/api/VendorAPI';
import OrderStatusBar, { vendorUiStatus } from '@/components/OrderStatusBar';

type LocationState = { orderIndex?: number };
type Notice = { kind: 'error' | 'success' | 'info'; text: string } | null;

export default function VendorOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useLocation();
  const orderIndex = (state as LocationState)?.orderIndex ?? null;

  const [order, setOrder] = useState<VendorOrderDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  const [notice, setNotice] = useState<Notice>(null);

  const mutatedRef = useRef(false);

  const backgroundLocation =
    (location.state as any)?.backgroundLocation || null;

  const onClose = () => {
    if (backgroundLocation) {
      // preserve query/hash if any
      const to =
        backgroundLocation.pathname +
        (backgroundLocation.search || '') +
        (backgroundLocation.hash || '');

      const nextState = {
        ...(backgroundLocation.state || {}),
        refreshTick: mutatedRef.current ? Date.now() : undefined,
      };

      navigate(to, { replace: true, state: nextState });
    } else {
      navigate('/vendor/orders', {
        replace: true,
        state: { refreshTick: Date.now() },
      });
    }
  };

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
      mutatedRef.current = true;
    } catch (e: any) {
      const msg =
        e?.error ||
        e?.message ||
        'Unable to accept order due to insufficient stock.';
      setNotice({ kind: 'error', text: msg });
    } finally {
      setAccepting(false);
    }
  }

  if (loading) return <main className="p-6">Loading…</main>;
  if (!order) {
    return (
      <main className="p-6">
        <button onClick={() => navigate(-1)} className="underline">
          ← Back
        </button>
        <p className="mt-2 text-sm text-red-600">Order not found.</p>
      </main>
    );
  }

  const uiStatus = vendorUiStatus({ status: order.status });

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-4">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <h1 className="absolute left-4 top-4 text-2xl font-semibold">
          {orderIndex != null ? `#${orderIndex}` : `(ID ${order.id})`}
        </h1>
      </div>

      {order.status !== 'CANCELED' && (
        <div className="mt-2 flex justify-center">
          <OrderStatusBar status={uiStatus} className="w-2/3 mx-auto" />
        </div>
      )}

      <p className="text-sm text-black mt-1">
        <strong>Customer name:</strong> {order.customerName}
        <br />
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
                    <img
                      src={it.imageUrl}
                      alt={it.productName}
                      className="h-12 w-12 rounded object-cover"
                    />
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
              <td className="px-4 py-3 font-medium">Total price</td>
              <td className="px-4 py-3 font-semibold">
                ${order.vendorSubtotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Action bar for PENDING */}
      {order.status === 'PENDING' && (
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onAccept}
            disabled={accepting}
            className="inline-flex items-center w-32 justify-center rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-60"
          >
            {accepting ? 'Accepting…' : 'Accept'}
          </button>
          <Link
            to={`/vendor/orders/${order.id}/reject`}
            state={{
              backgroundLocation: backgroundLocation || location,
              orderIndex,
            }}
            className="inline-flex items-center w-32 justify-center rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Reject
          </Link>
        </div>
      )}

      {notice?.kind === 'error' && (
        <div className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="mb-1 font-medium text-red-800">Unable to accept</h2>
              <p className="text-sm text-red-700 whitespace-pre-wrap">{notice.text}</p>
            </div>
            <button
              onClick={() => setNotice(null)}
              className="rounded p-1 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
              aria-label="Dismiss"
              title="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      )}


      {order.status === 'CANCELED' && (
        <div className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4">
          <h2 className="mb-1 font-medium text-red-800">Order canceled</h2>
          <p className="text-sm text-red-700 whitespace-pre-wrap">
            {order.cancelReason || 'This order was canceled.'}
          </p>
        </div>
      )}

      {order.status === 'DELIVERED' && (
        <div className="mt-6 rounded-lg border border-emerald-300 bg-emerald-50 p-4">
          <h2 className="mb-1 font-medium text-emerald-800">Delivered</h2>
          <p className="text-sm text-emerald-700">
            Your order has been delivered.
          </p>
        </div>
      )}
    </main>
  );
}
