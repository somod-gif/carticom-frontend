// ============================================================
// CARTICOM ADDRESSES — React Query Hooks
// The signed-in customer's saved address book.
// ============================================================

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance, { getAccessToken } from '@/lib/axios';
import type { ApiResponse } from '@/lib/dal/types';
import { getCustomerToken } from '@/features/storefront/services/customer-auth.service';

const API_PREFIX = '/api/v1';

export interface AddressDto {
  id: number;
  label: string;
  street: string;
  city: string;
  state: string | null;
  country: string;
  phone: string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface AddressInput {
  label?: string;
  street: string;
  city: string;
  state?: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

const addressApi = {
  list: () => {
    // Storefront customers keep their token in localStorage, so fall back to it
    // when the shared axios session has no in-memory token (e.g. after a reload).
    const token = getCustomerToken() ?? getAccessToken();
    return axiosInstance.get<ApiResponse<AddressDto[]>>(
      `${API_PREFIX}/customers/addresses`,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
  },

  create: (data: AddressInput) => {
    const token = getCustomerToken() ?? getAccessToken();
    return axiosInstance.post<ApiResponse<AddressDto>>(
      `${API_PREFIX}/customers/addresses`,
      data,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
  },

  update: (id: number, data: AddressInput) => {
    const token = getCustomerToken() ?? getAccessToken();
    return axiosInstance.put<ApiResponse<AddressDto>>(
      `${API_PREFIX}/customers/addresses/${id}`,
      data,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
  },

  remove: (id: number) => {
    const token = getCustomerToken() ?? getAccessToken();
    return axiosInstance.delete(
      `${API_PREFIX}/customers/addresses/${id}`,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
  },

  setDefault: (id: number) => {
    const token = getCustomerToken() ?? getAccessToken();
    return axiosInstance.post<ApiResponse<AddressDto>>(
      `${API_PREFIX}/customers/addresses/${id}/default`,
      undefined,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
  },
};

// ─── Use Saved Addresses ────────────────────────────────────

/** The signed-in customer's address book, default first. */
export function useAddresses() {
  return useQuery({
    queryKey: ['storefront', 'addresses'],
    queryFn: async () => {
      const res = await addressApi.list();
      return res.data?.data || [];
    },
    staleTime: 30 * 1000, // 30 seconds — addresses change rarely
  });
}

// ─── Use Save Address ───────────────────────────────────────

/** Saves a new address. Toasts and form state live in the caller. */
export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddressInput) => {
      const res = await addressApi.create(data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['storefront', 'addresses']});
    },
  });
}

// ─── Use Update Address ─────────────────────────────────────

/** Updates one of the customer's own addresses. */
export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AddressInput }) => {
      const res = await addressApi.update(id, data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['storefront', 'addresses']});
    },
  });
}

// ─── Use Delete Address ─────────────────────────────────────

/** Deletes one of the customer's own addresses. */
export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await addressApi.remove(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['storefront', 'addresses']});
    },
  });
}

// ─── Use Set Default Address ────────────────────────────────

/** Makes one address the default — the previous one is cleared on the server. */
export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await addressApi.setDefault(id);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['storefront', 'addresses']});
    },
  });
}
