// ============================================================
// CARTICOM STOREFRONT STUDIO — Page sections + announcement bar
// ============================================================
//
// Plain-language list of everything on the shop page. Sellers switch
// sections on/off and reorder them; the resulting order is stored as
// the backend's whitelisted sectionConfig JSON.

'use client';

import { useMemo } from 'react';
import { ArrowDown, ArrowUp, Megaphone, ShieldCheck } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  DEFAULT_SECTION_ORDER,
  SECTION_META,
  parseSectionConfig,
} from '@/features/storefront-studio/types';
import type { BrandingDraft } from '@/features/storefront-studio/types';
import { EditorSection, FieldHint, FieldLabel } from './EditorSection';

interface SectionsCardProps {
  draft: BrandingDraft;
  setField: (patch: Partial<BrandingDraft>) => void;
  /** Sections supported by the currently selected look. */
  templateSections: string[];
}

interface OrderedSection {
  id: string;
  visible: boolean;
}

const ANNOUNCEMENT_TOKEN = 'announcement';
const HERO = 'hero';

/** Builds the visible/hidden list the editor renders. */
function buildOrdered(parsed: string[] | null, base: string[]): OrderedSection[] {
  const cleanBase = (base.length ? base : DEFAULT_SECTION_ORDER).filter(
    (id) => id !== ANNOUNCEMENT_TOKEN
  );
  if (!parsed) {
    return cleanBase.map((id) => ({ id, visible: true }));
  }
  // The welcome banner is never hidden, even by an old/hand-edited config.
  const visible = parsed.includes(HERO)
    ? parsed.filter((id) => id !== ANNOUNCEMENT_TOKEN)
    : [HERO, ...parsed.filter((id) => id !== ANNOUNCEMENT_TOKEN && id !== HERO)];
  const hidden = cleanBase.filter((id) => !visible.includes(id) && id !== HERO);
  return [
    ...visible.map((id) => ({ id, visible: true })),
    ...hidden.map((id) => ({ id, visible: false })),
  ];
}

export function SectionsCard({ draft, setField, templateSections }: SectionsCardProps) {
  const parsed = useMemo(() => parseSectionConfig(draft.sectionConfig), [draft.sectionConfig]);
  const ordered = useMemo(() => buildOrdered(parsed, templateSections), [parsed, templateSections]);
  const announcementOn = parsed
    ? parsed.includes(ANNOUNCEMENT_TOKEN)
    : Boolean(draft.announcementBar.trim());

  /** Persists the current arrangement back to the draft. */
  const commit = (next: OrderedSection[], announcementVisible: boolean) => {
    const heroFirst = [
      ...(next.some((section) => section.id === HERO) ? [HERO] : []),
      ...next
        .filter((section) => section.id !== HERO && section.visible)
        .map((section) => section.id),
    ];
    const tokens = announcementVisible
      ? [ANNOUNCEMENT_TOKEN, ...heroFirst]
      : heroFirst;
    setField({ sectionConfig: JSON.stringify(tokens) });
  };

  const toggleSection = (id: string, visible: boolean) => {
    commit(
      ordered.map((section) => (section.id === id ? { ...section, visible } : section)),
      announcementOn
    );
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= ordered.length) return;
    const next = [...ordered];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next, announcementOn);
  };

  const setAnnouncementVisible = (visible: boolean) => {
    commit(ordered, visible);
  };

  const setAnnouncementText = (text: string) => {
    const patch: Partial<BrandingDraft> = { announcementBar: text };
    // Writing an announcement when the bar is switched off would silently
    // do nothing — switch it on for them instead.
    if (text.trim() && !announcementOn && parsed) {
      const tokens = parsed.filter((token) => token !== ANNOUNCEMENT_TOKEN);
      patch.sectionConfig = JSON.stringify([ANNOUNCEMENT_TOKEN, ...tokens]);
    }
    setField(patch);
  };

  return (
    <div className="space-y-4">
      <EditorSection
        title="Announcement bar"
        hint="A short message shown across the very top of your shop — great for deliveries, sales or holidays."
      >
        <div className="flex items-center justify-between gap-3">
          <FieldLabel htmlFor="studio-announcement">Message</FieldLabel>
          <div className="flex items-center gap-2">
            <Megaphone className="h-3.5 w-3.5 text-gray-400" aria-hidden />
            <Switch
              id="studio-announcement-toggle"
              checked={announcementOn}
              onCheckedChange={setAnnouncementVisible}
              aria-label="Show announcement bar"
            />
          </div>
        </div>
        <Input
          id="studio-announcement"
          value={draft.announcementBar}
          onChange={(event) => setAnnouncementText(event.target.value)}
          maxLength={200}
          placeholder="Free delivery this week!"
        />
        <FieldHint>{draft.announcementBar.length}/200 characters</FieldHint>
      </EditorSection>

      <EditorSection
        title="What appears on your shop page"
        hint="Switch sections on or off and use the arrows to change the order. Your welcome banner always stays on top."
      >
        <ul className="space-y-2">
          {ordered.map((section, index) => {
            const meta = SECTION_META[section.id];
            if (!meta) return null;
            const locked = meta.locked || section.id === HERO;
            return (
              <li
                key={section.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5',
                  !section.visible && 'bg-gray-50 opacity-70'
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-medium text-gray-900">{meta.label}</p>
                    {locked && (
                      <span title="Always shown" className="text-gray-400">
                        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-gray-500">{meta.hint}</p>
                </div>

                {!locked && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move ${meta.label} up`}
                      className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === ordered.length - 1}
                      aria-label={`Move ${meta.label} down`}
                      className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <Switch
                      checked={section.visible}
                      onCheckedChange={(checked) => toggleSection(section.id, checked)}
                      aria-label={`Show ${meta.label}`}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </EditorSection>
    </div>
  );
}
