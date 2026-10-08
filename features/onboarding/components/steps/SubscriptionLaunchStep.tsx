'use client';


import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Crown, Check, Zap, ExternalLink } from 'lucide-react';
import type { StoreDto, ProductDto } from '@/features/onboarding/types';

interface SubscriptionLaunchStepProps {
  onNext: () => void;
  onBack: () => void;
  store?: StoreDto | null;
  product?: ProductDto | null;
}

export function SubscriptionLaunchStep({ onNext, onBack, store }: SubscriptionLaunchStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-gradient-to-br from-green-600 to-emerald-600 p-4">
            <Crown className="h-12 w-12 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          🎁 Welcome!
        </h2>
        <p className="text-xl text-gray-700 dark:text-gray-300">
          Your <strong>30-DAY FREE TRIAL</strong> has started
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-lg border-2 border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            What&apos;s included:
          </h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Check className="h-4 w-4 text-green-600" />
              Your online store
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Check className="h-4 w-4 text-green-600" />
              All features, no credit card required
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Check className="h-4 w-4 text-green-600" />
              Order management
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Check className="h-4 w-4 text-green-600" />
              Payments via Paystack & Flutterwave
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Check className="h-4 w-4 text-green-600" />
              Dashboard access
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Upgrade anytime for:
          </h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Zap className="h-4 w-4 text-yellow-600" />
              WhatsApp AI ordering
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Zap className="h-4 w-4 text-yellow-600" />
              Unlimited products
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Zap className="h-4 w-4 text-yellow-600" />
              Advanced analytics
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Zap className="h-4 w-4 text-yellow-600" />
              Staff management
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Zap className="h-4 w-4 text-yellow-600" />
              Premium features
            </li>
          </ul>
        </div>
      </div>

      <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/20">
        <p className="text-sm text-amber-800 dark:text-amber-300 text-center">
          ℹ️ No payment required. Start selling immediately with your free plan.
        </p>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(`/store/${store?.slug}`, '_blank')}
            disabled={!store?.slug}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Visit Store
          </Button>
          <Button
            onClick={onNext}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            Continue
          </Button>
        </div>
      </div>
    </motion.div>
  );
}