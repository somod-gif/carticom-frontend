'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, CreditCard, Mail, MapPin, Package, Phone, ShieldCheck, User } from 'lucide-react';
import { useOrder, useUpdateOrderStatus } from '@/features/dashboard/hooks/useOrders';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { LoadingState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import { OrderStatus } from '@/features/dashboard/types/orders.types';
import type { Address } from '@/features/dashboard/types/orders.types';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function formatStatus(value: string) {
  const words = value.toLowerCase().split('_');
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

const STATUS_OPTIONS = [
  OrderStatus.PENDING,
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
  OrderStatus.REFUNDED,
];

const STATUS_BADGES: Record<string, string> = {
  [OrderStatus.PENDING]: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
  [OrderStatus.PAID]: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
  [OrderStatus.PROCESSING]: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
  [OrderStatus.SHIPPED]: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20',
  [OrderStatus.DELIVERED]: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20',
  [OrderStatus.CANCELLED]: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
  [OrderStatus.REFUNDED]: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20',
};

const PAYMENT_BADGES: Record<string, string> = {
  PENDING: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
  PAID: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
  FAILED: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
  REFUNDED: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20',
  PARTIALLY_REFUNDED: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
};

function badgeClasses(status: string, map: Record<string, string>) {
  return map[status] ?? 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
}

function AddressBlock({ address }: { address: Address }) {
  return (
    <div>
      <p className="font-medium text-gray-900 dark:text-white">{address.fullName}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{address.phone}</p>
      <div className="text-sm text-gray-600 dark:text-gray-400 mt-3 space-y-0.5">
        <p>{address.addressLine1}</p>
        {address.addressLine2 && <p>{address.addressLine2}</p>}
        <p>{address.city}, {address.state} {address.postalCode}</p>
        <p>{address.country}</p>
      </div>
    </div>
  );
}

export default function StaffOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const user = useAuthStore((state) => state.user);
  const { data: order, isLoading, error, refetch } = useOrder(id);
  const updateOrder = useUpdateOrderStatus();

  const canUpdateOrders = user?.role === 'STAFF' || user?.role === 'BUSINESS_OWNER' || user?.role === 'VENDOR';

  const handleStatusChange = (newStatus: string) => {
    if (!order) return;
    updateOrder.mutate({ id: order.id, status: newStatus });
  };

  if (!id || isLoading) return <LoadingState message="Loading order..." />;
  if (error) return <ErrorState title="Failed to load order" onRetry={refetch} />;
  if (!order) return <ErrorState title="Order not found" onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/staff/orders"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order #{order.id.slice(0, 8)}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Placed {formatDateTime(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canUpdateOrders ? (
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updateOrder.isPending}
                className={`text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${badgeClasses(order.status, STATUS_BADGES)}`}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            ) : (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClasses(order.status, STATUS_BADGES)}`}>
                {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Information</h2>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-gray-500">Payment Status</p>
                <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${badgeClasses(order.paymentStatus, PAYMENT_BADGES)}`}>
                  {formatStatus(order.paymentStatus)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-gray-500">Payment Status</p>
                <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${badgeClasses(order.paymentStatus, PAYMENT_BADGES)}`}>
                  {formatStatus(order.paymentStatus)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer</h2>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-gray-500">Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{order.customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">{order.customerEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-gray-500">Phone</p>
                <p className="font-medium text-gray-900 dark:text-white">{order.customerPhone || 'â€”'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
          <div className="text-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900 dark:text-white">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Tax</span>
              <span className="text-gray-900 dark:text-white">{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className="text-gray-900 dark:text-white">{formatCurrency(order.shipping)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Discount</span>
                <span className="text-red-600 dark:text-red-400">-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
              <span className="font-medium text-gray-900 dark:text-white">Total</span>
              <span className="font-bold text-gray-900 dark:text-white text-lg">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-gray-400" />
          Items ({order.items.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Quantity</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Unit Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden"><Image src={item.image} alt={item.productName} fill unoptimized className="object-cover bg-gray-100 dark:bg-gray-800" /></div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-xs">N/A</div>
                      )}
                      <span className="font-medium text-gray-900 dark:text-white">{item.productName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{item.quantity}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{formatCurrency(item.price)}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-400" />
            Shipping Address
          </h2>
          <AddressBlock address={order.shippingAddress} />
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-400" />
            Billing Address
          </h2>
          <AddressBlock address={order.billingAddress} />
        </div>
      </div>

      {order.notes && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Notes</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{order.notes}</p>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-5 w-5 text-blue-500" />
          <span>Created <strong className="text-gray-900 dark:text-white">{formatDate(order.createdAt)}</strong> Â· Updated <strong className="text-gray-900 dark:text-white">{formatDate(order.updatedAt)}</strong> Â· Order ID <strong className="font-mono text-gray-900 dark:text-white">{order.id}</strong></span>
        </div>
      </div>
    </div>
  );
}