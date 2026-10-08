// ============================================================
// CARTICOM RETURNS — React Query Hooks
// Customer return / refund requests for delivered orders.
// ============================================================

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance, { getAccessToken } from '@/lib/axios';
import type { ApiResponse } from '@/lib/dal/types';
import { getCustomerToken } from '@/features/storefront/services/customer-auth.service';

const API_PREFIX = '/api/v1';

export interface ReturnDto {
  id: number;
  orderId: number;
  customerId: string | null;
  reason: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
  createdAt: string;
  updatedAt: string | null;
}

const returnApi = {
  listForOrder: (orderId: string) => {
    // Storefront customers keep their token in localStorage, so fall back to it
    // when the shared axios session has no in-memory token (e.g. after a reload).
    const token = getCustomerToken() ?? getAccessToken();
    return axiosInstance.get<ApiResponse<ReturnDto[]>>(
      `${API_PREFIX}/orders/${orderId}/returns`,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
  },

  create: (orderId: string, reason: string) => {
    const token = getCustomerToken() ?? getAccessToken();
    return axiosInstance.post<ApiResponse<ReturnDto>>(
      `${API_PREFIX}/orders/${orderId}/returns`,
      { reason },
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
  },
};

// ─── Use Order Returns ────────────────────────────────────────

/** The return requests filed against one order, newest first. */
export function useOrderReturns(orderId: string, enabled = true) {
  return useQuery({
    queryKey: ['storefront', 'order-returns', orderId],
    queryFn: async () => {
      const res = await returnApi.listForOrder(orderId);
      return res.data?.data || [];
    },
    enabled: !!orderId && enabled,
    staleTime: 30 * 1000, // 30 seconds — returns change rarely
  });
}

// ─── Use Request Return ───────────────────────────────────────

/** Asks for a return on a delivered order. Toasts and cache updates live in the caller. */
export function useRequestReturn(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reason: string) => {
      const res = await returnApi.create(orderId, reason);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['storefront', 'order-returns', orderId]});
    },
  });
}
