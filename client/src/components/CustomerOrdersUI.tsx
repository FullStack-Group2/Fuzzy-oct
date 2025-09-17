// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri
// ID: s4010989

import { Link, Location } from 'react-router-dom';
import { StatusBadge, StatusHeader } from '@/components/OrdersUI';
import type {
  CustomerOrderDetailDTO,
  CustomerOrderListDTO,
} from '@/types/CustomerDTO';
import { useMemo, useState } from 'react';

/** Customer list table (No., DB Order ID, Vendor, Status, Total, Action) */
export function CustomerOrdersTable({
  orders,
  loading,
  location,
  emptyHint = 'You have no orders yet.',

  selectedStatuses,
  onSelectedStatusesChange,
  statusSortOrder,
  onStatusSortOrderChange,
}: {
  orders: CustomerOrderListDTO[];
  loading: boolean;
  location: Location;
  emptyHint?: string;

  selectedStatuses?: ('PENDING' | 'ACTIVE' | 'DELIVERED' | 'CANCELED')[];
  onSelectedStatusesChange?: (
    next: ('PENDING' | 'ACTIVE' | 'DELIVERED' | 'CANCELED')[],
  ) => void;
  statusSortOrder?: 'asc' | 'desc';
  onStatusSortOrderChange?: (next: 'asc' | 'desc' | undefined) => void;
}) {
  const [localStatuses, setLocalStatuses] = useState<
    ('PENDING' | 'ACTIVE' | 'DELIVERED' | 'CANCELED')[]
  >([]);
  const [localSort, setLocalSort] = useState<'asc' | 'desc' | undefined>(
    undefined,
  );

  const sel = selectedStatuses ?? localStatuses;
  const setSel = onSelectedStatusesChange ?? setLocalStatuses;

  const srt = (statusSortOrder as 'asc' | 'desc' | undefined) ?? localSort;
  const setSrt = onStatusSortOrderChange ?? setLocalSort;

  const visibleOrders = useMemo(() => {
    let data = orders;
    if (sel.length) {
      data = data.filter((o) => sel.includes(o.status));
    }
    if (srt) {
      data = [...data].sort((a, b) => {
        const x = a.status.localeCompare(b.status);
        return srt === 'asc' ? x : -x;
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

  if (orders.length == 0)
    return (
      <div>
        {ControlsBar}
        <div className="rounded-lg border p-6 text-sm text-gray-600">
          {emptyHint}
        </div>
      </div>
    );

  return (
    <div className="overflow-x-auto rounded-lg border max-h-[70vh]">
      <table className="min-w-full text-left">
        <thead className="bg-gray-50 text-gray-700 text-xs md:text-sm sticky top-0 z-10">
          <tr>
            <th className="px-2 py-2 md:px-4 md:py-3 w-16 hidden md:table-cell">
              No.
            </th>
            <th className="px-2 py-2 md:px-4 md:py-3">Order ID</th>
            <th className="px-2 py-2 md:px-4 md:py-3">Vendor</th>
            <th className="px-2 py-2 md:px-4 md:py-3">
              <StatusHeader
                selected={sel}
                onChangeSelected={setSel}
                sortOrder={srt}
                onChangeSortOrder={setSrt}
              />
            </th>
            <th className="px-2 py-2 md:px-4 md:py-3 hidden md:table-cell">
              Total
            </th>
            <th className="px-2 py-2 md:px-4 md:py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {visibleOrders.length === 0 ? (
            // --- “No results” row that keeps header visible and offers a quick reset ---
            <tr>
              <td colSpan={6} className="px-3 py-6 text-sm text-gray-600">
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
              <tr key={o.id} className="text-xs md:text-sm">
                <td className="px-2 py-2 md:px-4 md:py-3 font-medium hidden md:table-cell">
                  {idx + 1}
                </td>
                <td className="px-2 py-2 md:px-4 md:py-3 font-mono text-gray-500 max-w-[80px] sm:max-w-[120px] md:max-w-none truncate">
                  {o.id}
                </td>
                <td className="px-2 py-2 md:px-4 md:py-3">{o.vendorName}</td>
                <td className="px-2 py-2 md:px-4 md:py-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-2 py-2 md:px-4 md:py-3 hidden md:table-cell">
                  ${o.totalPrice.toLocaleString()}
                </td>
                <td className="px-2 py-2 md:px-4 md:py-3">
                  <Link
                    to={`/customers/orders/${o.id}`}
                    state={{
                      backgroundLocation: location,
                      orderIndex: idx + 1,
                    }}
                    className="inline-flex items-center rounded-md bg-black text-white px-2.5 py-1 text-xs md:px-3 md:py-1.5 md:text-sm hover:bg-black/85 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
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

/** Items table (uses totalPrice for footer) */
export function CustomerOrderItemsTable({
  items,
  subtotal,
}: {
  items: CustomerOrderDetailDTO['items'];
  subtotal: number;
}) {
  return (
    <div className="mt-4 md:mt-6 overflow-x-auto rounded-lg border">
      <table className="min-w-full text-left">
        <thead className="bg-gray-50 text-gray-700 text-xs md:text-sm">
          <tr>
            <th className="px-2 py-2 md:px-4 md:py-3">Product name</th>
            <th className="px-2 py-2 md:px-4 md:py-3 hidden md:table-cell text-right">
              Price
            </th>
            <th className="px-2 py-2 md:px-4 md:py-3 hidden md:table-cell text-right">
              Qty
            </th>
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
                      ${it.priceAtPurchase.toLocaleString()} × {it.quantity}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-2 py-3 md:px-4 hidden md:table-cell text-right">
                ${it.priceAtPurchase.toLocaleString()}
              </td>
              <td className="px-2 py-3 md:px-4 hidden md:table-cell text-right">
                {it.quantity}
              </td>
              <td className="px-2 py-3 md:px-4 text-right font-medium">
                ${it.subtotal.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr className="hidden md:table-row">
            <td className="px-2 py-3 md:px-4"></td>
            <td className="px-2 py-3 md:px-4"></td>
            <td className="px-2 py-3 md:px-4 font-medium text-right">
              Total price
            </td>
            <td className="px-2 py-3 md:px-4 font-semibold text-right">
              ${subtotal.toLocaleString()}
            </td>
          </tr>
          <tr className="md:hidden">
            <td className="px-2 py-3 font-medium">Total price</td>
            <td className="px-2 py-3 font-semibold text-right">
              ${subtotal.toLocaleString()}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
