'use client';


import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Store, Zap, Shield } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
  onSkip?: () => void;
}

export function WelcomeStep({ onNext, onSkip }: WelcomeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-gradient-to-br from-blue-600 to-blue-700 p-4">
            <Store className="h-12 w-12 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome to Carticom! 🎉
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          We&apos;re excited to help you launch your online business. This quick setup will take about 5 minutes and will get you ready to start selling.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4">
          <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Quick Setup</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Get started in minutes, not hours</p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4">
          <Shield className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Secure Platform</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Your shop and customer details are kept safe and private</p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4">
          <Store className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Grow Faster</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Tools to scale your business effortlessly</p>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        {onSkip && (
          <Button variant="ghost" onClick={onSkip} className="text-gray-600 hover:text-gray-900">
            Skip for now
          </Button>
        )}
        <Button
          onClick={onNext}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          Start Setup
        </Button>
      </div>
    </motion.div>
  );
}