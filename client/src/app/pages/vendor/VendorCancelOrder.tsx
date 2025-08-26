import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { apiVendorRejectOrder } from "@/api/VendorAPI";
import { GoArrowLeft } from "react-icons/go";

const REASONS = ["Item is temporarily out of stock", "Product has a quality issue and cannot be shipped", "Order contained incorrect product information", "Vendor cannot fulfill the order within the required timeframe", "Item has been discontinued or is no longer available", "Other"];

type LocationState = { orderIndex?: number };

export default function VendorRejectOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const backgroundLocation = (location.state as any)?.backgroundLocation || null;
  const orderIndex = ((location.state || {}) as LocationState).orderIndex ?? null;

  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function goDetails() {
    if (!orderId) {
      exitAll();
      return;
    }
    const state = { backgroundLocation, orderIndex };
    navigate(`/vendor/orders/${orderId}`, { replace: true, state });
  }

  function exitAll() {
    if (backgroundLocation) {
      const to =
        backgroundLocation.pathname +
        (backgroundLocation.search || "") +
        (backgroundLocation.hash || "");
      navigate(to, { replace: true, state: backgroundLocation.state });
    } else {
      navigate("/vendor/orders", { replace: true });
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!orderId || !reason) return;

    setSubmitting(true);
    setError(null);

    try {
      const merged = reason === "Other" && notes ? notes : reason;

      await apiVendorRejectOrder(orderId, merged);
      navigate("/vendor/orders", { replace: true });
      exitAll();
    } catch (err: any) {
      setError(err?.message || "Failed to reject order.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg p-6">
      <div className="mb-4">
        <button
          onClick={goDetails}
          aria-label="Back to details"
          className="absolute left-4 top-4 rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          {/* Left arrow */}
          <GoArrowLeft className="h-4 w-4" />
        </button>
      </div>


      <div className="mb-4">
        <button
          onClick={exitAll}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <h1 className="text-2xl font-semibold mb-3">
        Reason
      </h1>
      <p className="text-sm text-gray-600 mb-4">Choose one only
        <span aria-hidden="true" className="ml-1 text-red-600">*</span>
      </p>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Bordered choices */}
        <div className="space-y-3">
          {REASONS.map((r) => {
            const active = reason === r;
            const isOther = r === "Other";
            const needsNotes = isOther && active;
            const notesMissing = needsNotes && !notes.trim();

            return (
              <label
                key={r}
                // make the card a block so we can stack the textarea inside it
                className={`block cursor-pointer rounded-lg border p-3 transition-colors
          ${active ? "border-blue-500" : "border-gray-300 hover:border-gray-400"}`}
                onClick={() => {
                  setReason(r);
                  if (!isOther) setNotes("");
                }}
              >
                {/* top row: radio + text (keeps your text style) */}
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={active}
                    onChange={() => setReason(r)}
                    className="mt-1"
                  />
                  <span>{r}</span>
                </div>

                {/* notes live INSIDE the same card when "Other" is selected */}
                {isOther && active && (
                  <div className="mt-3">
                    <textarea
                      className="w-full rounded-lg border border-gray-300 p-3 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-0"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      onClick={(e) => e.stopPropagation()} // don't toggle radio when clicking textarea
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

        <div className="flex justify-center gap-3">
          <button
            type="submit"
            disabled={!reason || submitting || (reason === "Other" && !notes.trim())}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? "Canceling..." : "Cancel"}
          </button>
        </div>
      </form>
    </main>
  );
}
