// src/pages/shipper/ShipperOrderDetail.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import type { OrderDetailDTO, OrderListDTO } from "../../../models/ShipperDTO";
import { apiGetOrderDetail, apiPatchOrderStatus, apiGetActiveOrders } from "../../../api/ShipperAPI";

type LocationState = { orderIndex?: number };

export default function ShipperOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const [order, setOrder] = useState<OrderDetailDTO | null>(null);
  const [orderIndex, setOrderIndex] = useState<number | null>(state.orderIndex ?? null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<"deliver" | "cancel" | null>(null);


  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        if (!orderId) {
          setLoading(false);
          return;
        }

        const data = await apiGetOrderDetail(orderId);
        if (!alive) return;
        setOrder(data);

        if (state.orderIndex == null) {
          const list: OrderListDTO[] = await apiGetActiveOrders();
          if (!alive) return;
          const pos = list.findIndex((o) => o.id === orderId);
          if (pos >= 0) setOrderIndex(pos + 1);
          else setOrderIndex(null); // not found (maybe inactive now)
        }
      } catch (err) {
        console.error("Failed to fetch order detail:", err);
        if (alive) setOrder(null);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [orderId, state.orderIndex]);

  async function handleDeliver() {
    if (!orderId) return;
    setUpdating("deliver");
    const res = await apiPatchOrderStatus(orderId, "DELIVERED");
    setUpdating(null);
    if (res.ok) navigate("/shipper/orders");
  }

  function handleCancel() {
    if (!orderId) return;
    navigate(`/shipper/orders/${orderId}/cancel`, { replace: true, state: { orderIndex }, });
  }

  if (loading) return <main className="p-6">Loading…</main>;
  if (!order) {
    return (
      <main className="p-6">
        <div className="mb-4">
          <Link to="/shipper/orders" className="underline">
            ← Back
          </Link>
        </div>
        <p className="text-sm text-red-600">Order not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="underline">
          ← Back
        </button>
      </div>

      <h1 className="text-2xl font-semibold">
        Order {orderIndex != null ? `#${orderIndex}` : `(ID ${order.id})`}
      </h1>
      <p className="text-sm text-black">
        <strong>Customer Name:</strong> {order.customerName} &middot;{" "}
        <br></br>
        <strong>Customer Address:</strong> {order.customerAddress}
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50 text-gray-700 text-sm">
            <tr>
              <th className="px-4 py-3">Product Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {order.items.map((item) => (
              <tr key={item.id} className="text-sm">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="h-12 w-12 rounded object-cover"
                    />
                    <span>{item.productName}</span>
                  </div>
                </td>
                <td className="px-4 py-3">${item.priceAtPurchase.toFixed(2)}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">${item.subtotal.toFixed(2)}</td>
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
                ${order.totalPrice.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-6 flex gap-3 justify-center">
        <button
          onClick={handleDeliver}
          disabled={updating === "deliver"}
          className="w-32 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-60"
        >
          {updating === "deliver" ? "Delivering…" : "Deliver"}
        </button>
        <button
          onClick={handleCancel}
          disabled={updating === "cancel"}
          className="w-32 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </main>
  );
}
