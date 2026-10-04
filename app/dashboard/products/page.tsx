'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCurrentStoreId } from '@/hooks/useCurrentStore';
import { useProductsByStore, useDeleteProduct, useCreateProduct } from '@/features/dashboard/hooks/useProducts';
import { LoadingState, EmptyState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import { ProductStatus } from '@/features/dashboard/types/products.types';
import type { ProductDto } from '@/features/dashboard/types/products.types';
import { ViewToggle, useViewPreference } from '@/components/dashboard/ViewToggle';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2, Download, Share2, Eye } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  quantity: z.number().int().nonnegative('Quantity must be 0 or more')});

type ProductFormData = z.infer<typeof productSchema>;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function statusBadgeClasses(status: ProductStatus) {
  const map: Record<string, string> = {
    [ProductStatus.ACTIVE]: 'text-green-600 bg-green-50',
    [ProductStatus.DRAFT]: 'text-gray-600 bg-gray-50',
    [ProductStatus.ARCHIVED]: 'text-yellow-600 bg-yellow-50',
    [ProductStatus.OUT_OF_STOCK]: 'text-red-600 bg-red-50'};
  return map[status] ?? 'text-gray-600 bg-gray-50';
}

function exportProductsCsv(products: ProductDto[]) {
  const headers = ['Name', 'SKU', 'Price', 'Status', 'Inventory', 'Category', 'Created'];
  const rows = products.map(p => [
    p.name,
    p.sku || '',
    p.price?.toString() || '0',
    p.status,
    p.inventory?.quantity?.toString() || '',
    p.categoryName || '',
    p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'products.csv'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

function shareOnWhatsApp(product: ProductDto, storeSlug?: string) {
  const url = storeSlug ? `${window.location.origin}/store/${storeSlug}/product/${product.id}` : '';
  const text = `Check out ${product.name} — ${formatCurrency(product.price)}${url ? `\n${url}` : ''}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

export default function ProductsPage() {
  const { storeId } = useCurrentStoreId();
  const { data: products, isLoading, error, refetch } = useProductsByStore(storeId ?? '');
  const deleteProduct = useDeleteProduct();
  const createProduct = useCreateProduct();
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [view, setView] = useViewPreference();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }} = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', description: '', price: 0, quantity: 0 }});

  const onSubmit = useCallback(async (data: ProductFormData) => {
    if (!storeId) return;
    setFormError(null);
    try {
      await createProduct.mutateAsync({
        name: data.name,
        description: data.description ?? '',
        price: data.price,
        quantity: data.quantity,
        inventory: { quantity: data.quantity, trackQuantity: true, allowBackorder: false }});
      reset();
      setShowForm(false);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create product');
    }
  }, [storeId, createProduct, reset, refetch]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct.mutateAsync(id);
      refetch();
    } catch {
      // handled by hook
    }
  }, [deleteProduct, refetch]);

  if (!storeId || isLoading) return <LoadingState message="Loading products..." />;
  if (error) return <ErrorState title="Failed to load products" onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Manage your product catalog</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {products && products.length > 0 && (
            <button
              onClick={() => exportProductsCsv(products)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          )}
          {products && products.length > 0 && (
            <ViewToggle view={view} onChange={setView} />
          )}
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">New Product</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            {formError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input {...register('name')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea {...register('description')} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input type="number" {...register('quantity', { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                  {isSubmitting ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!products?.length ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <EmptyState title="No products yet" description="Create your first product to start selling." />
        </div>
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product: ProductDto) => (
            <div key={product.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <Link href={`/dashboard/products/${product.id}`} className="block relative aspect-[4/3] bg-gray-100">
                {product.images?.[0] ? (
                  <Image src={product.images[0]} alt={product.name} fill unoptimized className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                )}
              </Link>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <Link href={`/dashboard/products/${product.id}`}>
                  <p className="font-medium text-gray-900 line-clamp-1 hover:text-blue-600">{product.name}</p>
                </Link>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-gray-900">{formatCurrency(product.price)}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClasses(product.status)}`}>
                    {product.status === ProductStatus.OUT_OF_STOCK ? 'Out of Stock' : product.status.charAt(0) + product.status.slice(1).toLowerCase()}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Stock: {product.inventory?.quantity ?? '—'} · {formatDate(product.createdAt)}</p>
                <div className="flex items-center gap-2 mt-auto pt-2">
                  <Link
                    href={`/dashboard/products/${product.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" /> View
                  </Link>
                  <button
                    onClick={() => shareOnWhatsApp(product)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Share on WhatsApp"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete product"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">SKU</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Inventory</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Created</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product: ProductDto) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Link href={`/dashboard/products/${product.id}`} className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                          {product.images?.[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill unoptimized className="object-cover bg-gray-100" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">N/A</div>
                          )}
                        </Link>
                        <div>
                          <Link href={`/dashboard/products/${product.id}`} className="font-medium text-gray-900 hover:text-blue-600">{product.name}</Link>
                          {product.categoryName && <p className="text-xs text-gray-500">{product.categoryName}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-xs">{product.sku || '—'}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">{formatCurrency(product.price)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClasses(product.status)}`}>
                        {product.status === ProductStatus.OUT_OF_STOCK ? 'Out of Stock' : product.status.charAt(0) + product.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{product.inventory?.quantity ?? '—'}</td>
                    <td className="py-3 px-4 text-gray-500">{formatDate(product.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/products/${product.id}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View product"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => shareOnWhatsApp(product)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Share on WhatsApp"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}