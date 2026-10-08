'use client';

import { cn } from '@/lib/utils';

/**
 * Plain-language order status labels for storefront customers.
 * The backend sends these status codes — customers shouldn't see them raw.
 */
export function formatOrderStatus(status?: string | null): string {
  switch (status) {
    case 'PENDING':
      return 'Waiting for seller';
    case 'PROCESSING':
      return 'Being prepared';
    case 'SHIPPED':
      return 'On its way';
    case 'DELIVERED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status ?? 'Unknown';
  }
}

/** Plain-language payment status labels for storefront customers. */
export function formatPaymentStatus(status?: string | null): string {
  switch (status) {
    case 'PENDING':
      return 'Payment pending';
    case 'PROCESSING':
      return 'Payment processing';
    case 'PAID':
    case 'COMPLETED':
      return 'Paid';
    case 'FAILED':
      return 'Payment failed';
    case 'REFUNDED':
      return 'Refunded';
    default:
      return status ?? 'Unknown';
  }
}

const ORDER_STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
  FAILED: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  REFUNDED: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'};

export function OrderStatusBadge({
  status,
  className}: {
  status?: string | null;
  className?: string;
}) {
  if (!status) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        ORDER_STATUS_STYLES[status],
        className)}
    >
      {formatOrderStatus(status)}
    </span>
  );
}

export function PaymentStatusBadge({
  status,
  className}: {
  status?: string | null;
  className?: string;
}) {
  if (!status) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        PAYMENT_STATUS_STYLES[status],
        className)}
    >
      {formatPaymentStatus(status)}
    </span>
  );
}
