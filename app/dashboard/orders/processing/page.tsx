'use client';

import { useCurrentStoreId } from '@/hooks/useCurrentStore';
import { useOrdersByStatus } from '@/features/dashboard/hooks/useOrders';
import { LoadingState, EmptyState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import { OrderStatus } from '@/features/dashboard/types/orders.types';
import type { OrderDto } from '@/features/dashboard/types/orders.types';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ProcessingOrdersPage() {
  const { storeId } = useCurrentStoreId();
  const { data: orders, isLoading, error, refetch } = useOrdersByStatus(storeId ?? '', OrderStatus.PROCESSING);

  if (!storeId || isLoading) return <LoadingState message="Loading processing orders..." />;
  if (error) return <ErrorState title="Failed to load processing orders" onRetry={refetch} />;
  if (!orders?.length) return <EmptyState title="No processing orders" description="Orders being processed will appear here." />;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Processing Orders</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track orders currently being processed.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Order</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Items</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Total</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: OrderDto) => (
                <tr key={order.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-4 font-mono text-xs text-gray-900 dark:text-white">#{String(order.id).slice(0, 8)}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{order.customerName}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{order.items.length}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{formatCurrency(order.total)}</td>
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
