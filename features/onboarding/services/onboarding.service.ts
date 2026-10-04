// ============================================================
// CARTICOM ONBOARDING — Service Layer (aligned with backend)
// ============================================================

import axiosInstance from '@/lib/axios';
import type { ApiResponse } from '@/lib/dal/types';
import type {
  CreateStoreDto,
  UpdateStoreDto,
  StoreDto,
  StorePaymentConfigDto,
  SavePaymentCredentialsDto,
  CreateProductDto,
  ProductDto,
  OrderDto,
  PaymentDto,
  CartDto} from '@/features/onboarding/types';

const API_PREFIX = '/api/v1';

// ─── Store API ────────────────────────────────────────────────

export const storeApi = {
  create: (data: CreateStoreDto) =>
    axiosInstance.post<ApiResponse<StoreDto>>(`${API_PREFIX}/stores`, data),

  getMyStores: () =>
    axiosInstance.get<ApiResponse<StoreDto[]>>(`${API_PREFIX}/stores`),

  getById: (id: string) =>
    axiosInstance.get<ApiResponse<StoreDto>>(`${API_PREFIX}/stores/${id}`),

  getBySlug: (slug: string) =>
    axiosInstance.get<ApiResponse<StoreDto>>(`${API_PREFIX}/stores/slug/${slug}`),

  update: (id: string, data: UpdateStoreDto) =>
    axiosInstance.put<ApiResponse<StoreDto>>(`${API_PREFIX}/stores/${id}`, data),

  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<null>>(`${API_PREFIX}/stores/${id}`),

  updateStatus: (id: string, status: string) =>
    axiosInstance.patch<ApiResponse<StoreDto>>(
      `${API_PREFIX}/stores/${id}/status?status=${status}`
    ),

  getPaymentConfig: (id: string) =>
    axiosInstance.get<ApiResponse<StorePaymentConfigDto>>(
      `${API_PREFIX}/stores/${id}/payment-config`
    ),

  savePaymentCredentials: (id: string, data: SavePaymentCredentialsDto) =>
    axiosInstance.put<ApiResponse<StorePaymentConfigDto>>(
      `${API_PREFIX}/stores/${id}/payment-config/credentials`,
      data
    )};

// ─── Product API ──────────────────────────────────────────────

export const productApi = {
  create: (data: CreateProductDto) =>
    axiosInstance.post<ApiResponse<ProductDto>>(`${API_PREFIX}/products`, data),

  getByStore: (storeId: string) =>
    axiosInstance.get<ApiResponse<ProductDto[]>>(
      `${API_PREFIX}/products/store/${storeId}`
    ),

  getActiveByStore: (storeId: string) =>
    axiosInstance.get<ApiResponse<ProductDto[]>>(
      `${API_PREFIX}/products/store/${storeId}/active`
    ),

  getById: (id: string) =>
    axiosInstance.get<ApiResponse<ProductDto>>(`${API_PREFIX}/products/${id}`),

  update: (id: string, data: Partial<CreateProductDto>) =>
    axiosInstance.put<ApiResponse<ProductDto>>(`${API_PREFIX}/products/${id}`, data),

  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<null>>(`${API_PREFIX}/products/${id}`),

  updateInventory: (id: string, quantityDelta: number) =>
    axiosInstance.patch<ApiResponse<ProductDto>>(
      `${API_PREFIX}/products/${id}/inventory`,
      { quantityDelta }
    ),

  search: (query: string) =>
    axiosInstance.get<ApiResponse<ProductDto[]>>(
      `${API_PREFIX}/products/search?q=${encodeURIComponent(query)}`
    ),

  getByCategory: (categoryId: string) =>
    axiosInstance.get<ApiResponse<ProductDto[]>>(
      `${API_PREFIX}/products/category/${categoryId}`
    )};

// ─── Cart API ─────────────────────────────────────────────────

export const cartApi = {
  get: (storeId: string) =>
    axiosInstance.get<ApiResponse<CartDto>>(
      `${API_PREFIX}/cart?storeId=${storeId}`
    ),

  add: (data: { storeId: string; productId: string; quantity: number; variantId?: string }) =>
    axiosInstance.post<ApiResponse<CartDto>>(`${API_PREFIX}/cart/items`, data),

  updateItem: (storeId: string, productId: string, quantity: number) =>
    axiosInstance.put<ApiResponse<CartDto>>(
      `${API_PREFIX}/cart/items`,
      { storeId, productId, quantity }
    ),

  removeItem: (storeId: string, productId: string) =>
    axiosInstance.delete<ApiResponse<CartDto>>(
      `${API_PREFIX}/cart/items?storeId=${storeId}&productId=${productId}`
    ),

  clear: (storeId: string) =>
    axiosInstance.delete<ApiResponse<null>>(
      `${API_PREFIX}/cart/clear?storeId=${storeId}`
    )};

// ─── Checkout / Orders API ────────────────────────────────────

export const checkoutApi = {
  checkout: (storeId: string, data?: {
    deliveryMethod?: string;
    notes?: string;
    couponCode?: string;
    shippingAddress?: {
      fullName: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      country?: string;
    };
  }) =>
    axiosInstance.post<ApiResponse<OrderDto>>(
      `${API_PREFIX}/checkout?storeId=${storeId}`,
      data || {}
    ),

  getMyOrders: () =>
    axiosInstance.get<ApiResponse<OrderDto[]>>(`${API_PREFIX}/checkout/orders`),

  getOrderById: (orderId: string) =>
    axiosInstance.get<ApiResponse<OrderDto>>(
      `${API_PREFIX}/checkout/orders/${orderId}`
    ),

  cancelOrder: (orderId: string) =>
    axiosInstance.post<ApiResponse<OrderDto>>(
      `${API_PREFIX}/checkout/orders/${orderId}/cancel`
    )};

// ─── Payments API ─────────────────────────────────────────────

export const paymentApi = {
  initiate: (data: {
    orderId: string;
    paymentMethod: string;
    paymentProvider: string;
    email?: string;
    callbackUrl?: string;
  }) =>
    axiosInstance.post<ApiResponse<PaymentDto>>(
      `${API_PREFIX}/payments/initiate`,
      data
    ),

  confirm: (data: { transactionId: string; status: string; providerReference: string }) =>
    axiosInstance.post<ApiResponse<PaymentDto>>(
      `${API_PREFIX}/payments/confirm`,
      data
    ),

  refund: (data: { transactionId: string; amount: number; reason: string }) =>
    axiosInstance.post<ApiResponse<PaymentDto>>(
      `${API_PREFIX}/payments/refund`,
      data
    )};

// ─── Wallet API ───────────────────────────────────────────────

export const storefrontApi = {
  getStores: (q?: string) =>
    axiosInstance.get<ApiResponse<StoreDto[]>>(
      `${API_PREFIX}/storefront/stores${q ? `?q=${encodeURIComponent(q)}` : ''}`
    ),

  getStoreBySlug: (slug: string) =>
    axiosInstance.get<ApiResponse<StoreDto>>(
      `${API_PREFIX}/storefront/stores/${slug}`
    ),

  getStoreById: (id: string) =>
    axiosInstance.get<ApiResponse<StoreDto>>(
      `${API_PREFIX}/stores/${id}`
    ),

  getStoreProducts: (slug: string) =>
    axiosInstance.get<ApiResponse<ProductDto[]>>(
      `${API_PREFIX}/storefront/stores/${slug}/products`
    ),

  /** Public product detail (works for guests — used by the storefront PDP). */
  getProductById: (id: string) =>
    axiosInstance.get<ApiResponse<ProductDto>>(
      `${API_PREFIX}/storefront/products/${id}`
    ),

  getStoreCategories: (slug: string) =>
    axiosInstance.get<ApiResponse<unknown[]>>(
      `${API_PREFIX}/storefront/stores/${slug}/categories`
    ),

  search: (q: string) =>
    axiosInstance.get<ApiResponse<ProductDto[]>>(
      `${API_PREFIX}/storefront/search?q=${encodeURIComponent(q)}`
    )};