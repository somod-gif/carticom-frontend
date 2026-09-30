'use client';


import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

import { Globe } from 'lucide-react';
import type { StoreDto } from '@/features/onboarding/types';
import { APP_URL } from '@/lib/site-config';


interface StoreSetupStepProps {
  onNext: () => void;
  onBack: () => void;
  storeId?: string;
  store?: StoreDto | null;
  onStoreUpdated: (store: StoreDto) => void;
}

export function StoreSetupStep({ onNext, onBack, store }: StoreSetupStepProps) {
  const storeUrl = store?.slug ? `${APP_URL.replace(/^https?:\/\//, '')}/store/${store.slug}` : 'Store URL will be generated after creation';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Store Setup
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Your store has been created
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-start gap-4">
            <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Your Store URL
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This is your public store link. Share it with customers to start selling.
              </p>
              <div className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-mono text-blue-600 dark:text-blue-400 break-all">
                  {storeUrl}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 <strong>Tip:</strong> You can customize your store URL, theme, and settings later from the dashboard.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}