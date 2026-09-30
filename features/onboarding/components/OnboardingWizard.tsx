'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { useAuthStore } from '@/features/auth/store/auth.store';

const STEPS = [
  'business-info',
  'template-branding',
  'first-product',
  'launch',
  'complete',
] as const;

export function OnboardingWizard() {
  const router = useRouter();
  const updateStore = useUpdateStore();
  const { data: existingStores } = useMyStores();
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = STEPS.length;
  const [store, setStore] = useState<StoreDto | null>(null);
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (existingStores && existingStores.length > 0) {
      setStore(existingStores[0]);
      setCategory(existingStores[0].businessCategory ?? '');
    }
  }, [existingStores]);

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, totalSteps]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const finish = useCallback(async () => {
    try {
      await axiosInstance.post('/api/v1/auth/onboarding/complete');
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.getState().setUser({ ...currentUser, onboardingCompleted: true });
      }
    } catch {
      // Non-blocking: server derives completion from store existence as fallback
    }
    router.push('/dashboard');
  }, [router]);

  const renderStep = () => {
    const step = STEPS[currentStep];
    switch (step) {
      case 'business-info':
        return (
          <BusinessInfoStep
            key="business-info"
            onNext={goNext}
            onBack={goBack}
            onSave={(data: BusinessInfoFormData) => setCategory(data.businessCategory)}
            onStoreCreated={(s: StoreDto) => setStore(s)}
          />
        );
      case 'template-branding':
        return (
          <div key="template-branding">
            <StoreBrandingStep
              onNext={goNext}
              onBack={goBack}
              storeId={store?.id}
              onStoreUpdated={(s: StoreDto) => setStore(s)}
            />
            <div className="mt-6">
              <TemplateSelectStep
                category={category}
                onSelect={async (templ) => {
                  if (store) {
                    try {
                      const updated = await updateStore.mutateAsync({ id: store.id, data: { template: templ } });
                      setStore(updated);
                    } catch {
                      // template save failed - toast already shown by hook
                    }
                  }
                }}
                onNext={goNext}
                onBack={goBack}
              />
            </div>
          </div>
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
      case 'launch':
        return (
          <div key="launch">
            <SubscriptionLaunchStep onNext={goNext} onBack={goBack} store={store} />
            <div className="mt-6">
              <InviteStaffStep onNext={goNext} onBack={goBack} />
            </div>
          </div>
        );
      case 'complete':
        return <CompletionStep key="complete" onComplete={finish} />;
      default:
        return null;
    }
  };

  return (
    <OnboardingShell>
      <OnboardingStepper
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={goNext}
        onBack={goBack}
      />
      <div className="pt-8">
        {renderStep()}
      </div>
    </OnboardingShell>
  );
}
