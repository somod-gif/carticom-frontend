'use client';

// ============================================================
// Mode B — studio live preview (`/store/preview/[slug]?studio=1`).
//
// Rendered inside an iframe in the seller's dashboard editor. The parent
// posts draft edits in real time so the storefront updates instantly.
// The exact wire contract lives in `./studio-contract.ts` (imported by
// the dashboard side too).
//
// Differences from the gallery demo:
//   • loads the REAL store + products by slug
//   • no "Preview Mode" banner / back link (the parent provides chrome)
//   • add-to-cart never touches the cart — it only notifies the parent
// ============================================================

import { createElement, useCallback, useEffect, useMemo, useState } from 'react';
import { storefrontApi } from '@/features/onboarding/services/onboarding.service';
import type { StoreDto, ProductDto } from '@/features/onboarding/types';
import { LoadingState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import { getTemplateComponent, getTemplateByCategory } from '@/components/templates';
import { parseSectionConfig, shouldShowAnnouncementBar } from '@/features/templates/sectionConfig';
import { StoreFooter } from '@/components/store/StoreFooter';
import { extractErrorMessage } from '@/lib/axios';
import {
  STUDIO_MESSAGE_VERSION,
  isStudioPreviewMessage,
  sanitizeAnnouncementBar,
  sanitizeCustomCss,
  type StudioPreviewOutboundMessage,
  type StudioStoreDraft,
} from './studio-contract';

/** Fields rendered by the preview shell that may not be on `StoreDto` yet. */
type PreviewStoreExtras = {
  announcementBar?: string;
  sectionConfig?: string;
};

export function StudioLivePreview({ slug }: { slug: string }) {
  // `store` is the saved record from the API; `draft` is what the editor
  // currently has on screen. Applying a draft is a plain object spread over
  // `store` — no refetch, no extra state, so keystrokes stay cheap.
  const [store, setStore] = useState<StoreDto | null>(null);
  const [draft, setDraft] = useState<StudioStoreDraft | null>(null);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // ── outbound ──────────────────────────────────────────────
  const postToParent = useCallback((message: StudioPreviewOutboundMessage) => {
    if (typeof window === 'undefined') return;
    if (window.parent === window) return; // not embedded — nothing to talk to
    try {
      window.parent.postMessage(message, '*');
    } catch {
      // Never let the preview protocol throw.
    }
  }, []);

  // ── data ──────────────────────────────────────────────────
  // Keyed on the slug only (the parent remounts with `key={slug}` on a slug
  // change) so `studio:apply` can never trigger a network refetch.
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    const load = async () => {
      try {
        const storeRes = await storefrontApi.getStoreBySlug(slug);
        if (cancelled) return;
        if (!storeRes.data.data) throw new Error('Store not found');
        setStore(storeRes.data.data);

        const productsRes = await storefrontApi.getStoreProducts(slug);
        if (cancelled) return;
        if (productsRes.data.data) {
          setProducts(Array.isArray(productsRes.data.data) ? productsRes.data.data : []);
        }
      } catch (err) {
        if (cancelled) return;
        const msg = extractErrorMessage(err);
        const friendly = msg.includes('not found')
          ? 'Store not found. The link may be incorrect.'
          : msg.includes('permission')
            ? 'You do not have permission to view this store.'
            : msg || 'Failed to load the preview. Please try again.';
        setError(friendly);
        postToParent({ type: 'studio:error', version: STUDIO_MESSAGE_VERSION, message: friendly });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, retryKey, postToParent]);

  // ── inbound ───────────────────────────────────────────────
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (event.origin !== window.location.origin) return; // same origin only
        if (event.source !== window.parent) return; // parent frame only
        if (!isStudioPreviewMessage(event.data)) return; // malformed / wrong version

        if (event.data.type === 'studio:apply') {
          setDraft({ ...event.data.store });
        } else if (event.data.type === 'studio:reset') {
          setDraft(null);
        }
      } catch {
        // A bad message must never break the preview.
      }
    };

    window.addEventListener('message', handleMessage);
    postToParent({ type: 'studio:ready', version: STUDIO_MESSAGE_VERSION });
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [postToParent]);

  // ── interactions ──────────────────────────────────────────
  const handleAddToCart = useCallback(
    (_productId: string, _variantId?: string) => {
      // No cart calls in preview — just tell the editor what the user did.
      postToParent({ type: 'studio:interaction', version: STUDIO_MESSAGE_VERSION, value: 'add-to-cart' });
    },
    [postToParent]
  );

  const handleViewProduct = useCallback((_productId: string) => {
    // Navigation is disabled inside the preview iframe (the parent owns chrome).
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    setRetryKey((k) => k + 1);
  }, []);

  const mergedStore = useMemo<StoreDto | null>(
    () => (store ? (draft ? { ...store, ...draft } : store) : null),
    [store, draft]
  );

  if (!slug)
    return (
      <ErrorState
        title="We couldn't open this preview"
        description="This preview link is missing a shop."
      />
    );
  if (loading) return <LoadingState message="Loading preview..." />;
  if (error) return <ErrorState title="Preview unavailable" description={error} onRetry={handleRetry} />;
  if (!mergedStore) return <ErrorState title="Store not found" description="We couldn't find a store with that address." />;

  const templateSlug =
    draft?.template || mergedStore.template || getTemplateByCategory(mergedStore.businessCategory || '');
  const Template = getTemplateComponent(templateSlug);

  const brandVars = {
    '--store-primary': mergedStore.primaryColor || '#1d4ed8',
    '--store-secondary': mergedStore.secondaryColor || '#0f172a',
    '--store-font': mergedStore.fontFamily || 'Inter, sans-serif',
    // `clip` (not `hidden`, which would turn this into a scroll container and
    // break sticky headers) guarantees the shell never adds horizontal
    // overflow at 390px, whatever the template does.
    overflowX: 'clip',
  } as React.CSSProperties;

  const extras = mergedStore as StoreDto & PreviewStoreExtras;
  const announcementBar = sanitizeAnnouncementBar(extras.announcementBar);
  // Same gate as the live storefront: the bar obeys the `announcement`
  // section token so hiding it in the studio hides it here too.
  const showAnnouncement = !!announcementBar && shouldShowAnnouncementBar(parseSectionConfig(extras.sectionConfig));
  const customCss = sanitizeCustomCss(mergedStore.customCss); // null → render nothing

  return (
    <div className="min-h-screen" style={brandVars}>
      {showAnnouncement ? (
        <div
          className="w-full break-words px-4 py-2 text-center text-xs font-semibold sm:text-sm"
          style={{ backgroundColor: 'var(--store-primary)', color: '#ffffff' }}
        >
          {announcementBar}
        </div>
      ) : null}
      {createElement(Template, {
        store: mergedStore,
        products,
        onAddToCart: handleAddToCart,
        onViewProduct: handleViewProduct,
        addingToCart: null,
      })}
      <StoreFooter store={mergedStore} />
      {customCss ? <style dangerouslySetInnerHTML={{ __html: customCss }} /> : null}
    </div>
  );
}
