'use client';

import { Suspense, useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, SlidersHorizontal, Grid3X3, List, ShoppingBag } from 'lucide-react';
import { storefrontApi, productApi } from '@/features/onboarding/services/onboarding.service';
import type { StoreDto, ProductDto } from '@/features/onboarding/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingState, EmptyState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cart.store';

function StoreProductsContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [store, setStore] = useState<StoreDto | null>(null);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'name' | 'price-asc' | 'price-desc' | 'newest'>('name');
  const [category, setCategory] = useState<string>('all');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const storeRes = await storefrontApi.getStoreBySlug(slug);
        if (cancelled) return;
        if (!storeRes.data.data) { if (!cancelled) { setError('Store not found'); setLoading(false); } return; }
        const storeData = storeRes.data.data;
        setStore(storeData);
        try {
          const catRes = await storefrontApi.getStoreCategories(slug);
          if (!cancelled) setCategories((catRes.data.data || []) as { id: string; name: string }[]);
        } catch {
          if (!cancelled) setCategories([]);
        }
        const prodRes = await productApi.getActiveByStore(storeData.id);
        if (cancelled) return;
        setProducts(prodRes.data.data || []);
      } catch {
        if (cancelled) return;
        setError('Failed to load store products');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [slug, retryKey]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryKey((k) => k + 1);
  };

  const filtered = products
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => category === 'all' || p.categoryId === category)
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return a.name.localeCompare(b.name);
    });

  const handleAddToCart = async (product: ProductDto) => {
    if (!store) return;
    const ok = await useCartStore.getState().addToCart({ storeId: store.id, productId: product.id, quantity: 1 });
    if (ok) {
      toast.success(`${product.name} added to cart`);
    } else {
      toast.error(useCartStore.getState().lastError || 'Failed to add to cart');
    }
  };

  const viewHref = (product: ProductDto) => `/storefront/products/${product.id}?store=${store?.id ?? ''}`;

  const formatPrice = (price: number, currency = 'NGN') =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency, minimumFractionDigits: 2 }).format(price);

  if (loading) return <LoadingState message="Loading store..." />;
  if (error) return <ErrorState title="Error" description={error} onRetry={handleRetry} />;
  if (!store) return null;

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{store.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{store.description || 'Browse our products'}</p>
        </div>
        <Link href={`/store/${slug}`} className="text-sm text-blue-600 hover:text-blue-500">View Storefront</Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-400" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
          >
            <option value="name">Name</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
          <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button onClick={() => setView('grid')} className={`p-1.5 ${view === 'grid' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}><Grid3X3 className="h-4 w-4" /></button>
            <button onClick={() => setView('list')} className={`p-1.5 ${view === 'list' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}><List className="h-4 w-4" /></button>
          </div>
          <span className="text-xs text-gray-400">{filtered.length} products</span>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setCategory('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              category === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                category === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No products found" description={search ? 'Try a different search term' : 'This store has no products yet'} />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <div key={product.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-lg transition-shadow group">
              <Link href={viewHref(product)} className="block">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">{product.name[0]}</div>
                  )}
                </div>
              </Link>
              <div className="p-3 space-y-2">
                <Link href={viewHref(product)}>
                  <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate hover:text-blue-600">{product.name}</h3>
                </Link>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-600 text-sm">{formatPrice(product.price, store.currency)}</span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((product) => (
            <div key={product.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex items-center gap-4">
              <Link href={viewHref(product)} className="shrink-0">
                <div className="relative w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill unoptimized className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">{product.name[0]}</div>
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={viewHref(product)}>
                  <h3 className="font-medium text-gray-900 dark:text-white truncate hover:text-blue-600">{product.name}</h3>
                </Link>
                <p className="text-xs text-gray-500 truncate">{product.description}</p>
              </div>
              <span className="font-bold text-blue-600">{formatPrice(product.price, store.currency)}</span>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => router.push(viewHref(product))}>View Product</Button>
                <Button size="sm" onClick={() => handleAddToCart(product)}>Add to Cart</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StoreProductsPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading..." />}>
      <StoreProductsContent />
    </Suspense>
  );
}
