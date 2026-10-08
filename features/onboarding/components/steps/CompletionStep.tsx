'use client';


import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Store, Sparkles } from 'lucide-react';

/** Where the seller lands once they finish setup. */
type FinishDestination = '/dashboard/storefront' | '/dashboard';

interface CompletionStepProps {
  /** Finishes setup (with a friendly well-done message) and goes to the destination. */
  onFinish: (destination: FinishDestination) => void;
}

export function CompletionStep({ onFinish }: CompletionStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-gradient-to-br from-green-600 to-emerald-600 p-4">
            <CheckCircle className="h-16 w-16 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Congratulations!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Your shop is ready. Next, make it yours — change the colours, pictures and layout,
          then add the products you want to sell.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-6">
        <Button
          onClick={() => onFinish('/dashboard/storefront')}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Design your shop
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => onFinish('/dashboard')}>
          <Store className="h-4 w-4 mr-2" />
          Go to my dashboard
        </Button>
      </div>
    </motion.div>
  );
}