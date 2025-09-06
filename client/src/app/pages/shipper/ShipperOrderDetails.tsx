// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri
// ID: 4010989

import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import type { OrderDetailDTO } from "@/models/ShipperDTO";
import { apiGetOrderDetail, apiPatchOrderStatus } from "@/api/ShipperAPI";
import { OrderDetailHeader, useModalNavigation } from "@/components/OrdersUI";
import { ShipperOrderItemsTable } from "@/components/ShipperOrdersUI";

type LocationState = { orderIndex?: number };

export default function ShipperOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const orderIndex = (location.state as LocationState)?.orderIndex ?? null;

  const [order, setOrder] = useState<OrderDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<"deliver" | "cancel" | null>(null);
  const mutatedRef = useRef(false);

  const { goClose } = useModalNavigation(location, navigate, "shipper");

  useEffect(() => {
    (async () => {
      if (!orderId) return setLoading(false);
      try {
        const data = await apiGetOrderDetail(orderId);
        setOrder(data);
      } catch (e) {
        console.error(e);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  async function handleDeliver() {
    if (!orderId) return;
    setUpdating("deliver");
    try {
      const res = await apiPatchOrderStatus(orderId, "DELIVERED");
      if (res.ok) {
        mutatedRef.current = true;
        goClose(true);
      }
    } finally {
      setUpdating(null);
    }
  }

  if (loading) return <main className="p-6">Loading…</main>;
  if (!order) {
    return (
      <main className="p-6">
        <div className="mb-4">
          <Link to="/shippers/orders" className="underline">←</Link>
        </div>
        <p className="text-sm text-red-600">Order not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-3 md:px-6 py-4">
      <OrderDetailHeader orderIndex={orderIndex} onClose={() => goClose(mutatedRef.current)} />

      <p className="text-sm text-black">
        <strong>Customer Name:</strong> {order.customerName}<br />
        <strong>Customer Address:</strong> {order.customerAddress}
      </p>

      <ShipperOrderItemsTable items={order.items} subtotal={order.totalPrice} />

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={handleDeliver}
          disabled={updating === "deliver"}
          className="w-full sm:w-32 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-60"
        >
          {updating === "deliver" ? "Delivering…" : "Deliver"}
        </button>
        <Link
          to={`/shippers/orders/${order.id}/cancel`}
          state={{ backgroundLocation: (location.state as any)?.backgroundLocation || location, orderIndex }}
          className="inline-flex items-center w-full sm:w-32 justify-center rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Cancel
        </Link>
      </div>
    </main>
  );
}
