// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri
// ID: 4010989

import { FormEvent, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { apiVendorRejectOrder } from '@/api/VendorAPI';
import {
  BackButton,
  CloseButton,
  RejectReasonSelector,
  useModalNavigation,
} from '@/components/OrdersUI';

type LocationState = { orderIndex?: number };

export default function VendorRejectOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { backgroundLocation, goClose, goTo } = useModalNavigation(
    location,
    navigate,
    `vendor`,
  );
  const orderIndex =
    ((location.state || {}) as LocationState).orderIndex ?? null;

  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function goDetails() {
    if (!orderId) return goClose(false);
    const state = { backgroundLocation, orderIndex };
    goTo(`/vendors/orders/${orderId}`, state);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!orderId || !reason) return;

    setSubmitting(true);
    setError(null);

    try {
      const merged = reason === 'Other' && notes ? notes : reason;
      await apiVendorRejectOrder(orderId, merged);
      goClose(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to reject order.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-lg px-3 md:px-6 py-4">
      <BackButton onClick={goDetails} className="absolute left-4 top-4" />
      <CloseButton
        onClick={() => goClose(false)}
        className="absolute right-4 top-4"
      />

      <h1 className="text-xl md:text-2xl font-semibold mb-3">Reason</h1>
      <p className="text-sm text-gray-600 mb-4">
        Choose one only
        <span aria-hidden="true" className="ml-1 text-red-600">
          *
        </span>
      </p>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <form onSubmit={onSubmit} className="space-y-4">
        <RejectReasonSelector
          reason={reason}
          notes={notes}
          onChangeReason={setReason}
          onChangeNotes={setNotes}
        />

        <div className="flex justify-center gap-3">
          <button
            type="submit"
            disabled={
              !reason || submitting || (reason === 'Other' && !notes.trim())
            }
            className="w-full sm:w-auto rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? 'Canceling...' : 'Cancel'}
          </button>
        </div>
      </form>
    </main>
  );
}
