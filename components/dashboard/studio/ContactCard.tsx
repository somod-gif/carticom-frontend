// ============================================================
// CARTICOM STOREFRONT STUDIO — WhatsApp & social links
// ============================================================

'use client';

import { MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  normalizeUrlInput,
} from '@/features/storefront-studio/types';
import type { BrandingDraft } from '@/features/storefront-studio/types';
import { EditorSection, FieldHint, FieldLabel } from './EditorSection';

interface ContactCardProps {
  draft: BrandingDraft;
  setField: (patch: Partial<BrandingDraft>) => void;
}

interface LinkField {
  key: 'facebookUrl' | 'instagramUrl' | 'twitterUrl';
  label: string;
  placeholder: string;
  example: string;
}

const LINK_FIELDS: LinkField[] = [
  {
    key: 'facebookUrl',
    label: 'Facebook page',
    placeholder: 'facebook.com/yourpage',
    example: 'https://facebook.com/yourpage',
  },
  {
    key: 'instagramUrl',
    label: 'Instagram profile',
    placeholder: 'instagram.com/yourname',
    example: 'https://instagram.com/yourname',
  },
  {
    key: 'twitterUrl',
    label: 'X (Twitter) profile',
    placeholder: 'x.com/yourname',
    example: 'https://x.com/yourname',
  },
];

export function ContactCard({ draft, setField }: ContactCardProps) {
  return (
    <EditorSection
      title="How shoppers reach you"
      hint="These appear in your shop's footer so customers can chat and follow you."
    >
      <div className="space-y-4">
        <div>
          <FieldLabel htmlFor="studio-whatsapp">WhatsApp number</FieldLabel>
          <div className="relative">
            <MessageCircle
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500"
              aria-hidden
            />
            <Input
              id="studio-whatsapp"
              value={draft.whatsappNumber}
              onChange={(event) => setField({ whatsappNumber: event.target.value })}
              maxLength={30}
              placeholder="0801 234 5678"
              className="pl-9"
            />
          </div>
          <FieldHint>Shoppers tap this to chat with you on WhatsApp.</FieldHint>
        </div>

        <div className="space-y-3">
          {LINK_FIELDS.map((field) => (
            <div key={field.key}>
              <FieldLabel htmlFor={`studio-${field.key}`}>{field.label}</FieldLabel>
              <Input
                id={`studio-${field.key}`}
                value={draft[field.key]}
                onChange={(event) =>
                  setField({ [field.key]: event.target.value } as Partial<BrandingDraft>)
                }
                // Normalise "instagram.com/shop" → "https://instagram.com/shop"
                // the moment they leave the box.
                onBlur={(event) =>
                  setField({ [field.key]: normalizeUrlInput(event.target.value) } as Partial<BrandingDraft>)
                }
                maxLength={300}
                placeholder={field.placeholder}
                inputMode="url"
                autoComplete="off"
              />
            </div>
          ))}
          <FieldHint>
            Leave a box empty if you don&apos;t use it — we add https:// for you.
          </FieldHint>
        </div>
      </div>
    </EditorSection>
  );
}
