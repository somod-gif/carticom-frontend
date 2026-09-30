'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCurrentStoreId } from '@/hooks/useCurrentStore';
import { useOrders, useUpdateOrderStatus } from '@/features/dashboard/hooks/useOrders';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { LoadingState, EmptyState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import { OrderStatus } from '@/features/dashboard/types/orders.types';
import type { OrderDto } from '@/features/dashboard/types/orders.types';
import { motion } from 'framer-motion';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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

export default function StaffOrdersPage() {
  const { storeId } = useCurrentStoreId();
  const user = useAuthStore(state => state.user);
  const [selectedStatus, setSelectedStatus] = useState('');

  const { data: orders, isLoading, error, refetch } = useOrders(storeId ?? '', {
    page: 0,
    limit: 50,
    status: selectedStatus || undefined});

  const updateOrder = useUpdateOrderStatus();

  const canUpdateOrders = user?.role === 'STAFF' || user?.role === 'BUSINESS_OWNER' || user?.role === 'VENDOR';

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrder.mutate({ id: orderId, status: newStatus });
  };

  if (!storeId || isLoading) return <LoadingState message="Loading orders..." />;
  if (error) return <ErrorState title="Failed to load orders" onRetry={refetch} />;
  if (!orders?.length) return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage customer orders</p>
      </div>
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex gap-2 mb-4 flex-wrap">
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
        <EmptyState
          title={selectedStatus ? `No ${selectedStatus.toLowerCase()} orders` : 'No orders yet'}
          description={selectedStatus ? 'Try a different filter.' : 'Orders will appear here when customers make purchases.'}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage customer orders</p>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex gap-2 mb-4 flex-wrap">
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Order</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Items</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Total</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: OrderDto, idx: number) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="py-3 px-4">
                    <Link
                      href={`/staff/orders/${order.id}`}
                      className="font-mono text-xs text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                    >
                      #{order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{order.customerName}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{order.items.length}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{formatCurrency(order.total)}</td>
                  <td className="py-3 px-4">
                    {canUpdateOrders ? (
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updateOrder.isPending}
                        className={`text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusBadgeClasses(order.status)}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0) + s.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClasses(order.status)}`}>
                        {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
