import { Link, Location } from "react-router-dom";
import { StatusBadge } from "@/components/OrdersUI";
import type {
  CustomerOrderDetailDTO,
  CustomerOrderListDTO,
} from "@/models/CustomerDTO";

/** Customer list table (No., DB Order ID, Vendor, Status, Total, Action) */
export function CustomerOrdersTable({
  orders,
  loading,
  location,
  emptyHint = "You have no orders yet.",
}: {
  orders: CustomerOrderListDTO[];
  loading: boolean;
  location: Location;
  emptyHint?: string;
}) {
  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (!orders.length)
    return (
      <div className="rounded-lg border p-6 text-sm text-gray-600">
        {emptyHint}
      </div>
    );

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full text-left">
        <thead className="bg-gray-50 text-gray-700 text-sm">
          <tr>
            <th className="px-4 py-3 w-16">No.</th>
            <th className="px-4 py-3">Order ID</th>
            <th className="px-4 py-3">Vendor</th>
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
              <td className="px-4 py-3">{o.vendorName}</td>
              <td className="px-4 py-3">
                <StatusBadge status={o.status} />
              </td>
              <td className="px-4 py-3">${o.totalPrice.toFixed(2)}</td>
              <td className="px-4 py-3">
                <Link
                  to={`/customer/orders/${o.id}`}
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
  );
}

/** Items table (uses totalPrice for footer) */
export function CustomerOrderItemsTable({
  items,
  subtotal,
}: {
  items: CustomerOrderDetailDTO["items"];
  subtotal: number;
}) {
  return (
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
          {items.map((it) => (
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
            <td className="px-4 py-3 font-semibold">${subtotal.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
