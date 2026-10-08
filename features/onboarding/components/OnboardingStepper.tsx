'use client';


import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStepperProps {
  currentStep: number;
  totalSteps: number;
  /** Plain-language name of the step the seller is on, e.g. "Your business". */
  stepLabel: string;
  onBack: () => void;
}

/**
 * Progress indicator for the setup wizard.
 *
 * Deliberately has no "Next" button: every step carries its own forward
 * action (which only appears once the step is actually finished), so a
 * seller can never skip ahead into a half-finished step.
 */
export function OnboardingStepper({
  currentStep,
  totalSteps,
  stepLabel,
  onBack}: OnboardingStepperProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          Step {currentStep + 1} of {totalSteps}
          <span className="ml-1 font-normal text-gray-500 dark:text-gray-400">· {stepLabel}</span>
        </p>
        <button
          onClick={onBack}
          disabled={currentStep === 0}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors shrink-0',
            currentStep === 0
              ? 'invisible'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
