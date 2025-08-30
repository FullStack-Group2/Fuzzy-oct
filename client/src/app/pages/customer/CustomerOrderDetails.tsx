import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import type { CustomerOrderDetailDTO } from "@/models/CustomerDTO";
import { apiCustomerGetOrderDetail } from "@/api/CustomerAPI";
import { OrderDetailHeader, useModalNavigation, vendorUiStatus } from "@/components/OrdersUI";
import { CustomerOrderItemsTable } from "@/components/CustomerOrdersUI";
import OrderStatusBar from "@/components/OrderStatusBar";

type LocationState = { orderIndex?: number };

export default function CustomerOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const orderIndex = (location.state as LocationState)?.orderIndex ?? null;

  const [order, setOrder] = useState<CustomerOrderDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const mutatedRef = useRef(false);

  const { goClose } = useModalNavigation(location, navigate, "customer");

  useEffect(() => {
    (async () => {
      if (!orderId) return setLoading(false);
      try {
        const data = await apiCustomerGetOrderDetail(orderId);
        setOrder(data);
      } catch (e) {
        console.error(e);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  if (loading) return <main className="p-6">Loading…</main>;
  if (!order) {
    return (
      <main className="p-6">
        <div className="mb-4">
          <Link to="/customer/orders" className="underline">←</Link>
        </div>
        <p className="text-sm text-red-600">Order not found.</p>
      </main>
    );
  }

  const ui = vendorUiStatus(order.status);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <OrderDetailHeader
        orderIndex={orderIndex}
        onClose={() => goClose(mutatedRef.current)}
      />

      {order.status !== "CANCELED" && (
        <div className="mt-2 flex justify-center">
          <OrderStatusBar status={ui} className="w-2/3 mx-auto" />
        </div>
      )}

      <p className="text-sm text-black mt-1">
        <strong>Vendor:</strong> {order.vendorName}
        {order.customerAddress && (
          <>
            <br />
            <strong>Ship to:</strong> {order.customerAddress}
          </>
        )}
      </p>

      <CustomerOrderItemsTable items={order.items} subtotal={order.totalPrice} />

      {order.status === "PENDING" && (
        <div className="mt-6 flex justify-center">
          <Link
            to={`/customer/orders/${order.id}/cancel`}
            state={{
              backgroundLocation:
                (location.state as any)?.backgroundLocation || location,
              orderIndex,
            }}
            className="inline-flex items-center w-32 justify-center rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Cancel
          </Link>
        </div>
      )}

      {order.status === "CANCELED" && (
        <div className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4">
          <h2 className="mb-1 font-medium text-red-800">Order canceled</h2>
          {/* (Optional) show order.cancelReason if you expose it to customers */}
        </div>
      )}
    </main>
  );
}
