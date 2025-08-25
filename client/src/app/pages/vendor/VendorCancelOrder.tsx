import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { apiVendorRejectOrder } from "@/api/VendorAPI";

const REASONS = ["Out of stock", "Unable to fulfill timeline", "Pricing error", "Other"];

type LocationState = { orderIndex?: number };

export default function VendorRejectOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const orderIndex = (state as LocationState)?.orderIndex ?? null;

  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!orderId || !reason) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiVendorRejectOrder(orderId, `${reason}${notes ? ` — ${notes}` : ""}`);
      navigate("/vendor/orders", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Failed to reject order.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg p-6">
      <div className="mb-4">
        <Link to={`/vendor/orders/${orderId}`} state={{ orderIndex }} replace className="underline">
          ← Back
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-3">
        Reject Order {orderIndex != null ? `#${orderIndex}` : `(ID ${orderId})`}
      </h1>
      <p className="text-sm text-gray-600 mb-4">Choose a reason for rejection.</p>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          {REASONS.map((r) => (
            <label key={r} className="flex items-center gap-2">
              <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} />
              <span>{r}</span>
            </label>
          ))}
          <label className="block">
            <span className="block text-sm mb-1">Additional notes (optional)</span>
            <textarea className="w-full rounded border p-2" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </div>

        <div className="flex justify-center gap-3">
          <button
            type="submit"
            disabled={!reason || submitting}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? "Rejecting…" : "Confirm Reject"}
          </button>
          <Link to={`/vendor/orders/${orderId}`} state={{ orderIndex }} replace className="rounded-md border px-4 py-2">
            Back
          </Link>
        </div>
      </form>
    </main>
  );
}
