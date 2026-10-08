// ============================================================
// CARTICOM ONBOARDING — React Query Hooks (aligned with backend)
// ============================================================

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  storeApi,
  productApi} from '@/features/onboarding/services/onboarding.service';
import { showToast } from '@/lib/notifications/toast';
import { extractErrorMessage } from '@/lib/axios';
import type {
  CreateStoreDto,
  UpdateStoreDto,
  CreateProductDto,
  StoreDto,
  ProductDto} from '@/features/onboarding/types';

// ─── Query Keys ──────────────────────────────────────────────

export const onboardingKeys = {
  stores: ['stores'] as const,
  storeById: (id: string) => ['stores', id] as const,
  products: ['products'] as const,
  productsByStore: (storeId: string) => ['products', 'store', storeId] as const,
  wallet: ['wallet'] as const};

// ─── Existing Shop (duplicate-shop guard) ─────────────────────

/**
 * Asks the server which shop the seller already owns, right now.
 *
 * Every path that could create a shop calls this first, so a seller who
 * abandons the wizard halfway — or opens it in two tabs — can never end up
 * with a second shop. Returns `null` only when the server really has none.
 */
export async function fetchExistingStore(): Promise<StoreDto | null> {
  const res = await storeApi.getMyStores();
  const stores = res.data.data ?? [];
  return stores[0] ?? null;
}

// ─── Create Store ─────────────────────────────────────────────

export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStoreDto) => {
      // Safety net: never create a shop when one already exists. If it does,
      // save these details into that shop instead (the web address is left
      // untouched so existing links keep working).
      const existing = await fetchExistingStore();
      if (existing) {
        const res = await storeApi.update(existing.id, {
          storeName: data.storeName,
          phone: data.phone,
          description: data.description,
          businessCategory: data.businessCategory,
          email: data.email,
          address: data.address,
          country: data.country,
          currency: data.currency});
        return { store: res.data.data as StoreDto, created: false };
      }

      const res = await storeApi.create(data);
      return { store: res.data.data as StoreDto, created: true };
    },
    onSuccess: ({ store, created }) => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.stores });
      showToast('success', created ? 'Your shop has been created' : 'Your changes were saved');
      return store;
    },
    onError: (error: Error) => {
      showToast('error', 'We could not save your shop', {
        description: extractErrorMessage(error)});
    }});
}

// ─── Update Store ─────────────────────────────────────────────

export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStoreDto }) =>
      storeApi.update(id, data).then((res) => res.data.data as StoreDto),
    onSuccess: (store) => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.stores });
      queryClient.invalidateQueries({ queryKey: onboardingKeys.storeById(store.id) });
      showToast('success', 'Your changes were saved');
    },
    onError: (error: Error) => {
      showToast('error', 'We could not save your changes', {
        description: extractErrorMessage(error)});
    }});
}

// ─── Get My Stores ────────────────────────────────────────────

export function useMyStores() {
  return useQuery({
    queryKey: onboardingKeys.stores,
    queryFn: () => storeApi.getMyStores().then((res) => res.data.data ?? [])});
}

// ─── Create Product ───────────────────────────────────────────

export function useCreateProduct() {
  return useMutation({
    mutationFn: (data: CreateProductDto) =>
      productApi.create(data).then((res) => res.data.data as ProductDto),
    onSuccess: () => {
      showToast('success', 'Product created successfully');
    },
    onError: (error: Error) => {
      showToast('error', 'We could not save your product', {
        description: extractErrorMessage(error)});
    }});
}

// ─── Get Products by Store ────────────────────────────────────

export function useStoreProducts(storeId: string | undefined) {
  return useQuery({
    queryKey: onboardingKeys.productsByStore(storeId ?? ''),
    queryFn: () =>
      productApi.getByStore(storeId!).then((res) => res.data.data ?? []),
    enabled: !!storeId});
}

// ─── Wallet Balance ───────────────────────────────────────────
