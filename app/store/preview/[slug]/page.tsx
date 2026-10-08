'use client';

// ============================================================
// `/store/preview/[slug]` — storefront preview.
//
//   Mode A (default)        → template gallery demo with mock products,
//                              "Preview Mode" banner and back link.
//   Mode B (`?studio=1`)    → live preview embedded in the dashboard
//                              editor, driven by postMessage drafts.
//
// Mode selection reads `useSearchParams`, which Next 16 requires to sit
// inside a Suspense boundary (static-render safety net).
// ============================================================

import { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ErrorState, LoadingState } from '@/components/dashboard/shared/StateComponents';
import { STUDIO_PARAM_KEY, STUDIO_PARAM_VALUE } from './studio-contract';
import { TemplateGalleryPreview } from './gallery-preview';
import { StudioLivePreview } from './studio-preview';

function PreviewRoute({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const isStudio = searchParams.get(STUDIO_PARAM_KEY) === STUDIO_PARAM_VALUE;

  if (isStudio) return <StudioLivePreview key={slug} slug={slug} />;
  return <TemplateGalleryPreview key={slug} slug={slug} />;
}

export default function TemplatePreviewPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';

  if (!slug)
    return (
      <ErrorState
        title="We couldn't open this preview"
        description="This preview link is missing a template."
      />
    );

  return (
    <Suspense fallback={<LoadingState message="Loading preview..." />}>
      <PreviewRoute slug={slug} />
    </Suspense>
  );
}
