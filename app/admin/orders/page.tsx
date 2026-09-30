'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminRepository } from '@/features/admin/repositories/admin.repository';
import { LoadingState, ErrorState, EmptyState } from '@/components/dashboard/shared/StateComponents';

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Refunded', value: 'REFUNDED' },
];

const statusBadge: Record<string, string> = {
  PENDING: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
  PAID: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
  PROCESSING: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
  SHIPPED: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20',
  DELIVERED: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20',
  CANCELLED: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
  REFUNDED: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20'};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0}).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
}

interface Order {
  id: string;
  customerName: string;
  storeName: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState('');

  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'orders', selectedStatus],
    queryFn: async () => {
      const params = selectedStatus ? { status: selectedStatus } : undefined;
      const page = await adminRepository.getOrders<Order>(params);
      return page?.content ?? [];
    }});

  if (isLoading) return <LoadingState message="Loading orders..." />;
  if (error) return <ErrorState onRetry={() => refetch()} />;

  const filtered = selectedStatus
    ? (orders ?? []).filter((o) => o.status === selectedStatus)
    : (orders ?? []);

  if (!filtered.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Track and manage all platform orders</p>
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
            title={selectedStatus ? `No ${selectedStatus.toLowerCase()} orders` : 'No orders found'}
            description={selectedStatus ? 'Try a different filter.' : 'Orders will appear here when customers make purchases.'}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Track and manage all platform orders</p>
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
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Order ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Store</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Total</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order: { id: string; customerName: string; storeName: string; total: number; status: string; createdAt: string }) => (
                <tr key={order.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-4 font-mono text-xs text-gray-900 dark:text-white">#{String(order.id).slice(0, 8)}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{order.customerName}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{order.storeName}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{formatCurrency(order.total)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge[order.status] ?? 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20'}`}>
                      {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
