'use client';

import { useMemo, useState, useSyncExternalStore, createElement } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { X, Store as StoreIcon, RefreshCw } from 'lucide-react';
import { storefrontApi } from '@/features/onboarding/services/onboarding.service';
import type { StoreDto, ProductDto } from '@/features/onboarding/types';
import { TEMPLATE_MAP, TEMPLATE_COMPONENT_FALLBACK, getTemplateByCategory } from '@/components/templates';
import { parseSectionConfig, shouldShowAnnouncementBar } from '@/features/templates/sectionConfig';
import { useCartStore } from '@/store/cart.store';
import { extractErrorMessage } from '@/lib/axios';
import { showToast } from '@/lib/notifications/toast';
import { ShareButton } from '@/components/store/ShareButton';
import { StoreFooter } from '@/components/store/StoreFooter';
import { appUrl } from '@/lib/site-config';
import { useRouter } from 'next/navigation';

const QUERY_OPTIONS = { staleTime: 60_000, retry: 1 } as const;

// ─── customCss safety gate ────────────────────────────────────

/**
 * Returns the CSS only when it contains nothing that could break out
 * of the <style> element. Anything suspicious renders nothing at all.
 */
function validateCustomCss(css?: string): string | null {
  if (!css || !css.trim()) return null;
  const forbidden = /<|>|@import|expression\s*\(|javascript\s*:|data\s*:\s*text\/html/i;
  return forbidden.test(css) ? null : css;
}

/** Pick an ink color that stays readable on top of `color`. */
function readableOn(color: string): string {
  const hex = color.replace('#', '');
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  const match = full.match(/^([0-9a-f]{6})/i);
  if (!match) return '#ffffff';
  const value = parseInt(match[1], 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#111827' : '#ffffff';
}

// ─── Loading skeleton (matches the storefront layout) ─────────

function StoreSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-white" aria-busy="true" aria-label="Loading store">
      <div className="h-16 border-b border-gray-200 bg-white" />
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Hero block */}
        <div className="grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="h-4 w-28 rounded-full bg-gray-200" />
            <div className="h-10 w-3/4 rounded-lg bg-gray-200" />
            <div className="h-4 w-full max-w-md rounded bg-gray-100" />
            <div className="h-4 w-2/3 max-w-sm rounded bg-gray-100" />
            <div className="h-12 w-40 rounded-full bg-gray-200" />
          </div>
          <div className="hidden aspect-square rounded-3xl bg-gray-200 lg:block" />
        </div>
        {/* Product grid */}
        <div className="mb-8 h-6 w-44 rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-6 pb-20 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[4/5] rounded-2xl bg-gray-200" />
              <div className="mt-3 h-4 w-3/4 rounded bg-gray-200" />
              <div className="mt-2 h-4 w-1/3 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Inline error state ───────────────────────────────────────

function StoreErrorState({
  title,
  description,
  onRetry}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <StoreIcon className="h-5 w-5 text-gray-500" />
        </div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">{description}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90">
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Announcement bar ─────────────────────────────────────────

// sessionStorage is an external store. Reading it through
// useSyncExternalStore keeps the server render and the first client render
// identical (no hydration mismatch) while still honouring a dismissal the
// shopper made earlier — including in another tab.
const DISMISS_EVENT = 'carticom:announcement-dismissed';

function subscribeToDismissals(onStoreChange: () => void): () => void {
  window.addEventListener(DISMISS_EVENT, onStoreChange);
  window.addEventListener('storage', onStoreChange);
  return () => {
    window.removeEventListener(DISMISS_EVENT, onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

function AnnouncementBar({ storeSlug, text, primaryColor }: { storeSlug: string; text: string; primaryColor?: string }) {
  const storageKey = `carticom:store-announcement:${storeSlug}`;
  const dismissed = useSyncExternalStore(
    subscribeToDismissals,
    () => {
      try {
        return sessionStorage.getItem(storageKey) === 'dismissed';
      } catch {
        return false;
      }
    },
    // Server snapshot: assume not dismissed; the client corrects it right
    // after hydration if the shopper dismissed this announcement before.
    () => false
  );

  if (dismissed || !text.trim()) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(storageKey, 'dismissed');
    } catch {
      // Ignore storage failures (private mode etc.) — just hide for this visit.
    }
    window.dispatchEvent(new Event(DISMISS_EVENT));
  };

  const ink = readableOn(primaryColor || '#1d4ed8');

  return (
    <div
      className="relative z-50"
      style={{ backgroundColor: 'var(--store-primary, #1d4ed8)', color: ink }}
      role="status"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-10 py-2 md:px-8">
        <p className="text-center text-[13px] font-medium leading-snug">{text}</p>
        <button
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full transition-opacity hover:opacity-70"
          style={{ color: ink }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default function StorePage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || '';

  const storeQuery = useQuery({
    queryKey: ['storefront', 'store', slug],
    queryFn: async () => {
      const res = await storefrontApi.getStoreBySlug(slug);
      return (res.data?.data ?? null) as StoreDto | null;
    },
    enabled: !!slug,
    ...QUERY_OPTIONS,
  });

  const store = storeQuery.data ?? null;

  // Products only fetch once the store has resolved.
  const productsQuery = useQuery({
    queryKey: ['storefront', 'products', slug],
    queryFn: async () => {
      const res = await storefrontApi.getStoreProducts(slug);
      const data = res.data?.data;
      return Array.isArray(data) ? (data as ProductDto[]) : [];
    },
    enabled: !!store,
    ...QUERY_OPTIONS,
  });

  const products = productsQuery.data ?? [];
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const sectionConfig = useMemo(
    () => parseSectionConfig(store?.sectionConfig),
    [store?.sectionConfig]
  );
  const safeCustomCss = useMemo(() => validateCustomCss(store?.customCss), [store?.customCss]);

  const handleRetry = () => {
    void storeQuery.refetch();
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

  // ── Loading: skeleton until the store (and its products) have resolved ──
  const productsLoading = !!store && productsQuery.isPending && !productsQuery.isError;
  if (!slug) {
    return <StoreErrorState title="Store not found" description="We couldn't find a store with that address." />;
  }
  if (storeQuery.isPending || productsLoading) return <StoreSkeleton />;

  // ── Errors ──
  if (storeQuery.isError) {
    const msg = extractErrorMessage(storeQuery.error).toLowerCase();
    if (msg.includes('not found')) {
      return (
        <StoreErrorState
          title="Store not found"
          description="We couldn't find a store with that address. The link may be incorrect."
          onRetry={handleRetry}
        />
      );
    }
    if (msg.includes('permission')) {
      return <StoreErrorState title="Store not found" description="You do not have permission to view this store." />;
    }
    return (
      <StoreErrorState
        title="Something went wrong"
        description={extractErrorMessage(storeQuery.error) || 'We couldn’t load this store right now. Please try again.'}
        onRetry={handleRetry}
      />
    );
  }

  if (!store) {
    return <StoreErrorState title="Store not found" description="We couldn't find a store with that address." />;
  }

  const templateSlug = store.template || getTemplateByCategory(store.businessCategory || '');
  const storeUrl = typeof window !== 'undefined' ? window.location.href : appUrl(`/store/${slug}`);

  const brandVars = {
    '--store-primary': store.primaryColor || '#1d4ed8',
    '--store-secondary': store.secondaryColor || '#0f172a',
    '--store-font': store.fontFamily || 'Inter, sans-serif',
  } as React.CSSProperties;

  const showAnnouncement =
    !!store.announcementBar && shouldShowAnnouncementBar(sectionConfig);

  return (
    <>
      <div style={brandVars}>
        {showAnnouncement && (
          <AnnouncementBar storeSlug={store.slug || slug} text={store.announcementBar!} primaryColor={store.primaryColor} />
        )}
        {createElement(TEMPLATE_MAP[templateSlug] ?? TEMPLATE_COMPONENT_FALLBACK, {
          store,
          products,
          onAddToCart: handleAddToCart,
          onViewProduct: handleViewProduct,
          addingToCart,
        })}
        <StoreFooter store={store} />
        {safeCustomCss && <style dangerouslySetInnerHTML={{ __html: safeCustomCss }} />}
      </div>
      <ShareButton
        url={storeUrl}
        title={store.name}
      />
    </>
  );
}
