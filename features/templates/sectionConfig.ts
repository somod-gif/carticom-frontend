// ============================================================
// CARTICOM — Storefront section configuration
//
// The backend whitelists section tokens and stores them on the
// store as a JSON array string, e.g. `["hero","showcase","faq"]`.
// Parsing is defensive: anything malformed falls back to the
// template's own section list so a bad value can never blank a
// storefront.
// ============================================================

import type { TemplateSection } from './types';

/** Every token the backend accepts in `store.sectionConfig`. */
export const SECTION_CONFIG_TOKENS = [
  'hero',
  'showcase',
  'storytelling',
  'values',
  'membership',
  'testimonials',
  'features',
  'categories',
  'instagram',
  'faq',
  'newsletter',
  'announcement',
] as const;

export type SectionConfigToken = (typeof SECTION_CONFIG_TOKENS)[number];

/**
 * Parse `store.sectionConfig` (a JSON array string).
 *
 * Returns `null` when there is no usable configuration, which means
 * "keep the template's default behaviour" (default section order,
 * announcement bar visible when it has text).
 *
 * Returns an empty array only for an explicit `[]`, which renders
 * the hero alone (sections not listed are hidden).
 */
export function parseSectionConfig(raw?: string | null): SectionConfigToken[] | null {
  if (!raw || !raw.trim()) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    // Explicit `[]` → hero only (never fall back to template defaults).
    if (parsed.length === 0) return [];
    const tokens = parsed.filter(
      (token): token is SectionConfigToken =>
        typeof token === 'string' && (SECTION_CONFIG_TOKENS as readonly string[]).includes(token)
    );
    // A non-empty array with no recognisable tokens is treated as
    // malformed → template defaults, so a bad value can never blank a
    // storefront.
    return tokens.length > 0 ? tokens : null;
  } catch {
    return null;
  }
}

/**
 * Resolve the sections a template should render.
 *
 * - No configuration (`null`) → template default order.
 * - With configuration → configured order, intersected with the
 *   sections the template actually supports (the `announcement`
 *   token is handled by the page shell, not by templates).
 * - Explicit `[]` (or a list that resolves to nothing) → hero only,
 *   so the page is never blank but nothing extra is shown either.
 */
export function resolveTemplateSections(
  defaultSections: TemplateSection[],
  configured: SectionConfigToken[] | null
): TemplateSection[] {
  if (!configured) return defaultSections;
  const ordered = configured.filter(
    (token): token is TemplateSection =>
      token !== 'announcement' && (defaultSections as readonly string[]).includes(token)
  );
  return ordered.length > 0 ? ordered : ['hero'];
}

/**
 * Whether the announcement bar should be shown for this configuration.
 *
 * - No configuration → default behaviour: show it whenever there is text.
 * - With configuration → only when the `announcement` token is present.
 */
export function shouldShowAnnouncementBar(configured: SectionConfigToken[] | null): boolean {
  return configured === null ? true : configured.includes('announcement');
}
