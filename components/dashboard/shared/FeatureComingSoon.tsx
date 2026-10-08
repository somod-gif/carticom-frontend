'use client';

import { EmptyState } from '@/components/dashboard/shared/StateComponents';

interface FeatureComingSoonProps {
  title: string;
  description?: string;
}

export function FeatureComingSoon({ title, description }: FeatureComingSoonProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Coming soon</p>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8">
        <EmptyState
          title={`${title} is coming soon`}
          description={description ?? `We're building this feature. It will be available in an upcoming release.`}
          action={{
            label: 'Tell us what you need',
            onClick: () => {
              window.location.href = '/dashboard/support';
            },
          }}
        />
      </div>
    </div>
  );
}