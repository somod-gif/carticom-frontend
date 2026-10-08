// ============================================================
// CARTICOM STOREFRONT STUDIO — Google listing (SEO)
// ============================================================

'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { BrandingDraft } from '@/features/storefront-studio/types';
import { EditorSection, FieldHint, FieldLabel } from './EditorSection';

interface GoogleCardProps {
  draft: BrandingDraft;
  setField: (patch: Partial<BrandingDraft>) => void;
  storeName: string;
  storeSlug: string;
}

export function GoogleCard({ draft, setField, storeName, storeSlug }: GoogleCardProps) {
  const title = draft.seoTitle.trim() || storeName;
  const description =
    draft.seoDescription.trim() ||
    'Browse products and order online — fast replies on WhatsApp.';

  return (
    <EditorSection
      title="How you appear on Google"
      hint="This is what people see when your shop shows up in Google search results."
    >
      <div className="space-y-3">
        <div>
          <FieldLabel htmlFor="studio-seo-title">
            Search title ({draft.seoTitle.length}/70)
          </FieldLabel>
          <Input
            id="studio-seo-title"
            value={draft.seoTitle}
            onChange={(event) => setField({ seoTitle: event.target.value })}
            maxLength={70}
            placeholder={storeName}
          />
        </div>

        <div>
          <FieldLabel htmlFor="studio-seo-description">
            Search description ({draft.seoDescription.length}/160)
          </FieldLabel>
          <Textarea
            id="studio-seo-description"
            value={draft.seoDescription}
            onChange={(event) => setField({ seoDescription: event.target.value })}
            maxLength={160}
            rows={3}
            placeholder="One or two sentences about what you sell."
          />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="mb-1 text-[11px] text-gray-500">
            carticom.cv/store/{storeSlug}
          </p>
          <p className="truncate text-[15px] text-blue-700">{title}</p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-600">
            {description}
          </p>
        </div>
        <FieldHint>Leave these empty to use your shop name and description.</FieldHint>
      </div>
    </EditorSection>
  );
}
