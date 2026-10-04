'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { cartApi } from '@/features/onboarding/services/onboarding.service';
import type { CartDto, CartItemDto } from '@/features/onboarding/types';
import { Button } from '@/components/ui/button';
import { LoadingState, EmptyState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import { useCartStore } from '@/store/cart.store';
import { extractErrorMessage } from '@/lib/axios';

import { toast } from 'sonner';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [retryKey, setRetryKey] = useState(0);

  // storeId: URL query ?store=<id> first, then the remembered store from the cart store
  const [searchParams] = useState(() => new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  ));
  const storeId = searchParams.get('store') || useCartStore.getState().storeId || '';
  const hasStoreId = !!storeId;
  const [loading, setLoading] = useState(hasStoreId);

  useEffect(() => {
    if (!hasStoreId) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await cartApi.get(storeId as string);
        if (cancelled) return;
        if (!res.data.data) {
          setCart(null);
        } else {
          setCart(res.data.data);
        }
      } catch (err) {
        if (cancelled) return;
        // 404 / missing cart (e.g. new browser session) → show empty state, not an error
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          useCartStore.getState().reset();
          setCart(null);
          setError(null);
        } else {
          setError(extractErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [hasStoreId, storeId, retryKey]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryKey((k) => k + 1);
  };

  const storeIdToUse = cart?.storeId || storeId || '';

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (!storeIdToUse || newQuantity < 1) return;
    setUpdatingItems((prev) => new Set(prev).add(productId));
    try {
      const res = await cartApi.updateItem(storeIdToUse, productId, newQuantity);
      if (res.data.data) setCart(res.data.data);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (!storeIdToUse) return;
    try {
      const res = await cartApi.removeItem(storeIdToUse, productId);
      if (res.data.data) setCart(res.data.data);
      toast.success('Item removed from cart.');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  if (loading) return <LoadingState message="Loading cart..." />;

  if (error) return <ErrorState title="Error loading cart" description={error} onRetry={handleRetry} />;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Looks like you haven't added anything yet. Browse a store to find products!"
        action={{
          label: 'Browse Stores',
          onClick: () => router.push('/storefront')}}
      />
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: cart.currency || 'NGN',
      minimumFractionDigits: 2}).format(price);

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Shopping Cart
        </h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="space-y-4">
        {cart.items.map((item: CartItemDto) => (
          <div
            key={item.productId}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex flex-wrap items-center gap-3 sm:gap-4"
          >
            <div className="flex-shrink-0 relative w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
              {item.productImage ? (
                <Image src={item.productImage} alt={item.productName || 'Product'} fill unoptimized className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
              )}
            </div>
            <div className="flex-1 min-w-[140px]">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {item.productName || `Product ${item.productId.slice(0, 8)}`}
              </p>
              <p className="text-sm text-blue-600 font-semibold mt-1">
                {formatPrice(item.unitPrice)}
              </p>
            </div>

            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                disabled={item.quantity <= 1 || updatingItems.has(item.productId)}
                className="w-11 h-11 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                aria-label="Decrease"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-10 text-center text-sm font-medium text-gray-900 dark:text-white">
                {updatingItems.has(item.productId) ? '...' : item.quantity}
              </span>
              <button
                onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                className="w-11 h-11 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                aria-label="Increase"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="min-w-[72px] text-right ml-auto">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {formatPrice(item.lineTotal)}
              </p>
            </div>

            <button
              onClick={() => handleRemoveItem(item.productId)}
              className="w-11 h-11 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Subtotal</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Shipping</span>
            <span className="font-medium text-green-600 dark:text-green-400">Free</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-800">
            <span>Total</span>
            <span>{formatPrice(cart.total)}</span>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full mt-6"
          onClick={() => router.push(
            storeIdToUse
              ? `/storefront/checkout?store=${storeIdToUse}`
              : '/storefront/checkout')}
        >
          Proceed to Checkout
        </Button>

        <Link
          href="/storefront"
          className="block text-center text-sm text-blue-600 hover:text-blue-500 mt-4 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
