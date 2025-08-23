import { FormEvent, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiPatchOrderStatus } from "../../../api/ShipperAPI";

const REASONS = [
  "Customer unreachable",
  "Incorrect address",
  "Damaged at hub",
  "Other",
];

export default function ShipperCancelOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!orderId || !reason) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiPatchOrderStatus(orderId, "CANCELED", reason);
      // Replace to avoid history loop and go back to list
      navigate("/shipper/orders", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Failed to cancel order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg p-6">
      <div className="mb-4">
        {/* Back to detail; replace keeps history clean */}
        <Link to={`/shipper/orders/${orderId}`} replace className="underline">
          ← Back
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-3">Cancel Order {orderId}</h1>
      <p className="text-sm text-gray-600 mb-4">
        Please select a reason for cancellation.
      </p>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          {REASONS.map((r) => (
            <label key={r} className="flex items-center gap-2">
              <input
                type="radio"
                name="reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
              />
              <span>{r}</span>
            </label>
          ))}
          <label className="block">
            <span className="block text-sm mb-1">Additional notes (optional)</span>
            <textarea
              className="w-full rounded border p-2"
              rows={3}
              placeholder="Add more details…"
            />
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!reason || submitting}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? "Canceling…" : "Confirm Cancel"}
          </button>
          <Link
            to={`/shipper/orders/${orderId}`}
            replace
            className="rounded-md border px-4 py-2"
          >
            Back
          </Link>
        </div>
      </form>
    </main>
  );
}
