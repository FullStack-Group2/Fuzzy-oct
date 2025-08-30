import React, { useEffect, useRef, useState } from "react";
import { Location, To, NavigateFunction } from "react-router-dom";

/* ---------- Small UI atoms ---------- */
type OrderStatus = "PENDING" | "ACTIVE" | "DELIVERED" | "CANCELED";

export function StatusBadge({ status }: { status?: OrderStatus }) {
  if (!status) return <span className="text-gray-400">-</span>;

  const cls =
    status === "PENDING"
      ? "text-gray-700"
      : status === "ACTIVE"
        ? "text-blue-700"
        : status === "DELIVERED"
          ? "text-emerald-700"
          : status === "CANCELED"
            ? "text-red-700"
            : "";

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] md:text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export function CloseButton({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      aria-label="Close"
      className={`rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export function BackButton({
  onClick,
  className = "",
  children = "←",
}: {
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className={`${className}`}>
      {children}
    </button>
  );
}

export function FunnelIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h11A1.5 1.5 0 0 1 17 4.5a1.5 1.5 0 0 1-.44 1.06L12 10v5.5a1 1 0 0 1-1.53.85l-2-1.25A1 1 0 0 1 8 14.25V10L3.44 5.56A1.5 1.5 0 0 1 3 4.5Z" />
    </svg>
  );
}

export function SortAZIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M3 4h8v2H3V4Zm0 5h6v2H3V9Zm0 5h4v2H3v-2Zm9-5.5h2.5V5l3.5 3.5-3.5 3.5V10.5H12Z" />
    </svg>
  );
}

export function SortZAIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M3 4h4v2H3V4Zm0 5h6v2H3V9Zm0 5h8v2H3v-2Zm6-4.5V12l-3.5-3.5L9 5v2.5h2.5V9H9Z" />
    </svg>
  );
}

/* ---------- Modal navigation helper ---------- */
/** Preserves background route (for modals) and allows pushing a refresh after mutations. */
export function useModalNavigation(location: Location, navigate: NavigateFunction, role: String) {
  const backgroundLocation = (location.state as any)?.backgroundLocation || null;

  const goClose = (mutated = false) => {
    if (backgroundLocation) {
      const to: To =
        backgroundLocation.pathname +
        (backgroundLocation.search || "") +
        (backgroundLocation.hash || "");
      const nextState = {
        ...(backgroundLocation.state || {}),
        refreshTick: mutated ? Date.now() : undefined,
      };
      navigate(to, { replace: true, state: nextState });
    } else {
      navigate(`/${role}/orders`, {
        replace: true,
        state: mutated ? { refreshTick: Date.now() } : undefined,
      });
    }
  };

  const goTo = (to: To, extraState?: any) => {
    navigate(to, {
      replace: true,
      state: { backgroundLocation: backgroundLocation || location, ...extraState },
    });
  };

  return { backgroundLocation, goClose, goTo };
}

/* ---------- Order detail bits ---------- */
export function OrderDetailHeader({
  orderIndex,
  onClose,
}: {
  orderIndex: number | null;
  onClose: () => void;
}) {
  return (
    <div className="relative mb-4 min-h-[44px] md:min-h-[56px]">
      <CloseButton onClick={onClose} className="absolute right-2 md:right-4 top-2 md:top-4" />
      <h1 className="absolute left-2 md:left-4 top-2 md:top-4 text-xl md:text-2xl font-semibold">
        {orderIndex != null ? `#${orderIndex}` : ""}
      </h1>
    </div>
  );
}

export function NoticeAlert({
  title,
  text,
  tone = "red",
  onDismiss,
}: {
  title: string;
  text: string;
  tone?: "red" | "emerald" | "blue";
  onDismiss?: () => void;
}) {
  const map = {
    red: {
      border: "border-red-300",
      bg: "bg-red-50",
      title: "text-red-800",
      text: "text-red-700",
      ring: "focus:ring-red-400",
    },
    emerald: {
      border: "border-emerald-300",
      bg: "bg-emerald-50",
      title: "text-emerald-800",
      text: "text-emerald-700",
      ring: "focus:ring-emerald-400",
    },
    blue: {
      border: "border-blue-300",
      bg: "bg-blue-50",
      title: "text-blue-800",
      text: "text-blue-700",
      ring: "focus:ring-blue-400",
    },
  }[tone];

  return (
    <div className={`mt-6 rounded-lg border ${map.border} ${map.bg} p-4`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={`mb-1 font-medium ${map.title}`}>{title}</h2>
          <p className={`text-sm whitespace-pre-wrap ${map.text}`}>{text}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`rounded p-1 ${map.text} hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-offset-2 ${map.ring}`}
            aria-label="Dismiss"
            title="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Status header with filter + sort ---------- */
const ALL_STATUSES = ["PENDING", "ACTIVE", "DELIVERED", "CANCELED"] as const;
type Status = (typeof ALL_STATUSES)[number];

function useOutsideClose<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);
  return ref;
}

export function StatusHeader({
  selected,
  onChangeSelected,
  sortOrder,
  onChangeSortOrder,
}: {
  selected: Status[];
  onChangeSelected: (next: Status[]) => void;
  sortOrder: "asc" | "desc" | undefined;
  onChangeSortOrder: (next: "asc" | "desc" | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose<HTMLDivElement>(open, () => setOpen(false));

  const toggleStatus = (s: Status) => {
    onChangeSelected(
      selected.includes(s) ? selected.filter((x) => x !== s) : [...selected, s]
    );
  };

  const clearFilter = () => onChangeSelected([]);
  const icon =
    sortOrder === "asc" ? <SortAZIcon className="h-4 w-4" /> :
      sortOrder === "desc" ? <SortZAIcon className="h-4 w-4" /> :
        <SortAZIcon className="h-4 w-4 opacity-40" />;

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-2">
        <span className="text-sm md:text-base">Status</span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-gray-50"
          title="Filter statuses"
        >
          <FunnelIcon className="h-4 w-4" />
          {selected.length ? `${selected.length} filter` : "Filter"}
        </button>
        <button
          type="button"
          onClick={() =>
            onChangeSortOrder(sortOrder === "asc" ? "desc" : sortOrder === "desc" ? undefined : "asc")
          }
          className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-gray-50"
          title={sortOrder ? `Sort: ${sortOrder.toUpperCase()}` : "Sort A→Z"}
        >
          {icon}
        </button>
      </div>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-64 md:w-56 max-w-[calc(100vw-2rem)] rounded-lg border bg-white p-3 shadow">
          <div className="mb-2 text-xs font-medium text-gray-700">Show statuses</div>
          <div className="space-y-1">
            {ALL_STATUSES.map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(s)}
                  onChange={() => toggleStatus(s)}
                />
                <span>{s}</span>
              </label>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <button
              className="text-xs text-gray-600 hover:underline"
              onClick={clearFilter}
              type="button"
            >
              Clear
            </button>
            <button
              className="rounded bg-black px-2 py-1 text-xs text-white"
              onClick={() => setOpen(false)}
              type="button"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Reject reason reusable piece ---------- */
export const DEFAULT_REASONS = [
  "Item is temporarily out of stock",
  "Product has a quality issue and cannot be shipped",
  "Order contained incorrect product information",
  "Vendor cannot fulfill the order within the required timeframe",
  "Item has been discontinued or is no longer available",
  "Other",
] as const;

export function RejectReasonSelector({
  reasons = DEFAULT_REASONS,
  reason,
  notes,
  onChangeReason,
  onChangeNotes,
}: {
  reasons?: readonly string[];
  reason: string;
  notes: string;
  onChangeReason: (r: string) => void;
  onChangeNotes: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      {reasons.map((r) => {
        const active = reason === r;
        const isOther = r === "Other";
        const needsNotes = isOther && active;
        const notesMissing = needsNotes && !notes.trim();

        return (
          <label
            key={r}
            className={`block cursor-pointer rounded-lg border p-3 transition-colors ${active ? "border-blue-500" : "border-gray-300 hover:border-gray-400"
              }`}
            onClick={() => {
              onChangeReason(r);
              if (!isOther) onChangeNotes("");
            }}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="reason"
                value={r}
                checked={active}
                onChange={() => onChangeReason(r)}
                className="mt-1"
              />
              <span>{r}</span>
            </div>

            {isOther && active && (
              <div className="mt-3">
                <textarea
                  className="w-full rounded-lg border border-gray-300 p-3 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-0"
                  rows={3}
                  value={notes}
                  onChange={(e) => onChangeNotes(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Please state your reason"
                  required
                  aria-required="true"
                  aria-invalid={notesMissing ? "true" : "false"}
                />
                {notesMissing && (
                  <p className="mt-1 text-xs text-red-600">
                    Notes are required when selecting “Other”.
                  </p>
                )}
              </div>
            )}
          </label>
        );
      })}
    </div>
  );
}

/* ---------- Derived helpers (if you want the same status mapping elsewhere) ---------- */
export function vendorUiStatus(status: OrderStatus) {
  return status; // keep signature identical to your existing mapping fn
}
