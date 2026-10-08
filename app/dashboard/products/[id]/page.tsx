'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Boxes, ExternalLink, Save, Trash2 } from 'lucide-react';
import { useProduct, useUpdateProduct, useDeleteProduct } from '@/features/dashboard/hooks/useProducts';
import { ProductStatus } from '@/features/dashboard/types/products.types';
import { LoadingState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import { Breadcrumb } from '@/components/dashboard/shared/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/FileUpload';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Please choose an image file (PNG, JPG or WebP).';
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return 'Please choose an image under 10MB.';
  }
  return null;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = params?.id ?? '';
  const { data: product, isLoading, error, refetch } = useProduct(productId);
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    sku: '',
    quantity: '',
    imageUrl: '',
    status: ProductStatus.ACTIVE});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [syncedProduct, setSyncedProduct] = useState<typeof product | null>(null);

  // Sync the form when the product first loads (React's documented
  // "adjust state when a prop changes" pattern — guarded, runs during
  // render instead of an effect that would cascade).
  if (product && product !== syncedProduct) {
    setSyncedProduct(product);
    setForm({
      name: product.name ?? '',
      description: product.description ?? '',
      price: String(product.price ?? ''),
      compareAtPrice: product.compareAtPrice != null ? String(product.compareAtPrice) : '',
      sku: product.sku ?? '',
      quantity: String(product.inventory?.quantity ?? 0),
      imageUrl: product.images?.[0] ?? '',
      status: product.status});
  }

  if (isLoading) return <LoadingState message="Loading product..." />;
  if (error || !product) return <ErrorState title="Product not found" description="This product could not be loaded." onRetry={refetch} />;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    const price = Number(form.price);
    if (!form.name.trim()) { setSaveError('Name is required'); return; }
    if (!Number.isFinite(price) || price <= 0) { setSaveError('Price must be greater than 0'); return; }
    setSaving(true);
    try {
      const quantity = Math.max(0, Number(form.quantity) || 0);
      await updateProduct.mutateAsync({
        id: product.id,
        data: {
          name: form.name.trim(),
          description: form.description,
          price,
          compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
          sku: form.sku.trim() || undefined,
          quantity: form.status === ProductStatus.OUT_OF_STOCK ? 0 : quantity,
          imageUrl: form.imageUrl,
          isActive: form.status === ProductStatus.ACTIVE || form.status === ProductStatus.OUT_OF_STOCK}});
      await refetch();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteProduct.mutateAsync(product.id);
      router.push('/dashboard/products');
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Products', href: '/dashboard/products' }, { label: product.name }]} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 truncate">{product.name}</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              {product.status === ProductStatus.OUT_OF_STOCK ? 'Out of Stock' : product.status}
            </span>
          </div>
          <p className="text-gray-600 mt-1">
            {formatCurrency(product.price)} · Stock: {product.inventory?.quantity ?? 0} · SKU: {product.sku || '—'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/products/${product.id}/variants`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Boxes className="h-4 w-4" /> Variants
          </Link>
          <Link
            href={`/storefront/products/${product.id}?store=${product.storeId}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <ExternalLink className="h-4 w-4" /> View in Store
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" /> {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Product image</p>
            <FileUpload
              folder="products"
              currentUrl={form.imageUrl || undefined}
              onUploaded={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
              validateFile={validateImageFile}
            />
            <p className="text-xs text-gray-500 mt-2">
              This is the picture customers see in your shop. PNG or JPG, up to 10MB.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="font-medium text-gray-900">{product.categoryName || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Created</span><span className="font-medium text-gray-900">{new Date(product.createdAt).toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Updated</span><span className="font-medium text-gray-900">{new Date(product.updatedAt).toLocaleDateString()}</span></div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Edit Product</h2>
            {saveError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{saveError}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={form.description} onChange={handleChange} rows={4} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (NGN) *</Label>
                <Input id="price" name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compareAtPrice">Compare-at Price</Label>
                <Input id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" min="0" value={form.compareAtPrice} onChange={handleChange} placeholder="Optional" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" name="sku" value={form.sku} onChange={handleChange} placeholder="Optional" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Stock Quantity</Label>
                <Input id="quantity" name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                value={form.status === ProductStatus.ARCHIVED ? ProductStatus.DRAFT : form.status}
                onChange={handleChange}
                className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-900"
              >
                <option value={ProductStatus.ACTIVE}>Active</option>
                <option value={ProductStatus.DRAFT}>Draft (hidden from store)</option>
                <option value={ProductStatus.OUT_OF_STOCK}>Out of stock (mark unavailable)</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Products
              </Link>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
