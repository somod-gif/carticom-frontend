// ============================================================
// CARTICOM STOREFRONT STUDIO — Branding service
// ============================================================

'use client';

import axiosInstance from '@/lib/axios';
import type { ApiResponse } from '@/lib/dal/types';
import type { StoreDto } from '@/features/onboarding/types';
import type { BrandingPayload } from './types';

const API_PREFIX = '/api/v1';

/**
 * Partially updates the storefront branding. Only send changed fields —
 * the backend treats a missing field as "leave it alone".
 */
export const brandingApi = {
  update: (storeId: string, payload: BrandingPayload) =>
    axiosInstance.put<ApiResponse<StoreDto>>(
      `${API_PREFIX}/stores/${storeId}/branding`,
      payload
    ),

  /** Makes the storefront publicly visible at /store/{slug}. */
  publish: (storeId: string) =>
    axiosInstance.patch<ApiResponse<StoreDto>>(
      `${API_PREFIX}/stores/${storeId}/publish`
    ),
};
