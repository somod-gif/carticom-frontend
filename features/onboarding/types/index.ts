// ============================================================
// CARTICOM ONBOARDING — Type Definitions (aligned with backend)
// ============================================================

// ─── Store ────────────────────────────────────────────────────

export type StoreStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CLOSED';

export interface StoreDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  ownerId: string;
  status: StoreStatus;
  currency: string;
  country: string;
  timezone: string;
  commissionRate?: number;
  tenantId: string;
  template?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  whatsappNumber?: string;
  seoTitle?: string;
  seoDescription?: string;
  customCss?: string;
  phone?: string;
  email?: string;
  address?: string;
  businessCategory?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Store Payment Config (merchant-connect) ─────────────────

export interface StorePaymentConfigDto {
  storeId: string;
  virtualAccountNumber?: string;
  virtualAccountName?: string;
  virtualBankName?: string;
  virtualAccountProvider?: string;
  paystackConnected: boolean;
  flutterwaveConnected: boolean;
  activeProvider?: string;
  paystackPublicKeyMasked?: string;
  connectedAt?: string;
}

export interface SavePaymentCredentialsDto {
  paystackSecretKey?: string;
  paystackPublicKey?: string;
  flutterwaveSecretKey?: string;
  flutterwaveVerifyHash?: string;
  activeProvider?: string;
}

export interface StoreDirectoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  businessCategory?: string;
  country?: string;
  productCount: number;
}

export interface CreateStoreDto {
  storeName: string;
  storeSlug: string;
  phone: string;
  description?: string;
  businessCategory?: string;
  email?: string;
  address?: string;
  country?: string;
  currency?: string;
}

export interface UpdateStoreDto {
  storeName?: string;
  storeSlug?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  country?: string;
  currency?: string;
  timezone?: string;
  businessCategory?: string;
  template?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  seoTitle?: string;
  seoDescription?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  whatsappNumber?: string;
  customCss?: string;
}

// ─── Product ──────────────────────────────────────────────────

export interface ProductDto {
  id: string;
  storeId: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  quantity: number;
  sku?: string;
  imageUrl?: string;
  images?: string;
  active: boolean;
  digital: boolean;
  categoryId?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  storeId: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  currency?: string;
  quantity: number;
  sku?: string;
  imageUrl?: string;
  active?: boolean;
  digital?: boolean;
}

// ─── Wallet ───────────────────────────────────────────────────

export interface WalletDto {
  id: string;
  ownerId: string;
  balance: number;
  ledgerBalance: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Order (for checkout) ─────────────────────────────────────

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderDto {
  id: string;
  storeId: string;
  customerId: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  paymentStatus: 'PENDING' | 'PROCESSING' | 'PAID' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  deliveryAddress?: string;
  customerEmail?: string;
  customerPhoneNumber?: string;
  notes?: string;
  completedAt?: number;
  releaseAt?: number;
  items?: OrderItemDto[];
  createdAt: string;
  updatedAt: string;
}

// ─── Payment ──────────────────────────────────────────────────

export interface PaymentDto {
  id: string;
  storeId: string;
  orderId: string;
  transactionId: string;
  providerReference?: string;
  authorizationUrl?: string;
  message?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED';
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentProvider: string;
  confirmedAt?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Cart ─────────────────────────────────────────────────────

export interface CartDto {
  id: string;
  storeId: string;
  customerId: string;
  status: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  items: CartItemDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItemDto {
  id: string;
  cartId: string;
  productId: string;
  productName?: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  variantId?: string;
  variantName?: string;
  variantValue?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Subscription (not yet documented in backend) ────────────

export interface SubscriptionPlanDto {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  features: Record<string, unknown>;
  active: boolean;
}

export interface SubscriptionDto {
  id: string;
  storeId: string;
  planId?: string;
  planName?: string;
  status: 'ACTIVE' | 'PENDING' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';
  startDate?: number;
  endDate?: number;
  renewalDate?: number;
  amount: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  autoRenewal: boolean;
  features: Record<string, unknown>;
}

export interface CreateSubscriptionDto {
  planId: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  autoRenewal?: boolean;
}

// ─── Staff (not yet documented in backend) ───────────────────

export interface InviteStaffDto {
  email: string;
  role?: string;
  permissions?: string[];
}

export interface StaffMemberDto {
  id: string;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
  invitedAt: string;
}

// ─── AI (not yet documented in backend) ──────────────────────

export interface AIStatusDto {
  enabled: boolean;
  status: 'ACTIVE' | 'DISABLED' | 'PENDING';
  whatsappConnected: boolean;
  whatsappNumber?: string;
}

// ─── Analytics (not yet documented in backend) ───────────────

export interface DashboardStatsDto {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  subscriptionStatus: string;
  storeStatus: string;
  aiEnabled: boolean;
}

export interface RevenueAnalyticsDto {
  period: string;
  amount: number;
  growth: number;
  data: Array<{ date: string; amount: number }>;
}

export interface OrderAnalyticsDto {
  period: string;
  total: number;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
  data: Array<{ date: string; count: number; status: string }>;
}
