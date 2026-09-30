'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Eye, ExternalLink, LayoutTemplate, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TEMPLATES } from '@/features/templates/registry';
import { BUSINESS_CATEGORIES } from '@/features/templates/types';
import type { TemplateConfig } from '@/features/templates/types';
import { TemplatePreviewModal } from '@/components/marketing/TemplatePreviewModal';
import { useUpdateStore } from '@/features/onboarding/hooks/useOnboarding';
import { useMyStores } from '@/features/onboarding/hooks/useOnboarding';
import { useCurrentStoreId } from '@/hooks/useCurrentStore';
import { showToast } from '@/lib/notifications/toast';
import { cn } from '@/lib/utils';

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  BUSINESS_CATEGORIES.map((c) => [c.value, c.label])
);

type StoreInfo = { id: string; name: string; slug: string; category?: string };

export default function TemplatesPage() {
  const { storeId } = useCurrentStoreId();
  const { data: myStores, isLoading } = useMyStores();
  const updateStore = useUpdateStore();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [previewTemplate, setPreviewTemplate] = useState<TemplateConfig | null>(null);

  const store = useMemo(
    () => (myStores ?? []).find((s) => s.id === storeId) as unknown as StoreInfo | undefined,
    [myStores, storeId]
  );
  const currentCategory = store?.category ?? '';

  const templates = useMemo(
    () =>
      activeCategory === 'ALL'
        ? TEMPLATES
        : TEMPLATES.filter((t) => t.category === activeCategory),
    [activeCategory]
  );

  const applyTemplate = (t: TemplateConfig) => {
    if (!store || updateStore.isPending) return;
    updateStore.mutate(
      { id: store.id, data: { businessCategory: t.category } },
      {
        onSuccess: () =>
          showToast('success', `"${t.name}" is now live on your storefront`),
        onError: () => showToast('error', 'Failed to apply template'),
      }
    );
  };

  if (isLoading || !storeId) {
    return (
      <div className="p-6 text-sm text-gray-500">Loading templates...</div>
    );
  }

  return (
    <main className="p-4 md:p-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-soft border border-brand/15 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            <span className="text-xs font-semibold text-brand-dark">
              {TEMPLATES.length} ready-made storefronts
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Store Templates</h1>
          <p className="text-sm text-gray-600 mt-1.5 max-w-2xl">
            Pick a template and your storefront restyles instantly — products, cart and checkout
            stay exactly as they are. Preview before you apply.
          </p>
        </div>
        {store?.slug && (
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={`/store/${store.slug}`} target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" /> View my store
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={cn(
            'flex-none px-4 py-2 rounded-full text-sm font-medium transition-colors',
            activeCategory === 'ALL'
              ? 'bg-brand text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          )}
        >
          All
        </button>
        {BUSINESS_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={cn(
              'flex-none px-4 py-2 rounded-full text-sm font-medium transition-colors',
              activeCategory === cat.value
                ? 'bg-brand text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map((t, i) => {
          const isCurrent = currentCategory === t.category;
          return (
            <motion.article
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white hover:border-brand/30 hover:shadow-xl hover:shadow-brand/5 transition-all duration-300"
            >
              <button
                onClick={() => setPreviewTemplate(t)}
                className="relative block w-full aspect-[4/3] overflow-hidden text-left"
                aria-label={`Preview ${t.name}`}
              >
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-105',
                    t.previewGradient
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl drop-shadow-lg">{t.previewIcon}</span>
                </div>
                {isCurrent && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur text-xs font-semibold text-green-700 shadow">
                    <Check className="h-3.5 w-3.5" /> Current
                  </div>
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur text-xs font-semibold text-gray-900 shadow">
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-base font-bold text-white drop-shadow truncate">{t.name}</p>
                  <p className="text-[11px] font-medium text-white/80 uppercase tracking-wide">
                    {CATEGORY_LABELS[t.category] || t.category}
                  </p>
                </div>
              </button>

              <div className="flex flex-1 flex-col p-4">
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
                  {t.description}
                </p>
                <div className="mt-auto flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => setPreviewTemplate(t)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" /> Preview
                  </Button>
                  <Button
                    size="sm"
                    disabled={isCurrent || updateStore.isPending}
                    onClick={() => applyTemplate(t)}
                    className={cn(
                      'flex-1 rounded-xl',
                      isCurrent
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-brand hover:bg-brand-dark text-white'
                    )}
                  >
                    {isCurrent ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1.5" /> Active
                      </>
                    ) : (
                      <>
                        <LayoutTemplate className="h-3.5 w-3.5 mr-1.5" /> Apply
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      <TemplatePreviewModal
        template={previewTemplate}
        open={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />
    </main>
  );
}
