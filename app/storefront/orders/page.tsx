'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, PackageOpen, LogIn, Search } from 'lucide-react';
import { checkoutApi } from '@/features/onboarding/services/onboarding.service';
import type { OrderDto } from '@/features/onboarding/types';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Button } from '@/components/ui/button';
import { LoadingState, EmptyState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/storefront/OrderStatusBadge';
import { showToast } from '@/lib/notifications/toast';
import { extractErrorMessage } from '@/lib/axios';

function SignedOutPanel() {
  return (
    <div className="max-w-md mx-auto text-center space-y-6">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 space-y-4">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Orders</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sign in to view your order history. Placed an order as a guest? Use the
          reference from your confirmation email to track it.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/login?redirect=/storefront/orders">
              <LogIn className="h-5 w-5 mr-2" />
              Sign in
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/guest-checkout/track">
              <Search className="h-5 w-5 mr-2" />
              Track a guest order
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const [orders, setOrders] = useState<OrderDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await checkoutApi.getMyOrders();
        if (cancelled) return;
        setOrders(res.data.data ?? []);
        setError(null);
      } catch {
        if (cancelled) return;
        setError('Failed to load your orders. Please try again.');
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isAuthenticated, retryKey]);

  const handleCancel = async (order: OrderDto) => {
    setCancellingId(order.id);
    try {
      await checkoutApi.cancelOrder(order.id);
      showToast('success', 'Order cancelled.');
      setConfirmingId(null);
      setRetryKey((k) => k + 1);
    } catch (err) {
      showToast('error', extractErrorMessage(err) || 'Failed to cancel this order. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  if (authLoading) return <LoadingState message="Checking your account..." />;
  if (!isAuthenticated) return <SignedOutPanel />;
  if (error) return <ErrorState title="Error loading orders" description={error} onRetry={() => setRetryKey((k) => k + 1)} />;
  if (!orders) return <LoadingState message="Loading your orders..." />;
  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto">
        <EmptyState
          title="No orders yet"
          description="When you place an order, it will appear here so you can track its status."
          icon={PackageOpen}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Orders</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Track the status of the orders you&apos;ve placed across stores.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-4 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-sm transition-all"
          >
            <Link
              href={`/storefront/orders/${order.id}`}
              className="block space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <OrderStatusBadge status={order.status} />
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {order.deliveryAddress || order.customerEmail || 'Delivery details pending'}
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: order.currency || 'NGN',
                    minimumFractionDigits: 2,
                  }).format(order.total)}
                </p>
              </div>
            </Link>

            {/* Only orders still waiting for the seller can be cancelled —
                the seller hasn't started preparing them yet. */}
            {order.status === 'PENDING' && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                {confirmingId === order.id ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Cancel this order? The seller hasn&apos;t started preparing it yet.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmingId(null)}
                        disabled={cancellingId === order.id}
                      >
                        Keep order
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancel(order)}
                        disabled={cancellingId === order.id}
                      >
                        {cancellingId === order.id ? 'Cancelling...' : 'Yes, cancel order'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmingId(order.id)}
                    >
                      Cancel order
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
