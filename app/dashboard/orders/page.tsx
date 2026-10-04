'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';
import { useCurrentStoreId } from '@/hooks/useCurrentStore';
import { useOrders, useUpdateOrderStatus } from '@/features/dashboard/hooks/useOrders';
import { LoadingState, EmptyState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import { OrderStatus } from '@/features/dashboard/types/orders.types';
import type { OrderDto } from '@/features/dashboard/types/orders.types';
import { ViewToggle, useViewPreference } from '@/components/dashboard/ViewToggle';

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: OrderStatus.PENDING },
  { label: 'Paid', value: OrderStatus.PAID },
  { label: 'Processing', value: OrderStatus.PROCESSING },
  { label: 'Shipped', value: OrderStatus.SHIPPED },
  { label: 'Delivered', value: OrderStatus.DELIVERED },
  { label: 'Cancelled', value: OrderStatus.CANCELLED },
  { label: 'Refunded', value: OrderStatus.REFUNDED },
];

// Statuses the backend OrderStatus enum accepts (PAID is payment-side only).
const ORDER_STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function statusBadgeClasses(status: OrderStatus) {
  const map: Record<string, string> = {
    [OrderStatus.PENDING]: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
    [OrderStatus.PAID]: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
    [OrderStatus.PROCESSING]: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
    [OrderStatus.SHIPPED]: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20',
    [OrderStatus.DELIVERED]: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20',
    [OrderStatus.CANCELLED]: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
    [OrderStatus.REFUNDED]: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20'};
  return map[status] ?? 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
}

export default function OrdersPage() {
  const { storeId } = useCurrentStoreId();
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [view, setView] = useViewPreference();
  const updateStatus = useUpdateOrderStatus();
  const { data: orders, isLoading, error, refetch } = useOrders(storeId ?? '', {
    page: 0,
    limit: 20,
    status: selectedStatus || undefined});

  const statusSelect = (order: OrderDto) => (
    <select
      value={order.status}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => updateStatus.mutate({ id: String(order.id), status: e.target.value })}
      className="h-9 px-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
      aria-label="Order status"
    >
      {ORDER_STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
      ))}
    </select>
  );

  const filterRow = (
    <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSelectedStatus(filter.value)}
            className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${
              selectedStatus === filter.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <ViewToggle view={view} onChange={setView} />
    </div>
  );

  if (!storeId || isLoading) return <LoadingState message="Loading orders..." />;
  if (error) return <ErrorState title="Failed to load orders" onRetry={refetch} />;
  if (!orders?.length) return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage and track all orders</p>
      </div>
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        {filterRow}
        <EmptyState
          title={selectedStatus ? `No ${selectedStatus.toLowerCase()} orders` : 'No orders yet'}
          description={selectedStatus ? 'Try a different filter.' : 'Orders will appear here when customers make purchases.'}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage and track all orders</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        {filterRow}

        {view === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {orders.map((order: OrderDto) => (
              <div
                key={order.id}
                onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-shadow cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-gray-900 dark:text-white">#{String(order.id).slice(0, 8)}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClasses(order.status)}`}>
                    {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium text-gray-900 dark:text-white">{order.customerName || 'Guest'}</p>
                  <p>{order.items.length} {order.items.length === 1 ? 'item' : 'items'} · {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(order.total)}</span>
                  <div className="flex items-center gap-2">
                    {statusSelect(order)}
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Eye className="h-4 w-4" /> View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Order</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Items</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Update</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Date</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: OrderDto) => (
                  <tr
                    key={order.id}
                    onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono text-xs text-gray-900 dark:text-white">#{String(order.id).slice(0, 8)}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{order.customerName || 'Guest'}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{order.items.length}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{formatCurrency(order.total)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClasses(order.status)}`}>
                        {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">{statusSelect(order)}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 inline-flex text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View order"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
