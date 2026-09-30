'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useCurrentStoreId } from '@/hooks/useCurrentStore';
import type { OrderDto } from '@/features/dashboard/types/orders.types';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function statusColor(status: string) {
  const map: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-indigo-100 text-indigo-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const storeId = useCurrentStoreId();

  const { data: order, isLoading, error } = useQuery<OrderDto>({
    queryKey: ['order', storeId, orderId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/v1/orders/${orderId}`);
      return res.data.data;
    },
    enabled: !!storeId && !!orderId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Order not found</h2>
        <p className="text-gray-600 mb-4">The order could not be loaded.</p>
        <Link href="/dashboard/orders" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/orders" className="text-sm text-blue-600 hover:underline mb-1 inline-block">&larr; Back to Orders</Link>
          <h1 className="text-2xl font-bold text-gray-900">Order {order.id.slice(0, 8)}</h1>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500 mb-1">Customer</p>
          <p className="font-medium">{order.customerName || 'Guest'}</p>
          <p className="text-sm text-gray-600">{order.customerEmail}</p>
          {order.customerPhone && <p className="text-sm text-gray-600">{order.customerPhone}</p>}
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500 mb-1">Payment</p>
          <p className="font-medium">{order.paymentStatus}</p>
          <p className="text-sm text-gray-600">Total: {formatCurrency(order.total)}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500 mb-1">Shipping</p>
          {order.shippingAddress ? (
            <>
              <p className="text-sm">{order.shippingAddress.addressLine1}</p>
              <p className="text-sm">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
              <p className="text-sm">{order.shippingAddress.country}</p>
            </>
          ) : (
            <p className="text-sm text-gray-400">No shipping address</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900">Order Items</h2>
        </div>
        <div className="divide-y">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4">
              {item.image && <img src={item.image} alt={item.productName} className="w-12 h-12 rounded object-cover" />}
              <div className="flex-1">
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity} &times; {formatCurrency(item.price)}</p>
              </div>
              <p className="font-medium">{formatCurrency(item.total)}</p>
            </div>
          ))}
        </div>
        <div className="p-4 border-t space-y-2">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Shipping</span><span>{formatCurrency(order.shipping)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Tax</span><span>{formatCurrency(order.tax)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Discount</span><span className="text-red-600">-{formatCurrency(order.discount)}</span></div>}
          <div className="flex justify-between font-semibold text-lg border-t pt-2"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
        </div>
      </div>

      {order.notes && (
        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-gray-900 mb-2">Notes</h2>
          <p className="text-gray-600">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
