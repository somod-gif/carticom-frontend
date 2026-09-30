'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Barcode, Boxes, Calendar, Hash, Package, Tag } from 'lucide-react';
import { useProduct, useUpdateProduct } from '@/features/dashboard/hooks/useProducts';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { LoadingState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import { ProductStatus } from '@/features/dashboard/types/products.types';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const STATUS_OPTIONS = [
  ProductStatus.ACTIVE,
  ProductStatus.DRAFT,
  ProductStatus.ARCHIVED,
  ProductStatus.OUT_OF_STOCK,
];

function statusBadgeClasses(status: ProductStatus) {
  const map: Record<string, string> = {
    [ProductStatus.ACTIVE]: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
    [ProductStatus.DRAFT]: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20',
    [ProductStatus.ARCHIVED]: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
    [ProductStatus.OUT_OF_STOCK]: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'};
  return map[status] ?? 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
}

function formatStatusLabel(status: ProductStatus) {
  return status === ProductStatus.OUT_OF_STOCK ? 'Out of Stock' : status.charAt(0) + status.slice(1).toLowerCase();
}

export default function StaffProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const user = useAuthStore((state) => state.user);
  const { data: product, isLoading, error, refetch } = useProduct(id);
  const updateProduct = useUpdateProduct();

  const canManageProducts = user?.role === 'STAFF' || user?.role === 'BUSINESS_OWNER' || user?.role === 'VENDOR';

  const handleStatusChange = (newStatus: string) => {
    if (!product) return;
    updateProduct.mutate({ id: product.id, data: { status: newStatus as ProductStatus } });
  };

  if (!id || isLoading) return <LoadingState message="Loading product..." />;
  if (error) return <ErrorState title="Failed to load product" onRetry={refetch} />;
  if (!product) return <ErrorState title="Product not found" onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/staff/products"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {product.images?.[0] ? (
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden"><Image src={product.images[0]} alt={product.name} fill unoptimized className="object-cover bg-gray-100 dark:bg-gray-800" /></div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                <Package className="h-6 w-6" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {product.categoryName ? `${product.categoryName} Â· ` : ''}Added {formatDate(product.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canManageProducts ? (
              <select
                value={product.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updateProduct.isPending}
                className={`text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusBadgeClasses(product.status)}`}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {formatStatusLabel(s)}
                  </option>
                ))}
              </select>
            ) : (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClasses(product.status)}`}>
                {formatStatusLabel(product.status)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-gray-400" />
          Description
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{product.description || 'â€”'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pricing</h2>
          <div className="text-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Price</span>
              <span className="font-bold text-lg text-gray-900 dark:text-white">{formatCurrency(product.price)}</span>
            </div>
            {product.compareAtPrice != null && product.compareAtPrice > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Compare At</span>
                <span className="text-gray-600 dark:text-gray-400 line-through">{formatCurrency(product.compareAtPrice)}</span>
              </div>
            )}
            {product.cost != null && product.cost > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Cost</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(product.cost)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Boxes className="h-5 w-5 text-gray-400" />
            Inventory
          </h2>
          <div className="text-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Quantity</span>
              <span className={`font-medium ${product.inventory.quantity <= 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                {product.inventory.quantity}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Track Quantity</span>
              <span className="text-gray-900 dark:text-white">{product.inventory.trackQuantity ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Allow Backorder</span>
              <span className="text-gray-900 dark:text-white">{product.inventory.allowBackorder ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Low Stock Threshold</span>
              <span className="text-gray-900 dark:text-white">{product.inventory.lowStockThreshold}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5 text-gray-400" />
            Details
          </h2>
          <div className="text-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">SKU</span>
              <span className="font-mono text-xs text-gray-900 dark:text-white">{product.sku || 'â€”'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Barcode</span>
              <span className="font-mono text-xs text-gray-900 dark:text-white">{product.barcode || 'â€”'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Category</span>
              <span className="text-gray-900 dark:text-white">{product.categoryName || 'â€”'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Slug</span>
              <span className="font-mono text-xs text-gray-900 dark:text-white">{product.slug}</span>
            </div>
          </div>
        </div>
      </div>

      {product.tags.length > 0 && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Hash className="h-5 w-5 text-gray-400" />
            Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Barcode className="h-5 w-5 text-blue-500" />
          <span>Created <strong className="text-gray-900 dark:text-white">{formatDate(product.createdAt)}</strong> Â· Updated <strong className="text-gray-900 dark:text-white">{formatDate(product.updatedAt)}</strong> Â· Product ID <strong className="font-mono text-gray-900 dark:text-white">{product.id}</strong></span>
        </div>
      </div>
    </div>
  );
}