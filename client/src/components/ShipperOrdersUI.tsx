// src/components/ShipperOrdersUI.tsx
import { Link, Location } from "react-router-dom";
import type { OrderListDTO, OrderDetailDTO } from "@/models/ShipperDTO";

/** List table for shipper orders (no Status col) */
export function ShipperOrdersTable({
  orders,
  loading,
  location,
  emptyHint = "No active orders for your hub. 🎉",
}: {
  orders: OrderListDTO[];
  loading: boolean;
  location: Location;
  emptyHint?: string;
}) {
  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (!orders.length)
    return <div className="rounded-lg border p-6 text-sm text-gray-600">{emptyHint}</div>;

  return (
    <div className="overflow-x-auto rounded-lg border max-h-[70vh]">
      <table className="min-w-full text-left">
        <thead className="bg-gray-50 text-gray-700 text-xs md:text-sm sticky top-0 z-10">
          <tr>
            <th className="px-2 py-2 md:px-4 md:py-3 w-16 hidden md:table-cell">No.</th>
            <th className="px-2 py-2 md:px-4 md:py-3">Order ID</th>
            <th className="px-2 py-2 md:px-4 md:py-3">Customer</th>
            <th className="px-2 py-2 md:px-4 md:py-3 hidden md:table-cell">Total</th>
            <th className="px-2 py-2 md:px-4 md:py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {orders.map((o, idx) => (
            <tr key={o.id} className="text-xs md:text-sm">
              <td className="px-2 py-2 md:px-4 md:py-3 font-medium hidden md:table-cell">
                {idx + 1}
              </td>
              <td className="px-2 py-2 md:px-4 md:py-3 font-mono text-gray-500 max-w-[140px] md:max-w-none truncate">
                {o.id}
              </td>
              <td className="px-2 py-2 md:px-4 md:py-3">{o.customerName}</td>
              <td className="px-2 py-2 md:px-4 md:py-3 hidden md:table-cell">
                ${o.totalPrice.toFixed(2)}
              </td>
              <td className="px-2 py-2 md:px-4 md:py-3">
                <Link
                  to={`/shippers/orders/${o.id}`}
                  state={{ backgroundLocation: location, orderIndex: idx + 1 }}
                  className="inline-flex items-center rounded-md bg-black text-white px-2.5 py-1 text-xs md:px-3 md:py-1.5 md:text-sm hover:bg-black/85 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
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

/** Items table for shipper order detail (uses totalPrice for footer) */
export function ShipperOrderItemsTable({
  items,
  subtotal,
}: {
  items: OrderDetailDTO["items"];
  subtotal: number; // pass order.totalPrice
}) {
  return (
    <div className="mt-4 md:mt-6 overflow-x-auto rounded-lg border">
      <table className="min-w-full text-left">
        <thead className="bg-gray-50 text-gray-700 text-xs md:text-sm">
          <tr>
            <th className="px-2 py-2 md:px-4 md:py-3">Product name</th>
            <th className="px-2 py-2 md:px-4 md:py-3 hidden md:table-cell text-right">Price</th>
            <th className="px-2 py-2 md:px-4 md:py-3 hidden md:table-cell text-right">Qty</th>
            <th className="px-2 py-2 md:px-4 md:py-3 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((it) => (
            <tr key={it.id} className="text-xs md:text-sm">
              <td className="px-2 py-3 md:px-4">
                <div className="flex items-center gap-3">
                  <img
                    src={it.imageUrl}
                    alt={it.productName}
                    className="h-10 w-10 md:h-12 md:w-12 rounded object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <div className="truncate">{it.productName}</div>
                    <div className="mt-1 md:hidden text-[11px] text-gray-600">
                      ${it.priceAtPurchase.toFixed(2)} × {it.quantity}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-2 py-3 md:px-4 hidden md:table-cell text-right">
                ${it.priceAtPurchase.toFixed(2)}
              </td>
              <td className="px-2 py-3 md:px-4 hidden md:table-cell text-right">
                {it.quantity}
              </td>
              <td className="px-2 py-3 md:px-4 text-right font-medium">
                ${it.subtotal.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr className="hidden md:table-row">
            <td className="px-2 py-3 md:px-4"></td>
            <td className="px-2 py-3 md:px-4"></td>
            <td className="px-2 py-3 md:px-4 font-medium text-right">Total price</td>
            <td className="px-2 py-3 md:px-4 font-semibold text-right">
              ${subtotal.toFixed(2)}
            </td>
          </tr>
          <tr className="md:hidden">
            <td className="px-2 py-3 font-medium">Total price</td>
            <td className="px-2 py-3 font-semibold text-right">
              ${subtotal.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
