'use client';

import { useCurrentStoreId } from '@/hooks/useCurrentStore';
import Link from 'next/link';
import Image from 'next/image';
import { useProductsByStore, useUpdateProduct } from '@/features/dashboard/hooks/useProducts';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { LoadingState, EmptyState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import { ProductStatus } from '@/features/dashboard/types/products.types';
import type { ProductDto } from '@/features/dashboard/types/products.types';
import { motion } from 'framer-motion';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
}

function statusBadgeClasses(status: ProductStatus) {
  const map: Record<string, string> = {
    [ProductStatus.ACTIVE]: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
    [ProductStatus.DRAFT]: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20',
    [ProductStatus.ARCHIVED]: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
    [ProductStatus.OUT_OF_STOCK]: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'};
  return map[status] ?? 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
}

const STATUS_OPTIONS = [
  ProductStatus.ACTIVE,
  ProductStatus.DRAFT,
  ProductStatus.ARCHIVED,
  ProductStatus.OUT_OF_STOCK,
];

export default function StaffProductsPage() {
  const { storeId } = useCurrentStoreId();
  const user = useAuthStore(state => state.user);
  const { data: products, isLoading, error, refetch } = useProductsByStore(storeId ?? '');
  const updateProduct = useUpdateProduct();

  const canManageProducts = user?.role === 'STAFF' || user?.role === 'BUSINESS_OWNER' || user?.role === 'VENDOR';

  const handleStatusChange = (productId: string, newStatus: string) => {
    updateProduct.mutate({ id: productId, data: { status: newStatus as ProductStatus } });
  };

  if (!storeId || isLoading) return <LoadingState message="Loading products..." />;
  if (error) return <ErrorState title="Failed to load products" onRetry={refetch} />;
  if (!products?.length) return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Browse the product catalog</p>
      </div>
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <EmptyState
          title="No products yet"
          description="Products will appear here once added by the store owner."
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Browse the product catalog</p>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Inventory</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: ProductDto, idx: number) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden"><Image src={product.images[0]} alt={product.name} fill unoptimized className="object-cover bg-gray-100 dark:bg-gray-800" /></div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-xs">N/A</div>
                      )}
                      <div>
                        <p className="font-medium">
                          <Link
                            href={`/staff/products/${product.id}`}
                            className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                          >
                            {product.name}
                          </Link>
                        </p>
                        {product.categoryName && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{product.categoryName}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{formatCurrency(product.price)}</td>
                  <td className="py-3 px-4">
                    {canManageProducts ? (
                      <select
                        value={product.status}
                        onChange={(e) => handleStatusChange(product.id, e.target.value)}
                        disabled={updateProduct.isPending}
                        className={`text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusBadgeClasses(product.status)}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s === ProductStatus.OUT_OF_STOCK ? 'Out of Stock' : s.charAt(0) + s.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClasses(product.status)}`}>
                        {product.status === ProductStatus.OUT_OF_STOCK ? 'Out of Stock' : product.status.charAt(0) + product.status.slice(1).toLowerCase()}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{product.inventory.quantity}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
