'use client';

import { useEffect, useState, createElement } from 'react';
import { useParams } from 'next/navigation';
import { storefrontApi } from '@/features/onboarding/services/onboarding.service';
import type { StoreDto, ProductDto } from '@/features/onboarding/types';
import { LoadingState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import { TEMPLATE_MAP, TEMPLATE_COMPONENT_FALLBACK, getTemplateByCategory } from '@/components/templates';
import { useCartStore } from '@/store/cart.store';
import { extractErrorMessage } from '@/lib/axios';
import { showToast } from '@/lib/notifications/toast';
import { ShareButton } from '@/components/store/ShareButton';
import { StoreFooter } from '@/components/store/StoreFooter';
import { appUrl } from '@/lib/site-config';
import { useRouter } from 'next/navigation';

export default function StorePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [store, setStore] = useState<StoreDto | null>(null);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    const load = async () => {
      try {
        const storeRes = await storefrontApi.getStoreBySlug(slug);
        if (cancelled) return;
        if (!storeRes.data.data) throw new Error('Store not found');
        const storeData = storeRes.data.data;
        setStore(storeData);

        const productsRes = await storefrontApi.getStoreProducts(slug);
        if (cancelled) return;
        if (productsRes.data.data) {
          setProducts(Array.isArray(productsRes.data.data) ? productsRes.data.data : []);
        }
      } catch (err) {
        if (cancelled) return;
        const msg = extractErrorMessage(err);
        if (msg.includes('not found')) {
          setError('Store not found. The link may be incorrect.');
        } else if (msg.includes('permission')) {
          setError('You do not have permission to view this store.');
        } else {
          setError(msg || 'Failed to load store. Please try again.');
        }
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

  const handleAddToCart = async (productId: string, variantId?: string) => {
    if (!store) return;
    setAddingToCart(productId);
    try {
      const ok = await useCartStore.getState().addToCart({
        storeId: store.id,
        productId,
        quantity: 1,
        variantId});
      if (ok) {
        showToast('success', 'Added to cart!');
      } else {
        showToast('error', useCartStore.getState().lastError || 'Failed to add to cart. Please try again.');
      }
    } catch (err) {
      const msg = extractErrorMessage(err);
      showToast('error', msg || 'Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(null);
    }
  };

  const handleViewProduct = (productId: string) => {
    if (!store) return;
    router.push(`/storefront/products/${productId}?store=${store.id}`);
  };

  if (loading) return <LoadingState message="Loading store..." />;
  if (error) return <ErrorState title="Error loading store" description={error} onRetry={handleRetry} />;
  if (!store) return <ErrorState title="Store not found" description="We couldn't find a store with that address." />;

  const templateSlug = store.template || getTemplateByCategory(store.businessCategory || '');
  const storeUrl = typeof window !== 'undefined' ? window.location.href : appUrl(`/store/${slug}`);

  const brandVars = {
    '--store-primary': store.primaryColor || '#1d4ed8',
    '--store-secondary': store.secondaryColor || '#0f172a',
    '--store-font': store.fontFamily || 'Inter, sans-serif',
  } as React.CSSProperties;

  return (
    <>
      <div style={brandVars}>
        {createElement(TEMPLATE_MAP[templateSlug] ?? TEMPLATE_COMPONENT_FALLBACK, {
          store,
          products,
          onAddToCart: handleAddToCart,
          onViewProduct: handleViewProduct,
          addingToCart,
        })}
        <StoreFooter store={store} />
      </div>
      <ShareButton
        url={storeUrl}
        title={store.name}
      />
    </>
  );
}
