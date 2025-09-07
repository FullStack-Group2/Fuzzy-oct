// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri
// ID: 4010989

import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { apiVendorAcceptOrder, apiVendorGetOrderDetail } from "@/api/VendorAPI";
import type { VendorOrderDetailDTO } from "@/models/VendorDTO";
import OrderStatusBar from "@/components/OrderStatusBar";
import {
  NoticeAlert,
  OrderDetailHeader,
  useModalNavigation,
  vendorUiStatus,
} from "@/components/OrdersUI";
import {
  VendorOrderItemsTable,
} from "@/components/VendorOrdersUI";

type LocationState = { orderIndex?: number };
type Notice = { kind: "error" | "success" | "info"; text: string } | null;

export default function VendorOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const orderIndex = (location.state as LocationState)?.orderIndex ?? null;

  const [order, setOrder] = useState<VendorOrderDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const mutatedRef = useRef(false);

  const { goClose } = useModalNavigation(location, navigate, `vendor`);

  useEffect(() => {
    (async () => {
      if (!orderId) return;
      try {
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
      const msg = e?.error || e?.message || "Unable to accept order due to insufficient stock.";
      setNotice({ kind: "error", text: msg });
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

  const ui = vendorUiStatus(order.status);

  return (
    <main className="mx-auto w-full max-w-7xl px-3 md:px-6 py-4">
      <OrderDetailHeader orderIndex={orderIndex} onClose={() => goClose(mutatedRef.current)} />

      {order.status !== "CANCELED" && (
        <div className="mt-2 flex justify-center">
          <OrderStatusBar status={ui} className="w-full md:w-2/3 mx-auto" />
        </div>
      )}

      <p className="text-sm text-black mt-1">
        <strong>Customer name:</strong> {order.customerName}
        <br />
        <strong>Customer address:</strong> {order.customerAddress}
      </p>

      <VendorOrderItemsTable items={order.items} subtotal={order.vendorSubtotal} />

      {order.status === "PENDING" && (
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={onAccept}
            disabled={accepting}
            className="inline-flex items-center w-full sm:w-32 justify-center rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-60"
          >
            {accepting ? "Accepting…" : "Accept"}
          </button>
          <Link
            to={`/vendors/orders/${order.id}/reject`}
            state={{ backgroundLocation: (location.state as any)?.backgroundLocation || location, orderIndex }}
            className="inline-flex items-center w-full sm:w-32 justify-center rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Cancel
          </Link>
        </div>
      )}

      {notice?.kind === "error" && (
        <NoticeAlert title="Unable to accept" text={notice.text} tone="red" onDismiss={() => setNotice(null)} />
      )}

      {order.status === "CANCELED" && (
        <NoticeAlert title="Order canceled" text={order.cancelReason || "This order was canceled."} tone="red" />
      )}

      {order.status === "DELIVERED" && (
        <NoticeAlert title="Delivered" text="Your order has been delivered." tone="emerald" />
      )}

      {order.status === "ACTIVE" && (
        <NoticeAlert title="Active" text="Your order is currently being delivered." tone="blue" />
      )}
    </main>
  );
}