'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Package, LogIn, MapPin, Mail, Phone, CreditCard } from 'lucide-react';
import { checkoutApi } from '@/features/onboarding/services/onboarding.service';
import type { OrderDto } from '@/features/onboarding/types';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useOrderReturns, useRequestReturn } from '@/features/storefront/hooks/useReturns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LoadingState, EmptyState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/storefront/OrderStatusBadge';
import { showToast } from '@/lib/notifications/toast';
import { extractErrorMessage } from '@/lib/axios';

const RETURN_STATUS_DEFAULT = {
  label: 'Being reviewed',
  copy: "Return requested — we'll be in touch. We'll review it within 2 business days and let you know the outcome.",
};

/** Plain-language wording for each step of a return, so nobody has to
 *  decode backend status codes. */
const RETURN_STATUS_COPY: Record<string, { label: string; copy: string }> = {
  REQUESTED: RETURN_STATUS_DEFAULT,
  APPROVED: {
    label: 'Approved',
    copy: 'Good news — your return was approved. The seller will be in touch about the next steps.',
  },
  REJECTED: {
    label: 'Rejected',
    copy: "Sorry — this return wasn't approved. If you think that's a mistake, the seller's contact details are in your order confirmation email.",
  },
  REFUNDED: {
    label: 'Refunded',
    copy: 'Your refund is on its way. Depending on your bank, it can take a few days to show up.',
  },
};

function formatPrice(order: OrderDto, value: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: order.currency || 'NGN',
    minimumFractionDigits: 2,
  }).format(value || 0);
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const {
    data: returns = [],
    isLoading: returnsLoading,
    error: returnsError,
  } = useOrderReturns(orderId, isAuthenticated && order?.status === 'DELIVERED');
  const requestReturn = useRequestReturn(orderId);

  useEffect(() => {
    if (!isAuthenticated || !orderId) return;
    let cancelled = false;
    checkoutApi.getOrderById(orderId)
      .then((res) => {
        if (cancelled) return;
        if (res.data.data) setOrder(res.data.data);
        else setError('Order not found');
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = extractErrorMessage(err);
        setError(msg || 'Failed to load order details. Please try again.');
      });
    return () => { cancelled = true; };
  }, [isAuthenticated, orderId]);

  const handleCancel = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const res = await checkoutApi.cancelOrder(order.id);
      if (res.data.data) setOrder(res.data.data);
      showToast('success', 'Order cancelled.');
      setConfirmCancel(false);
    } catch (err) {
      showToast('error', extractErrorMessage(err) || 'Failed to cancel order. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const handleRequestReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const reason = returnReason.trim();
    if (!reason) {
      showToast('error', "Please tell us what's wrong with your order.");
      return;
    }
    requestReturn.mutate(reason, {
      onSuccess: () => {
        showToast('success', "Return requested — we'll be in touch.");
        setReturnReason('');
        setShowReturnForm(false);
      },
      onError: (err) => {
        showToast('error', extractErrorMessage(err) || "We couldn't send your return request. Please try again.");
      },
    });
  };

  if (authLoading) return <LoadingState message="Checking your account..." />;
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order Details</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sign in to view the full details of this order.
          </p>
          <Button asChild size="lg" className="w-full">
            <Link href={`/login?redirect=/storefront/orders/${orderId}`}>
              <LogIn className="h-5 w-5 mr-2" />
              Sign in
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <ErrorState
        title="Error loading order"
        description={error}
        onRetry={() => window.location.reload()}
      />
    );
  }
  if (!order) return <LoadingState message="Loading order details..." />;

  // Only orders still waiting for the seller can be cancelled.
  const cancellable = order.status === 'PENDING';
  // An open request (still being reviewed) wins over any older, resolved one.
  const openReturn = returns.find((r) => r.status === 'REQUESTED') || null;
  const latestReturn = openReturn || returns[0] || null;
  const returnStatus = latestReturn
    ? RETURN_STATUS_COPY[latestReturn.status] || RETURN_STATUS_DEFAULT
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/storefront/orders"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Order Number</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{order.orderNumber}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
            <span className="inline-flex items-center gap-1.5">
              <CreditCard className="h-4 w-4" />
              Placed {new Date(order.createdAt).toLocaleString('en-NG')}
            </span>
            {order.customerEmail && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                {order.customerEmail}
              </span>
            )}
            {order.customerPhoneNumber && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                {order.customerPhoneNumber}
              </span>
            )}
          </div>
        </div>
      </div>

      {order.items && order.items.length > 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Items</h2>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                {item.productImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="h-14 w-14 rounded-lg object-cover border border-gray-100 dark:border-gray-800"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.productName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.quantity} x {formatPrice(order, item.unitPrice)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatPrice(order, item.lineTotal)}
                </p>
              </li>
            ))}
          </ul>

          <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatPrice(order, order.subtotal)}</span>
            </div>
            {order.shipping > 0 && (
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Shipping</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatPrice(order, order.shipping)}</span>
              </div>
            )}
            {order.tax > 0 && (
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Tax</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatPrice(order, order.tax)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Discount</span>
                <span className="font-medium text-green-600 dark:text-green-400">-{formatPrice(order, order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-2">
              <span className="font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="font-bold text-gray-900 dark:text-white">{formatPrice(order, order.total)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <EmptyState
            title="No items to display"
            description="This order does not have any line items available."
          />
        </div>
      )}

      {(order.deliveryAddress || order.notes) && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-white">Delivery</h2>
          {order.deliveryAddress && (
            <p className="text-sm text-gray-600 dark:text-gray-300 inline-flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
              {order.deliveryAddress}
            </p>
          )}
          {order.notes && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Note: {order.notes}</p>
          )}
        </div>
      )}

      {cancellable && (
        <div className="flex justify-end">
          {confirmCancel ? (
            <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Cancel this order?</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                The seller hasn&apos;t started preparing it yet, so it can still be cancelled.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setConfirmCancel(false)} disabled={cancelling}>
                  Keep order
                </Button>
                <Button variant="destructive" size="sm" onClick={handleCancel} disabled={cancelling}>
                  {cancelling ? 'Cancelling...' : 'Yes, cancel order'}
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="destructive" onClick={() => setConfirmCancel(true)}>
              Cancel order
            </Button>
          )}
        </div>
      )}

      {/* Returns — request a return on a delivered order, or follow the
          status of one that's already been filed. */}
      {order.status === 'DELIVERED' && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-white">Returns</h2>

          {returnsLoading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Checking your return requests...
            </p>
          ) : returnsError ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We couldn&apos;t load your return requests. Refresh the page and try again.
            </p>
          ) : showReturnForm ? (
            <form onSubmit={handleRequestReturn} className="space-y-3">
              <div>
                <label
                  htmlFor="return-reason"
                  className="block text-sm font-medium text-gray-900 dark:text-white mb-1.5"
                >
                  What went wrong?
                </label>
                <Textarea
                  id="return-reason"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="Tell us what went wrong with your order..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  Tell us what&apos;s wrong — we&apos;ll review it within 2 business days.
                </p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {returnReason.length}/1000 characters
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowReturnForm(false);
                      setReturnReason('');
                    }}
                    disabled={requestReturn.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={requestReturn.isPending || !returnReason.trim()}
                  >
                    {requestReturn.isPending ? 'Sending...' : 'Send request'}
                  </Button>
                </div>
              </div>
            </form>
          ) : latestReturn && returnStatus ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-4 space-y-1.5">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {returnStatus.label}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{returnStatus.copy}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  You said: &quot;{latestReturn.reason}&quot;
                </p>
              </div>
              {!openReturn && (
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setShowReturnForm(true)}>
                    Request a return
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Something not right with this order? Request a return and we&apos;ll take a look.
              </p>
              <div className="flex justify-end">
                <Button onClick={() => setShowReturnForm(true)}>Request a return</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
