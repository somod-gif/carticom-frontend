'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { checkoutApi } from '@/features/onboarding/services/onboarding.service';
import type { OrderDto } from '@/features/onboarding/types';
import { Button } from '@/components/ui/button';
import { LoadingState, ErrorState } from '@/components/dashboard/shared/StateComponents';

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState(() => !!orderId);
  const [error, setError] = useState<string | null>(() =>
    orderId ? null : 'No order ID provided');

  useEffect(() => {
    if (!orderId) return;
    checkoutApi.getOrderById(orderId)
      .then((res) => {
        if (res.data.data) setOrder(res.data.data);
        else setError('Order not found');
      })
      .catch(() => setError('Failed to load order details'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <LoadingState message="Loading order details..." />;
  if (error) return <ErrorState title="Order Error" description={error} onRetry={() => router.push('/storefront')} />;
  if (!order) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: order.currency || 'NGN', minimumFractionDigits: 2 }).format(price);

  return (
    <div className="max-w-2xl mx-auto py-8 text-center space-y-8">
      <div className="flex justify-center">
        <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Placed!</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Thank you for your purchase.</p>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-left space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Order Number</span>
          <span className="font-semibold text-gray-900 dark:text-white">{order.orderNumber || String(order.id).slice(0, 8).toUpperCase()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Status</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">{order.status}</span>
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
