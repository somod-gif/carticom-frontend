'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { OnboardingShell } from './OnboardingShell';
import { OnboardingStepper } from './OnboardingStepper';
import { WelcomeStep } from './steps/WelcomeStep';
import { BusinessInfoStep } from './steps/BusinessInfoStep';
import { StoreBrandingStep } from './steps/StoreBrandingStep';
import { TemplateSelectStep } from './steps/TemplateSelectStep';
import { FirstProductStep } from './steps/FirstProductStep';
import { InviteStaffStep } from './steps/InviteStaffStep';
import { SubscriptionLaunchStep } from './steps/SubscriptionLaunchStep';
import { CompletionStep } from './steps/CompletionStep';
import type { BusinessInfoFormData } from '@/features/onboarding/schemas';
import type { StoreDto } from '@/features/onboarding/types';
import { useMyStores, useUpdateStore } from '@/features/onboarding/hooks/useOnboarding';
import { axiosInstance } from '@/lib/axios';
import { showToast } from '@/lib/notifications/toast';
import { useAuthStore } from '@/features/auth/store/auth.store';

/** Where the seller got to, so an abandoned setup resumes instead of restarting. */
const STEP_STORAGE_KEY = 'carticom-onboarding-step';

/** Where the final buttons take the seller once setup is finished. */
type FinishDestination = '/dashboard/storefront' | '/dashboard';

const STEPS = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'business-info', label: 'Your business' },
  { id: 'branding', label: 'Your shop address' },
  { id: 'template', label: 'Choose your design' },
  { id: 'first-product', label: 'Your first product' },
  { id: 'subscription', label: 'Your free trial' },
  { id: 'invite-staff', label: 'Invite your team' },
  { id: 'complete', label: 'Finish up' },
] as const;

/** First step that cannot be finished without a shop. */
const FIRST_STEP_NEEDING_STORE = STEPS.findIndex((step) => step.id === 'business-info');

function readSavedStepIndex(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const saved = window.localStorage.getItem(STEP_STORAGE_KEY);
    const index = STEPS.findIndex((step) => step.id === saved);
    return index >= 0 ? index : 0;
  } catch {
    return 0;
  }
}

/**
 * Where to resume: the saved step, never past the last step the seller can
 * actually finish (they can't jump back to "add a product" with no shop).
 */
function initialStepIndex(hasStore: boolean): number {
  const saved = readSavedStepIndex();
  const furthestSafeStep = hasStore ? STEPS.length - 1 : FIRST_STEP_NEEDING_STORE;
  return saved <= furthestSafeStep ? saved : furthestSafeStep;
}

function saveStepIndex(index: number) {
  try {
    window.localStorage.setItem(STEP_STORAGE_KEY, STEPS[index].id);
  } catch {
    // Storage unavailable (e.g. private browsing) — resuming simply won't happen.
  }
}

function clearSavedStep() {
  try {
    window.localStorage.removeItem(STEP_STORAGE_KEY);
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}

export function OnboardingWizard() {
  const { data: existingStores, isLoading: storesLoading } = useMyStores();

  // Wait for the seller's shop before showing anything, so we resume on a
  // step they can really finish and pre-fill every form with what they saved.
  if (storesLoading) {
    return (
      <OnboardingShell>
        <div className="flex flex-col items-center justify-center py-16 text-center" role="status">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Getting your setup ready…</p>
        </div>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell>
      <WizardSteps existingStore={existingStores?.[0] ?? null} />
    </OnboardingShell>
  );
}

interface WizardStepsProps {
  /** Shop the seller already owns, if any. */
  existingStore: StoreDto | null;
}

function WizardSteps({ existingStore }: WizardStepsProps) {
  const router = useRouter();
  const updateStore = useUpdateStore();
  const [currentStep, setCurrentStep] = useState<number>(() => initialStepIndex(!!existingStore));
  // Local copy of the shop, so every step sees the freshest details.
  const [savedStore, setSavedStore] = useState<StoreDto | null>(null);
  const [savedCategory, setSavedCategory] = useState('');
  const announcedResume = useRef(false);

  const store = savedStore ?? existingStore;
  const category = savedCategory || store?.businessCategory || '';
  const totalSteps = STEPS.length;

  // Remember progress as the seller moves along.
  useEffect(() => {
    saveStepIndex(currentStep);
  }, [currentStep]);

  // One friendly heads-up when we pick up an unfinished setup.
  useEffect(() => {
    if (announcedResume.current) return;
    announcedResume.current = true;
    if (readSavedStepIndex() > 0) {
      showToast('info', 'Welcome back!', {
        id: 'onboarding-resume',
        description: 'We saved your progress, so you can pick up right where you left off.',
      });
    }
  }, []);

  const goNext = useCallback(() => {
    setCurrentStep((step) => Math.min(step + 1, totalSteps - 1));
  }, [totalSteps]);

  const goBack = useCallback(() => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }, []);

  const finish = useCallback(
    async (destination: FinishDestination) => {
      // Setup is done — stop resuming into it.
      clearSavedStep();
      try {
        await axiosInstance.post('/api/v1/auth/onboarding/complete');
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().setUser({ ...currentUser, onboardingCompleted: true });
        }
      } catch {
        // Non-blocking: server derives completion from store existence as fallback
      }
      showToast('success', 'Your shop is ready! 🎉', {
        id: 'onboarding-complete',
        description:
          'Next, design your storefront, add your products and share your shop link with customers.',
      });
      router.push(destination);
    },
    [router]
  );

  // Saves the picked design. Returns false when it could not be saved, so the
  // seller stays on the step and can try again instead of losing their choice.
  const handleTemplateSave = useCallback(
    async (templateId: string): Promise<boolean> => {
      if (!store) return true; // No shop yet — nothing to save against.
      try {
        const updated = await updateStore.mutateAsync({
          id: store.id,
          data: { template: templateId },
        });
        setSavedStore(updated);
        return true;
      } catch {
        return false; // Toast already shown by the save hook
      }
    },
    [store, updateStore]
  );

  const businessInitialData: BusinessInfoFormData = {
    businessName: store?.name ?? '',
    businessCategory: store?.businessCategory ?? '',
    phone: store?.phone ?? '',
    email: store?.email ?? '',
    address: store?.address ?? '',
    description: store?.description ?? '',
  };

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'welcome':
        return <WelcomeStep key="welcome" onNext={goNext} />;
      case 'business-info':
        return (
          <BusinessInfoStep
            key="business-info"
            onNext={goNext}
            onBack={goBack}
            initialData={businessInitialData}
            existingStore={store}
            onSave={(data: BusinessInfoFormData) => setSavedCategory(data.businessCategory)}
            onStoreCreated={(s: StoreDto) => setSavedStore(s)}
          />
        );
      case 'branding':
        return (
          <StoreBrandingStep
            key="branding"
            onNext={goNext}
            onBack={goBack}
            store={store}
            onStoreUpdated={(s: StoreDto) => setSavedStore(s)}
          />
        );
      case 'template':
        return (
          <TemplateSelectStep
            key="template"
            category={category}
            selectedTemplate={store?.template}
            onSave={handleTemplateSave}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 'first-product':
        return (
          <FirstProductStep
            key="first-product"
            storeId={store?.id}
            onNext={goNext}
            onBack={goBack}
            onProductCreated={() => {}}
          />
        );
      case 'subscription':
        return <SubscriptionLaunchStep key="subscription" onNext={goNext} onBack={goBack} store={store} />;
      case 'invite-staff':
        return <InviteStaffStep key="invite-staff" onNext={goNext} onBack={goBack} />;
      case 'complete':
        return <CompletionStep key="complete" onFinish={finish} />;
      default:
        return null;
    }
  };

  return (
    <>
      <OnboardingStepper
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepLabel={STEPS[currentStep].label}
        onBack={goBack}
      />
      <div className="pt-8">{renderStep()}</div>
    </>
  );
}
