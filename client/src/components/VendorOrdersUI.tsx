import { Link, Location } from "react-router-dom";
import { StatusBadge, FunnelIcon, SortAZIcon, SortZAIcon, StatusHeader } from "./OrdersUI";
import { useEffect, useMemo, useRef, useState } from "react";

/* ---------- Types you already have (import from your models if preferred) ---------- */
export type VendorOrderListDTO = {
  id: string;
  status: "PENDING" | "ACTIVE" | "DELIVERED" | "CANCELED";
  totalPrice: number;
  customerName: string;
};

export type VendorOrderItemDTO = {
  id: string;
  productName: string;
  imageUrl: string;
  priceAtPurchase: number;
  quantity: number;
  subtotal: number;
};

export type VendorOrderDetailDTO = {
  id: string;
  status: "PENDING" | "ACTIVE" | "DELIVERED" | "CANCELED";
  customerName: string;
  customerAddress: string;
  items: VendorOrderItemDTO[];
  vendorSubtotal: number;
  cancelReason?: string | null;
};

/* ---------- Orders table (list page) ---------- */
export function VendorOrdersTable({
  orders,
  loading,
  emptyHint = "No orders yet.",
  location,

  selectedStatuses,
  onSelectedStatusesChange,
  statusSortOrder,
  onStatusSortOrderChange,
}: {
  orders: VendorOrderListDTO[];
  loading: boolean;
  emptyHint?: string;
  location: Location;
  detailsHrefBase?: string;

  selectedStatuses?: ("PENDING" | "ACTIVE" | "DELIVERED" | "CANCELED")[];
  onSelectedStatusesChange?: (next: ("PENDING" | "ACTIVE" | "DELIVERED" | "CANCELED")[]) => void;
  statusSortOrder?: "asc" | "desc";
  onStatusSortOrderChange?: (next: "asc" | "desc" | undefined) => void;
}) {
  const [localStatuses, setLocalStatuses] = useState<("PENDING" | "ACTIVE" | "DELIVERED" | "CANCELED")[]>([]);
  const [localSort, setLocalSort] = useState<"asc" | "desc" | undefined>(undefined);

  const sel = selectedStatuses ?? localStatuses;
  const setSel = onSelectedStatusesChange ?? setLocalStatuses;

  const srt = (statusSortOrder as "asc" | "desc" | undefined) ?? localSort;
  const setSrt = onStatusSortOrderChange ?? setLocalSort;

  /* local fallback behavior: filter and sort the already-loaded orders */
  const visibleOrders = useMemo(() => {
    let data = orders;
    if (sel.length) {
      data = data.filter((o) => sel.includes(o.status));
    }
    if (srt) {
      data = [...data].sort((a, b) => {
        const x = a.status.localeCompare(b.status);
        return srt === "asc" ? x : -x;
      });
    }
    return data;
  }, [orders, sel, srt]);

  const clearAll = () => {
    setSel([]);
    setSrt(undefined);
  };

  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;

  const ControlsBar = (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      <StatusHeader
        selected={sel}
        onChangeSelected={setSel}
        sortOrder={srt}
        onChangeSortOrder={setSrt}
      />
      {(sel.length > 0 || srt) && (
        <button
          type="button"
          onClick={clearAll}
          className="ml-2 inline-flex items-center rounded border px-2 py-1 text-xs hover:bg-gray-50"
          title="Clear all filters"
        >
          Clear filters
        </button>
      )}
    </div>
  );

  if (!orders.length)
    return (
      <div>
        {ControlsBar}
        <div className="rounded-lg border p-6 text-sm text-gray-600">{emptyHint}</div>;
      </div>
    );

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full text-left">
        <thead className="bg-gray-50 text-gray-700 text-sm">
          <tr>
            <th className="px-4 py-3 w-16">No.</th>
            <th className="px-4 py-3">Order ID</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">
              <StatusHeader
                selected={sel}
                onChangeSelected={setSel}
                sortOrder={srt}
                onChangeSortOrder={setSrt}
              /></th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {visibleOrders.length === 0 ? (
            // --- “No results” row that keeps header visible and offers a quick reset ---
            <tr>
              <td colSpan={6} className="px-4 py-6 text-sm text-gray-600">
                No orders match the current filters.
                <button
                  onClick={clearAll}
                  className="ml-2 inline-flex items-center rounded border px-2 py-1 text-xs hover:bg-gray-50"
                >
                  Clear filters
                </button>
              </td>
            </tr>
          ) : (
            visibleOrders.map((o, idx) => (
              <tr key={o.id} className="text-sm">
                <td className="px-4 py-3 font-medium">{idx + 1}</td>
                <td className="px-4 py-3 font-mono text-gray-500">{o.id}</td>
                <td className="px-4 py-3">{o.customerName}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function VendorOrderItemsTable({
  items,
  subtotal,
}: {
  items: VendorOrderItemDTO[];
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
            <td></td><td></td>
            <td className="px-4 py-3 font-medium">Total price</td>
            <td className="px-4 py-3 font-semibold">${subtotal.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}