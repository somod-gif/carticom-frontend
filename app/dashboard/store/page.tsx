'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useMyStores, useUpdateStore } from '@/features/onboarding/hooks/useOnboarding';
import { LoadingState, EmptyState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import { Globe, Eye, ExternalLink, Copy, Palette, Wallet } from 'lucide-react';
import { showToast } from '@/lib/notifications/toast';
import { getTemplate } from '@/features/templates/registry';
import axiosInstance, { extractErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';

// ─── Payouts ─────────────────────────────────────────────────
// Read-only summary of the store's completed payments, straight from
// GET /api/v1/stores/{id}/payouts. Nothing here is estimated.

type PayoutTransaction = {
  id: number;
  orderId: number | null;
  amount: number;
  currency: string | null;
  status: string;
  paidAt: string;
};

type PayoutSummary = {
  totalPaidOut: number;
  currency: string | null;
  transactionCount: number;
  firstPayoutDate: string | null;
  lastPayoutDate: string | null;
  recentTransactions: PayoutTransaction[];
};

function formatPayoutMoney(amount: number, currency?: string | null) {
  const code = currency || 'NGN';
  try {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: code, minimumFractionDigits: 0 }).format(amount);
  } catch {
    // A store can carry a currency code Intl doesn't know — show it plainly
    // rather than hiding the amount.
    return `${code} ${amount.toLocaleString()}`;
  }
}

function formatPayoutDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Backend status codes in plain language. */
function plainStatus(status: string) {
  const map: Record<string, string> = {
    PAID: 'Paid',
    PENDING: 'Pending',
    FAILED: 'Failed',
    REFUNDED: 'Refunded',
    PARTIALLY_REFUNDED: 'Partially refunded',
  };
  return map[status] ?? status;
}

export default function StorePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { data: stores, isLoading, error, refetch } = useMyStores();
  const updateStore = useUpdateStore();

  const store = stores?.[0] ?? null;
  const storeId = store?.id;

  const {
    data: payouts,
    isLoading: payoutsLoading,
    error: payoutsError,
    refetch: refetchPayouts,
  } = useQuery({
    queryKey: ['payouts', storeId ?? ''],
    queryFn: () =>
      axiosInstance
        .get<{ success: boolean; data: PayoutSummary }>(`/api/v1/stores/${storeId}/payouts`)
        .then((res) => res.data.data),
    enabled: !!storeId,
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
const [editing, setEditing] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [syncedStore, setSyncedStore] = useState<typeof store>(null);

  // Reset the local form when the store first arrives (React's documented
  // "adjust state when a prop changes" pattern — guarded, runs during render
  // instead of an effect that would cascade).
  if (store && store !== syncedStore) {
    setSyncedStore(store);
    setName(store.name ?? '');
    setDescription(store.description ?? '');
  }

const handleSave = () => {
    if (!store) return;
    updateStore.mutate(
      { id: store.id, data: { storeName: name, description } },
      { onSuccess: () => setEditing(false) }
    );
  };

  const handleTogglePublish = async () => {
    if (!store) return;
    setPublishing(true);
    try {
      const action = store.status === 'ACTIVE' ? 'unpublish' : 'publish';
      await axiosInstance.patch(`/api/v1/stores/${store.id}/${action}`);
      if (action === 'publish') {
        showToast('success', 'Store published successfully', {
          description: `Customers can now open your shop at ${window.location.origin}/store/${store.slug}`});
      } else {
        showToast('success', 'Store unpublished successfully', {
          description: 'Your shop link no longer opens the storefront. Publish again whenever you like.'});
      }
      refetch();
    } catch {
      showToast('error', 'Failed to update store status');
    } finally {
      setPublishing(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading store..." />;
  }

  if (error) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (!store) {
    return (
      <EmptyState
        title="Set up your shop first"
        description="You need a shop before you can manage its settings or publish it. It only takes a few minutes."
        action={{ label: 'Set up my shop', onClick: () => router.push('/onboarding') }}
      />
    );
  }

  const isPublished = store.status === 'ACTIVE';
  const storefrontUrl = `${window.location.origin}/store/${store.slug}`;

  const payoutCount = payouts?.transactionCount ?? 0;
  const hasPayouts = payoutCount > 0;
  const payoutRange =
    payouts?.firstPayoutDate && payouts?.lastPayoutDate
      ? payouts.firstPayoutDate === payouts.lastPayoutDate
        ? formatPayoutDate(payouts.firstPayoutDate)
        : `${formatPayoutDate(payouts.firstPayoutDate)} – ${formatPayoutDate(payouts.lastPayoutDate)}`
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Store</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your store settings and branding
          </p>
        </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/storefront"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
            >
              <Palette className="h-4 w-4" />
              Design Storefront
            </Link>
            {isPublished && (
              <a
                href={storefrontUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Eye className="h-4 w-4" />
                View Store
              </a>
            )}
            <button
              onClick={() => {
                navigator.clipboard.writeText(storefrontUrl);
                showToast('success', 'Store link copied!');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </button>
            <button
              onClick={handleTogglePublish}
            disabled={publishing}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
              isPublished
                ? 'border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Globe className="h-4 w-4" />
            {publishing ? '...' : isPublished ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Store Information</h2>
            <button
              onClick={() => setEditing(!editing)}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={updateStore.isPending}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {updateStore.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Store Name</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{store.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{store.description || 'No description'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slug</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">/{store.slug}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  store.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : store.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {store.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{store.currency}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Owner</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{user?.fullName || 'Not set'}</p>
              </div>
              {isPublished && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Store URL</label>
                  <a href={storefrontUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                    {storefrontUrl} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Payouts — read-only summary of this store's completed payments. */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payouts</h2>
          </div>

          {payoutsLoading ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading your payouts...</p>
          ) : payoutsError ? (
            <div>
              <p className="text-sm text-red-600 dark:text-red-400">We couldn&apos;t load your payouts.</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{extractErrorMessage(payoutsError)}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => refetchPayouts()}
              >
                Try again
              </Button>
            </div>
          ) : hasPayouts ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total paid out</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPayoutMoney(Number(payouts?.totalPaidOut ?? 0), payouts?.currency)}
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  From {payoutCount} {payoutCount === 1 ? 'transaction' : 'transactions'}
                  {payoutRange ? ` · ${payoutRange}` : ''}
                </p>
              </div>
              <div className="space-y-2">
                {payouts?.recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 dark:border-gray-800 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatPayoutMoney(Number(tx.amount), tx.currency ?? payouts?.currency)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatPayoutDate(tx.paidAt)}</p>
                    </div>
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">
                      {plainStatus(tx.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No payouts yet — they&apos;ll appear here once customers start paying.
            </p>
          )}

          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => router.push('/dashboard/support')}
          >
            Contact support
          </Button>
        </div>

        {/* Storefront design */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Storefront design</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Colours, logo, fonts, sections and how you appear on Google are all edited in one place —
            the Storefront Studio.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Look</p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {getTemplate(store.template ?? '')?.name ?? 'Default'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Colours</p>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700"
                  style={{ backgroundColor: store.primaryColor || '#4f46e5' }}
                />
                <span
                  className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700"
                  style={{ backgroundColor: store.secondaryColor || '#7c3aed' }}
                />
              </div>
            </div>
            {store.logoUrl && (
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Logo</p>
                <div className="relative mt-1 w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <Image src={store.logoUrl} alt="Store logo" fill unoptimized className="object-cover" />
                </div>
              </div>
            )}
          </div>
          <Link
            href="/dashboard/storefront"
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
          >
            <Palette className="h-4 w-4" />
            Open Storefront Studio
          </Link>
        </div>
      </div>
    </div>
  );
}
