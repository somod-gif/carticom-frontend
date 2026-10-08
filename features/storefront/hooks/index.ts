// ============================================================
// CARTICOM — Storefront React Query Hooks
// Cached, background-refetching data fetching for storefront.
// ============================================================

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance, { getAccessToken } from '@/lib/axios';
import type { ApiResponse } from '@/lib/dal/types';
import { storefrontApi, productApi, cartApi } from '@/features/onboarding/services/onboarding.service';
import { getCustomerToken } from '@/features/storefront/services/customer-auth.service';

const API_PREFIX = '/api/v1';

// ─── Store Hooks ──────────────────────────────────────────────

export function useStoreBySlug(slug: string) {
  return useQuery({
    queryKey: ['storefront', 'store', slug],
    queryFn: async () => {
      const res = await storefrontApi.getStoreBySlug(slug);
      return res.data?.data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useStoreProducts(slug: string) {
  return useQuery({
    queryKey: ['storefront', 'products', slug],
    queryFn: async () => {
      const res = await storefrontApi.getStoreProducts(slug);
      return res.data?.data || [];
    },
    enabled: !!slug,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useStoreCategories(slug: string) {
  return useQuery({
    queryKey: ['storefront', 'categories', slug],
    queryFn: async () => {
      const res = await storefrontApi.getStoreCategories(slug);
      return res.data?.data || [];
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ─── Marketplace Hooks ────────────────────────────────────────

export function useMarketplaceStores(query?: string) {
  return useQuery({
    queryKey: ['storefront', 'marketplace', query],
    queryFn: async () => {
      const res = await storefrontApi.getStores(query);
      return res.data?.data || [];
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

// ─── Product Hooks ────────────────────────────────────────────

export function useProductById(id: string) {
  return useQuery({
    queryKey: ['storefront', 'product', id],
    queryFn: async () => {
      const res = await productApi.getById(id);
      return res.data?.data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Cart Hooks ───────────────────────────────────────────────

export function useCart(storeId: string) {
  return useQuery({
    queryKey: ['storefront', 'cart', storeId],
    queryFn: async () => {
      const res = await cartApi.get(storeId);
      return res.data?.data;
    },
    enabled: !!storeId,
    staleTime: 30 * 1000, // 30 seconds — cart changes frequently
  });
}

// ─── Review Hooks ────────────────────────────────────────────

export interface ReviewDto {
  id: number;
  productId: number;
  customerName: string;
  rating: number;
  comment: string | null;
  status?: string;
  createdAt: string;
}

export interface ReviewAggregate {
  average: number;
  count: number;
}

/** Envelope for GET /products/{id}/reviews — success/data plus the rating totals. */
export interface ReviewListResponse extends ApiResponse<ReviewDto[]> {
  aggregate: ReviewAggregate;
}

export interface CreateReviewInput {
  rating: number;
  comment?: string;
}

const reviewApi = {
  list: (productId: string) =>
    axiosInstance.get<ReviewListResponse>(
      `${API_PREFIX}/products/${productId}/reviews`
    ),

  create: (productId: string, data: CreateReviewInput) => {
    // Storefront customers keep their token in localStorage, so fall back to it
    // when the shared axios session has no in-memory token (e.g. after a reload).
    const token = getCustomerToken() ?? getAccessToken();
    return axiosInstance.post<ApiResponse<ReviewDto>>(
      `${API_PREFIX}/products/${productId}/reviews`,
      data,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
  },
};

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ['storefront', 'product-reviews', productId],
    queryFn: async () => {
      const res = await reviewApi.list(productId);
      return {
        reviews: res.data?.data || [],
        aggregate: res.data?.aggregate || { average: 0, count: 0},
      };
    },
    enabled: !!productId,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useCreateReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewInput) => {
      const res = await reviewApi.create(productId, data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['storefront', 'product-reviews', productId]});
    },
  });
}
