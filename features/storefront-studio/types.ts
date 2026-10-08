// ============================================================
// CARTICOM STOREFRONT STUDIO — Types, presets & plain-language copy
// ============================================================
//
// The Studio is aimed at non-technical sellers, so every user-facing
// label in this file is deliberately plain English: no "primaryColour",
// no "SEO", no "sectionConfig".

import type { StoreDto } from '@/features/onboarding/types';

// ─── Draft ────────────────────────────────────────────────────

/** The seller-editable slice of a store's storefront appearance. */
export interface BrandingDraft {
  template: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logoUrl: string;
  bannerUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  whatsappNumber: string;
  seoTitle: string;
  seoDescription: string;
  announcementBar: string;
  /** JSON array string, e.g. ["hero","showcase"]. Empty = template default. */
  sectionConfig: string;
}

export type BrandingPayload = Partial<BrandingDraft>;

// ─── Sections (plain-language labels) ────────────────────────

export interface SectionMeta {
  /** What the seller sees in the list. */
  label: string;
  /** One-line explanation shown under the label. */
  hint: string;
  /** Hero cannot be hidden — a shop without a welcome banner looks broken. */
  locked?: boolean;
}

export const SECTION_META: Record<string, SectionMeta> = {
  hero: { label: 'Welcome banner', hint: 'The big headline at the top of your shop', locked: true },
  announcement: { label: 'Announcement bar', hint: 'A short message across the very top' },
  showcase: { label: 'Product showcase', hint: 'Your products laid out for shoppers to tap' },
  categories: { label: 'Categories', hint: 'Group your products so shoppers find things fast' },
  storytelling: { label: 'Our story', hint: 'A short intro about your business' },
  values: { label: 'Why shop with us', hint: 'What makes your shop special' },
  features: { label: 'Shop highlights', hint: 'Quick notes like delivery and support' },
  testimonials: { label: 'Customer reviews', hint: 'What shoppers say about you' },
  membership: { label: 'WhatsApp community', hint: 'Invite shoppers to chat with you on WhatsApp' },
  instagram: { label: 'Social media', hint: 'Links to your Facebook, Instagram and X' },
  faq: { label: 'Common questions', hint: 'Answers to the things shoppers ask most' },
  newsletter: { label: 'Email updates', hint: 'Let shoppers get your news by email' },
};

export const ALL_SECTION_IDS = Object.keys(SECTION_META);

/** Fallback order used when neither the store nor the template says otherwise. */
export const DEFAULT_SECTION_ORDER: string[] = [
  'hero', 'announcement', 'showcase', 'categories', 'storytelling',
  'features', 'values', 'testimonials', 'membership', 'instagram',
  'faq', 'newsletter',
];

// ─── Colour presets ──────────────────────────────────────────

export interface ColorPreset {
  id: string;
  name: string;
  primary: string;
  secondary: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { id: 'ocean', name: 'Ocean', primary: '#2563eb', secondary: '#0f172a' },
  { id: 'midnight', name: 'Midnight', primary: '#0ea5e9', secondary: '#020617' },
  { id: 'forest', name: 'Forest', primary: '#16a34a', secondary: '#14532d' },
  { id: 'sunset', name: 'Sunset', primary: '#ea580c', secondary: '#7c2d12' },
  { id: 'royal', name: 'Royal', primary: '#7c3aed', secondary: '#312e81' },
  { id: 'rose', name: 'Rose', primary: '#db2777', secondary: '#831843' },
  { id: 'gold', name: 'Gold', primary: '#ca8a04', secondary: '#1c1917' },
  { id: 'mono', name: 'Classic', primary: '#111827', secondary: '#4b5563' },
];

// ─── Fonts ────────────────────────────────────────────────────

export interface FontOption {
  value: string;
  label: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { value: 'Inter, sans-serif', label: 'Modern (Inter)' },
  { value: 'Poppins, sans-serif', label: 'Friendly (Poppins)' },
  { value: 'DM Sans, sans-serif', label: 'Minimal (DM Sans)' },
  { value: 'Montserrat, sans-serif', label: 'Clean (Montserrat)' },
  { value: 'Space Grotesk, sans-serif', label: 'Bold (Space Grotesk)' },
  { value: 'Playfair Display, serif', label: 'Elegant (Playfair Display)' },
  { value: 'Merriweather, serif', label: 'Classic (Merriweather)' },
  { value: 'Lora, serif', label: 'Timeless (Lora)' },
];

export const DEFAULT_FONT = 'Inter, sans-serif';

// ─── Draft helpers ────────────────────────────────────────────

const str = (value: unknown): string =>
  typeof value === 'string' && value !== null ? value : '';

/** Builds an all-strings draft from a store returned by the API. */
export function buildDraft(store: StoreDto): BrandingDraft {
  return {
    template: str(store.template),
    primaryColor: str(store.primaryColor),
    secondaryColor: str(store.secondaryColor),
    fontFamily: str(store.fontFamily),
    logoUrl: str(store.logoUrl),
    bannerUrl: str(store.bannerUrl),
    facebookUrl: str(store.facebookUrl),
    instagramUrl: str(store.instagramUrl),
    twitterUrl: str(store.twitterUrl),
    whatsappNumber: str(store.whatsappNumber),
    seoTitle: str(store.seoTitle),
    seoDescription: str(store.seoDescription),
    announcementBar: str((store as StoreDto & { announcementBar?: string }).announcementBar),
    sectionConfig: str((store as StoreDto & { sectionConfig?: string }).sectionConfig),
  };
}

/** Parses a sectionConfig JSON string defensively; null when there is none. */
export function parseSectionConfig(raw: string): string[] | null {
  if (!raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const valid = parsed.filter(
      (item): item is string => typeof item === 'string' && ALL_SECTION_IDS.includes(item)
    );
    return valid.length > 0 ? valid : null;
  } catch {
    return null;
  }
}

/** Fields that changed between the saved baseline and the working draft. */
export function diffBranding(
  baseline: BrandingDraft,
  draft: BrandingDraft
): BrandingPayload {
  const payload: BrandingPayload = {};
  (Object.keys(draft) as (keyof BrandingDraft)[]).forEach((key) => {
    if (draft[key] !== baseline[key]) {
      (payload as Record<keyof BrandingDraft, string>)[key] = draft[key];
    }
  });
  return payload;
}

export function hasChanges(payload: BrandingPayload): boolean {
  return Object.keys(payload).length > 0;
}

/** True when the colour pair exactly matches one of the presets. */
export function matchPreset(primary: string, secondary: string): string | null {
  const found = COLOR_PRESETS.find(
    (preset) =>
      preset.primary.toLowerCase() === primary.toLowerCase() &&
      preset.secondary.toLowerCase() === secondary.toLowerCase()
  );
  return found?.id ?? null;
}

// ─── URL fields typed by hand ─────────────────────────────────

export const URL_FIELDS = ['facebookUrl', 'instagramUrl', 'twitterUrl'] as const;
export type UrlField = (typeof URL_FIELDS)[number];

/** Empty is valid (it clears the link); anything else must be http(s). */
export function isValidHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  return trimmed === '' || /^https?:\/\/\S+$/i.test(trimmed);
}

/**
 * Called when a seller leaves a link field: trims the value and adds
 * https:// when they typed a bare address like "instagram.com/mystore".
 */
export function normalizeUrlInput(value: string): string {
  const trimmed = value.trim();
  if (trimmed === '') return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, '')}`;
}
