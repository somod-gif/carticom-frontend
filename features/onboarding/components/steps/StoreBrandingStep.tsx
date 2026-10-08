'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { storeBrandingSchema, type StoreBrandingFormData } from '@/features/onboarding/schemas';
import { useUpdateStore } from '@/features/onboarding/hooks/useOnboarding';
import { extractErrorMessage } from '@/lib/axios';
import { appUrl } from '@/lib/site-config';
import type { StoreDto } from '@/features/onboarding/types';

interface StoreBrandingStepProps {
  onNext: () => void;
  onBack: () => void;
  /** The seller's shop, used to pre-fill the form and save into it. */
  store?: StoreDto | null;
  onStoreUpdated: (store: StoreDto) => void;
}

export function StoreBrandingStep({ onNext, onBack, store, onStoreUpdated }: StoreBrandingStepProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const updateStore = useUpdateStore();
  const storeId = store?.id;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }} = useForm<StoreBrandingFormData>({
    resolver: zodResolver(storeBrandingSchema),
    defaultValues: {
      storeName: store?.name ?? '',
      slug: store?.slug ?? '',
      themeColor: store?.primaryColor ?? '#3B82F6',
      storeVisibility: true,
      maintenanceMode: false}});

  const watchStoreName = useWatch({ control, name: 'storeName', defaultValue: '' });
  const watchThemeColor = useWatch({ control, name: 'themeColor', defaultValue: '#3B82F6' });
  const watchSlug = useWatch({ control, name: 'slug', defaultValue: '' });

  // Auto-generate slug from store name
  const autoSlug = watchStoreName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  // Live example of the address customers will type, e.g. https://carticom.cv/store/my-shop
  const slugPreview = watchSlug || autoSlug;
  const addressPreview = slugPreview ? appUrl(`/store/${slugPreview}`) : '';

  const onSubmit = async (data: StoreBrandingFormData) => {
    try {
      if (!storeId) {
        // If no store exists yet, skip branding step (will be done later)
        onNext();
        return;
      }

      const updated = await updateStore.mutateAsync({
        id: storeId,
        data: {
          storeName: data.storeName,
          storeSlug: data.slug || undefined,
          primaryColor: data.themeColor}});

      onStoreUpdated(updated);
      onNext();
    } catch (err) {
      setSubmitError(
        extractErrorMessage(err) || 'We could not save your shop details. Please try again.'
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Store Branding
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your store&apos;s appearance
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {submitError && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
            <span className="mt-0.5 shrink-0">⚠</span>
            <p>{submitError}</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name *</Label>
            <Input id="storeName" placeholder="My Awesome Store" {...register('storeName')} />
            {errors.storeName && (
              <p className="text-sm text-red-500">{errors.storeName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Shop web address *</Label>
            <Input
              id="slug"
              placeholder={autoSlug || 'my-awesome-store'}
              {...register('slug')}
            />
            <p className="text-xs text-gray-500">
              {addressPreview ? (
                <>
                  Customers will find you at{' '}
                  <span className="font-medium text-gray-700 dark:text-gray-300">{addressPreview}</span>
                </>
              ) : (
                'Type your shop name and we will suggest an address for you.'
              )}
            </p>
            {errors.slug && (
              <p className="text-sm text-red-500">{errors.slug.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="themeColor">Theme Color</Label>
          <div className="flex items-center gap-4">
            <Input
              id="themeColor"
              type="color"
              className="w-20 h-10 cursor-pointer"
              {...register('themeColor')}
            />
            <Input
              id="themeColorHex"
              placeholder="#3B82F6"
              className="flex-1"
              value={watchThemeColor}
              readOnly
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <Label htmlFor="storeVisibility" className="text-base font-medium">
                  Store Visibility
                </Label>
                <p className="text-sm text-gray-500">Make your store visible to customers</p>
              </div>
            </div>
            <input
              id="storeVisibility"
              type="checkbox"
              className="h-5 w-5 rounded border-gray-300"
              {...register('storeVisibility')}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <EyeOff className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <Label htmlFor="maintenanceMode" className="text-base font-medium">
                  Maintenance Mode
                </Label>
                <p className="text-sm text-gray-500">Temporarily disable your store</p>
              </div>
            </div>
            <input
              id="maintenanceMode"
              type="checkbox"
              className="h-5 w-5 rounded border-gray-300"
              {...register('maintenanceMode')}
            />
          </div>
        </div>

        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-base font-medium">Store Preview</Label>
            {storeId && (
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  const previewSlug = watchSlug || autoSlug;
                  if (previewSlug) {
                    window.open(`${window.location.origin}/store/${previewSlug}`, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                Preview
              </Button>
            )}
          </div>
          <div className="aspect-video bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            {storeId ? (
              <p className="text-sm text-gray-500">
                Live preview at {appUrl(`/store/${slugPreview || '...'}`)}
              </p>
            ) : (
              <p className="text-sm text-gray-500">Store preview will appear here</p>
            )}
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            Back
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}