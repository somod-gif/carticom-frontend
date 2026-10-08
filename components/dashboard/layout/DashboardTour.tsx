'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const TOUR_STEPS = [
  {
    title: 'Welcome to Your Dashboard',
    description: 'This is your command center. From here you can manage everything about your store.',
    icon: '🏠',
  },
  {
    title: 'Manage Your Store',
    description: 'Update your store branding, template, and settings from the Store page.',
    icon: '🏪',
  },
  {
    title: 'Add Products',
    description: 'Start adding products to your store. You can upload images, set prices, and manage inventory.',
    icon: '📦',
  },
  {
    title: 'My Storefront',
    description: 'Design your shop with a live preview. Pick a template, choose your colors, and watch your shop update as you make changes.',
    icon: '🎨',
  },
  {
    title: 'View Orders',
    description: 'Track all incoming orders and manage fulfillment from the Orders page.',
    icon: '🛒',
  },
  {
    title: 'You\'re All Set!',
    description: 'Start building your online store. You can always come back to this tour from Settings.',
    icon: '🚀',
  },
];

const TOUR_KEY = 'carticom-dashboard-tour-seen';

/**
 * Clears the tour-seen flag and reloads the page so the tour plays again.
 * Settings may call this to let sellers replay the tour.
 */
export function replayDashboardTour() {
  localStorage.removeItem(TOUR_KEY);
  window.location.reload();
}

export function DashboardTour() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem(TOUR_KEY);
    if (!seen) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const close = () => {
    setShow(false);
    localStorage.setItem(TOUR_KEY, 'true');
  };

  const next = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      close();
    }
  };

  if (!show) return null;

  const current = TOUR_STEPS[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium opacity-90">Quick Tour</span>
            </div>
            <button onClick={close} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="text-4xl mb-3">{current.icon}</div>
          <h3 className="text-xl font-bold">{current.title}</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed">{current.description}</p>
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    i === step ? 'w-6 bg-indigo-600' : 'w-1.5 bg-gray-300'
                  )}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={close}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Skip
              </button>
              <button
                onClick={next}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                {step === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
