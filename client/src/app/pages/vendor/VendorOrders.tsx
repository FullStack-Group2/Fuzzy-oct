// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri
// ID: s4010989

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { VendorOrderListDTO } from '@/types/VendorDTO';
import { apiVendorGetOrders } from '@/api/VendorAPI';
import { VendorOrdersTable } from '@/components/VendorOrdersUI';
import HeroBanner from '@/components/HeroBanner';
import bed from '../../../assets/icon/bed.webp';

type Status = 'PENDING' | 'ACTIVE' | 'DELIVERED' | 'CANCELED';

export default function VendorOrders() {
  const [orders, setOrders] = useState<VendorOrderListDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const initial = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    const statuses = sp.getAll('status').map((s) => s.toUpperCase() as Status);
    const sortBy = sp.get('sortBy');
    const order = (sp.get('order') as 'asc' | 'desc' | null) ?? undefined;
    return {
      statuses: (statuses.length ? statuses : []) as Status[],
      sortOrder: sortBy === 'status' && order ? order : undefined,
    };
  }, []);

  const [selectedStatuses, setSelectedStatuses] = useState<Status[]>(
    initial.statuses,
  );
  const [statusSortOrder, setStatusSortOrder] = useState<
    'asc' | 'desc' | undefined
  >(initial.sortOrder);

  // Build query params based on current UI state
  const buildSearchParams = () => {
    const params = new URLSearchParams();
    selectedStatuses.forEach((s) => params.append('status', s));
    if (statusSortOrder) {
      params.set('sortBy', 'status');
      params.set('order', statusSortOrder);
    }
    return params;
  };

  // Centralized fetch (used on load + whenever filters/sort change)
  async function refetch() {
    setLoading(true);
    try {
      const params = buildSearchParams();
      setOrders(await apiVendorGetOrders(params));
      // keep URL in sync
      navigate({ search: params.toString() }, { replace: true });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // initial load
  useEffect(() => {
    refetch();
  }, []);

  // react to detail modal’s refresh tick
  useEffect(() => {
    const tick = (location.state as any)?.refreshTick;
    if (!tick) return;
    refetch();
  }, [location.state]);

  useEffect(() => {
    refetch();
  }, [selectedStatuses, statusSortOrder]);

  return (
    <>
      <HeroBanner
        image={bed}
        title="Active Deliveries"
        subtitle="All of your deliveries are listed here!"
      />

      <main className="mx-auto w-full max-w-7xl py-4 md:py-6">
        <h1 className="text-xl md:text-2xl font-semibold mb-1">
          Vendor - Orders
        </h1>
        <p className="text-xs md:text-sm text-gray-600 mb-4">
          All orders that include your products.
        </p>

        <VendorOrdersTable
          orders={orders}
          loading={loading}
          location={location}
          selectedStatuses={selectedStatuses}
          onSelectedStatusesChange={setSelectedStatuses}
          statusSortOrder={statusSortOrder}
          onStatusSortOrderChange={setStatusSortOrder}
        />
      </main>
    </>
  );
}
