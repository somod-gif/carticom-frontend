// ============================================================
// CARTICOM — Storefront Studio
// ============================================================
//
// The seller's design room: edit on the left, watch the real shop
// update on the right. Everything saves by itself. Built for people
// who have never used "code" or "CSS" in their lives.

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Copy, ExternalLink, Eye, PencilLine, Rocket, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { EmptyState, ErrorState, LoadingState } from '@/components/dashboard/shared/StateComponents';
import { PreviewPane } from '@/components/dashboard/studio/PreviewPane';
import { LookCard } from '@/components/dashboard/studio/LookCard';
import { SectionsCard } from '@/components/dashboard/studio/SectionsCard';
import { MediaCard } from '@/components/dashboard/studio/MediaCard';
import { ContactCard } from '@/components/dashboard/studio/ContactCard';
import { GoogleCard } from '@/components/dashboard/studio/GoogleCard';
import { SaveStatus } from '@/components/dashboard/studio/SaveStatus';
import { useMyStores, onboardingKeys } from '@/features/onboarding/hooks/useOnboarding';
import { brandingApi } from '@/features/storefront-studio/service';
import { useStudioDraft } from '@/features/storefront-studio/useStudioDraft';
import { DEFAULT_SECTION_ORDER } from '@/features/storefront-studio/types';
import { getTemplate } from '@/features/templates/registry';
import { showToast } from '@/lib/notifications/toast';

type MobileTab = 'design' | 'preview';

export default function StorefrontStudioPage() {
  const {
    data: stores,
    isLoading,
    isError,
    refetch,
  } = useMyStores();
  const queryClient = useQueryClient();

  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>('design');

  const store = useMemo(() => {
    if (!stores || stores.length === 0) return undefined;
    return stores.find((entry) => entry.id === activeStoreId) ?? stores[0];
  }, [stores, activeStoreId]);

  const { draft, setField, saveState, statusMessage, saveNow } = useStudioDraft(store);

  const templateSections = useMemo(() => {
    const template = getTemplate(draft.template || '');
    return template?.sections?.length ? template.sections : DEFAULT_SECTION_ORDER;
  }, [draft.template]);

  const publish = useMutation({
    mutationFn: () => brandingApi.publish(store!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.stores });
      showToast('success', 'Your shop is live! 🎉', {
        description:
          'Anyone with your link can now browse and order — your shareable link is shown at the top of this page.',
      });
    },
    onError: (error: Error) => {
      showToast('error', "We couldn't publish your shop", {
        description: error.message,
      });
    },
  });

  // ── Loading / empty / error ──────────────────────────────
  if (isLoading) {
    return <LoadingState message="Opening your design studio…" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="We couldn't load your shop"
        description="Something went wrong while fetching your store. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  if (!store) {
    return (
      <EmptyState
        icon={Store}
        title="Set up your shop first"
        description="You need a shop before you can design it. It only takes a few minutes."
        action={{ label: 'Set up my shop', onClick: () => { window.location.href = '/onboarding'; } }}
      />
    );
  }

  const needsPublish = store.status !== 'ACTIVE';
  const liveUrl = `/store/${store.slug}`;

  const copyShopLink = async () => {
    const absoluteUrl = `${window.location.origin}${liveUrl}`;
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      showToast('success', 'Link copied');
    } catch {
      showToast('error', "We couldn't copy the link", {
        description: 'Please select the link above and copy it manually.',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Design your shop
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Change anything on the left — your shop updates on the right. It saves by itself.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SaveStatus saveState={saveState} statusMessage={statusMessage} onRetry={saveNow} />

            {stores && stores.length > 1 && (
              <Select value={store.id} onValueChange={(value) => setActiveStoreId(value)}>
                <SelectTrigger className="h-9 w-[180px]" aria-label="Which shop to design">
                  <SelectValue placeholder="Choose shop" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((entry) => (
                    <SelectItem key={entry.id} value={entry.id}>
                      {entry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {needsPublish ? (
              <Button
                size="sm"
                onClick={() => publish.mutate()}
                disabled={publish.isPending}
              >
                <Rocket className="h-4 w-4" aria-hidden />
                {publish.isPending ? 'Publishing…' : 'Make my shop live'}
              </Button>
            ) : (
              <Button size="sm" variant="outline" asChild>
                <Link href={liveUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  See my shop
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* ── Share bar ──────────────────────────────────── */}
        {needsPublish ? (
          <p className="text-sm text-gray-500">
            Publish to make your shop visible to customers — you&apos;ll get a shareable link.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Your shop:
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-gray-500" title={liveUrl}>
              {liveUrl}
            </span>
            <Button size="sm" variant="outline" onClick={copyShopLink}>
              <Copy className="h-4 w-4" aria-hidden />
              Copy link
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" aria-hidden />
                Open
              </a>
            </Button>
          </div>
        )}
      </div>

      {/* ── Mobile tab switch ────────────────────────────── */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileTab('design')}
          aria-pressed={mobileTab === 'design'}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors',
            mobileTab === 'design' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          )}
        >
          <PencilLine className="h-4 w-4" aria-hidden />
          Edit
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          aria-pressed={mobileTab === 'preview'}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors',
            mobileTab === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          )}
        >
          <Eye className="h-4 w-4" aria-hidden />
          Preview
        </button>
      </div>

      {/* ── Split view ───────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div
          className={cn(
            'lg:block',
            mobileTab === 'design' ? 'block' : 'hidden'
          )}
        >
          <div className="space-y-4 lg:max-h-[calc(100vh-13rem)] lg:overflow-y-auto lg:pr-1">
            <LookCard draft={draft} setField={setField} />
            <SectionsCard
              draft={draft}
              setField={setField}
              templateSections={templateSections}
            />
            <MediaCard draft={draft} setField={setField} />
            <ContactCard draft={draft} setField={setField} />
            <GoogleCard
              draft={draft}
              setField={setField}
              storeName={store.name}
              storeSlug={store.slug}
            />
          </div>
        </div>

        <div
          className={cn(
            'h-[calc(100vh-16rem)] min-h-[480px] lg:block lg:h-[calc(100vh-13rem)]',
            mobileTab === 'preview' ? 'block' : 'hidden'
          )}
        >
          <PreviewPane slug={store.slug} draft={draft} className="h-full" />
        </div>
      </div>
    </div>
  );
}
