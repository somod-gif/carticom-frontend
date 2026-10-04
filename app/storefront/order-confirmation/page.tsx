'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Loader2, Clock } from 'lucide-react';
import { checkoutApi } from '@/features/onboarding/services/onboarding.service';
import type { OrderDto } from '@/features/onboarding/types';
import { Button } from '@/components/ui/button';
import { LoadingState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import { useCartStore } from '@/store/cart.store';
import { extractErrorMessage } from '@/lib/axios';

const PAID_STATUSES = ['PAID', 'COMPLETED'];
const DONE_PAYMENT_STATUSES = [...PAID_STATUSES, 'FAILED', 'REFUNDED'];
const DONE_ORDER_STATUSES = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

function isSettled(order: OrderDto): boolean {
  return DONE_PAYMENT_STATUSES.includes(order.paymentStatus as string) ||
    DONE_ORDER_STATUSES.includes(order.status as string);
}

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState(() => !!orderId);
  const [error, setError] = useState<string | null>(() =>
    orderId ? null : 'No order ID provided');
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    // The checkout converted the server-side cart — clear the header badge.
    useCartStore.getState().markConverted();
  }, []);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    let attempts = 0;
    let interval: ReturnType<typeof setInterval> | null = null;

    const poll = async () => {
      attempts += 1;
      try {
        const res = await checkoutApi.getOrderById(orderId);
        if (cancelled) return;
        const data = res.data?.data;
        if (data) setOrder(data);
        if ((data && isSettled(data)) || attempts >= 20) {
          if (interval) { clearInterval(interval); interval = null; }
          setSettled(true);
        }
      } catch {
        if (attempts >= 20 && interval) { clearInterval(interval); interval = null; setSettled(true); }
      }
    };

    const load = async () => {
      try {
        const res = await checkoutApi.getOrderById(orderId);
        if (cancelled) return;
        const data = res.data.data;
        if (!data) {
          setError('Order not found');
          return;
        }
        setOrder(data);
        if (isSettled(data)) {
          setSettled(true);
          return;
        }
        // Payment still settling — poll every 3s for up to 60s.
        interval = setInterval(poll, 3000);
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [orderId]);

  if (loading) return <LoadingState message="Loading order details..." />;
  if (error) return <ErrorState title="Order Error" description={error} onRetry={() => router.push('/storefront')} />;
  if (!order) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: order.currency || 'NGN', minimumFractionDigits: 2 }).format(price);

  const isPaid = PAID_STATUSES.includes(order.paymentStatus as string);
  const paymentFailed = order.paymentStatus === 'FAILED';
  const waiting = !isSettled;

  const paymentTone = isPaid
    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    : paymentFailed
      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';

  return (
    <div className="max-w-2xl mx-auto py-8 text-center space-y-8">
      <div className="flex justify-center">
        <div className={`h-20 w-20 rounded-full flex items-center justify-center ${isPaid ? 'bg-green-100 dark:bg-green-900/30' : paymentFailed ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
          {isPaid ? (
            <CheckCircle className="h-10 w-10 text-green-600" />
          ) : paymentFailed ? (
            <CheckCircle className="h-10 w-10 text-red-500" />
          ) : (
            <Clock className="h-10 w-10 text-yellow-600" />
          )}
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isPaid ? 'Payment Confirmed!' : paymentFailed ? 'Payment Failed' : 'Order Placed!'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {isPaid
            ? 'Thank you for your purchase. Your payment has been received.'
            : paymentFailed
              ? 'We could not verify your payment. You can retry from your orders page.'
              : 'Thank you for your purchase.'}
        </p>
        {waiting && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 text-xs font-medium text-yellow-700 dark:text-yellow-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Confirming your payment — this updates automatically…
          </p>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-left space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Order Number</span>
          <span className="font-semibold text-gray-900 dark:text-white">{order.orderNumber || String(order.id).slice(0, 8).toUpperCase()}</span>
        </div>
        <div className="flex justify-between text-sm items-center">
          <span className="text-gray-500">Status</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">{order.status}</span>
        </div>
        <div className="flex justify-between text-sm items-center">
          <span className="text-gray-500">Payment</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentTone}`}>{order.paymentStatus}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Total</span>
          <span className="font-bold text-gray-900 dark:text-white">{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild className="rounded-xl">
          <a href="/storefront">Continue Shopping <ArrowRight className="ml-2 h-4 w-4" /></a>
        </Button>
        {order.customerEmail && (
          <p className="text-xs text-gray-400 mt-4 sm:mt-0 sm:self-center">A confirmation email will be sent to <span className="font-medium">{order.customerEmail}</span></p>
        )}
      </div>

      {order.customerEmail && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-5 text-center space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Want to track this order?</h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Create an account with <span className="font-medium">{order.customerEmail}</span> to view order status and history.
          </p>
          <Button asChild variant="outline" className="rounded-xl text-sm">
            <a href={`/storefront/login?storeId=${encodeURIComponent(order.storeId)}&mode=register&email=${encodeURIComponent(order.customerEmail)}`}>
              Create an account
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading..." />}>
      <ConfirmationContent />
    </Suspense>
  );
}
