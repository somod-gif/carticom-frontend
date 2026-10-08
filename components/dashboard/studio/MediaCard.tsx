// ============================================================
// CARTICOM STOREFRONT STUDIO — Logo & banner pictures
// ============================================================

'use client';

import Image from 'next/image';
import { FileUpload } from '@/components/ui/FileUpload';
import type { BrandingDraft } from '@/features/storefront-studio/types';
import { EditorSection, FieldHint } from './EditorSection';

interface MediaCardProps {
  draft: BrandingDraft;
  setField: (patch: Partial<BrandingDraft>) => void;
}

export function MediaCard({ draft, setField }: MediaCardProps) {
  return (
    <EditorSection
      title="Your pictures"
      hint="Add your logo and a big cover picture. Shoppers see these first."
    >
      <div className="space-y-4">
        <div>
          <p className="mb-1 text-xs font-medium text-gray-700">Logo</p>
          <FileUpload
            folder="store-logo"
            label=""
            currentUrl={draft.logoUrl || undefined}
            onUploaded={(url) => setField({ logoUrl: url })}
          />
          <FieldHint>Small square image — best as a PNG.</FieldHint>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-gray-700">Cover picture</p>
          <FileUpload
            folder="store-banner"
            label=""
            currentUrl={draft.bannerUrl || undefined}
            onUploaded={(url) => setField({ bannerUrl: url })}
          />
          <FieldHint>Wide picture shown behind your shop&apos;s welcome message.</FieldHint>
        </div>

        {draft.logoUrl && (
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-white">
              <Image
                src={draft.logoUrl}
                alt="Your logo"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <p className="text-xs text-gray-600">
              This is how your logo looks next to your shop name.
            </p>
          </div>
        )}
      </div>
    </EditorSection>
  );
}
