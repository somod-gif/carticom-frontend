// ============================================================
// CARTICOM STOREFRONT STUDIO — "Choose your shop's look"
// ============================================================
//
// One tap on a look applies the whole package (template + colours +
// font) so a non-technical seller never has to compose a theme.

'use client';

import { Check, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { TEMPLATES } from '@/features/templates/registry';
import {
  COLOR_PRESETS,
  FONT_OPTIONS,
  matchPreset,
} from '@/features/storefront-studio/types';
import type { BrandingDraft } from '@/features/storefront-studio/types';
import { EditorSection, FieldHint, FieldLabel } from './EditorSection';

interface LookCardProps {
  draft: BrandingDraft;
  setField: (patch: Partial<BrandingDraft>) => void;
}

export function LookCard({ draft, setField }: LookCardProps) {
  const activePreset = matchPreset(draft.primaryColor, draft.secondaryColor);

  // A template can introduce a font that isn't in the quick list —
  // surface it so the picker never shows a blank value.
  const fontOptions =
    draft.fontFamily && !FONT_OPTIONS.some((option) => option.value === draft.fontFamily)
      ? [
          ...FONT_OPTIONS,
          { value: draft.fontFamily, label: `${draft.fontFamily.split(',')[0]} (from your look)` },
        ]
      : FONT_OPTIONS;

  return (
    <div className="space-y-4">
      <EditorSection
        title="Choose your shop's look"
        hint="One tap sets the style, colours and font for your whole shop."
      >
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((template) => {
            const selected = (draft.template || '') === template.id;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() =>
                  setField({
                    template: template.id,
                    primaryColor: template.colors.primary,
                    secondaryColor: template.colors.secondary,
                    fontFamily: template.typography.headingFont,
                  })
                }
                aria-pressed={selected}
                className={cn(
                  'group relative overflow-hidden rounded-lg border p-3 text-left transition-all',
                  selected
                    ? 'border-blue-600 ring-2 ring-blue-600/30'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                )}
              >
                <div
                  className={cn(
                    'mb-2 flex h-10 items-center justify-between rounded-md bg-gradient-to-r px-2.5',
                    template.previewGradient
                  )}
                >
                  <span className="text-base leading-none">{template.previewIcon}</span>
                  <span
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: template.colors.primary }}
                    aria-hidden
                  />
                </div>
                <p className="truncate text-xs font-semibold text-gray-900">{template.name}</p>
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-gray-500">
                  {template.description}
                </p>
                {selected && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check className="h-3 w-3" aria-hidden />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <FieldHint>Picking a look also updates your colours and font below.</FieldHint>
      </EditorSection>

      <EditorSection
        title="Your colours"
        hint="Pick a ready-made pair, or choose your own."
      >
        <div className="grid grid-cols-4 gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() =>
                setField({ primaryColor: preset.primary, secondaryColor: preset.secondary })
              }
              aria-pressed={activePreset === preset.id}
              title={preset.name}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-all',
                activePreset === preset.id
                  ? 'border-blue-600 ring-2 ring-blue-600/30'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <span className="flex h-6 w-full overflow-hidden rounded-full" aria-hidden>
                <span className="flex-1" style={{ backgroundColor: preset.primary }} />
                <span className="flex-1" style={{ backgroundColor: preset.secondary }} />
              </span>
              <span className="text-[10px] font-medium text-gray-600">{preset.name}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor="studio-primary-color">Main colour</FieldLabel>
            <div className="flex items-center gap-2">
              <input
                id="studio-primary-color"
                type="color"
                value={draft.primaryColor || '#2563eb'}
                onChange={(event) => setField({ primaryColor: event.target.value })}
                className="h-9 w-11 cursor-pointer rounded-md border border-gray-300 bg-white p-1"
                aria-label="Main colour"
              />
              <span
                className="h-5 w-5 rounded-full border border-gray-200 dark:border-gray-700"
                style={{ backgroundColor: draft.primaryColor || '#2563eb' }}
                aria-hidden
              />
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="studio-secondary-color">Second colour</FieldLabel>
            <div className="flex items-center gap-2">
              <input
                id="studio-secondary-color"
                type="color"
                value={draft.secondaryColor || '#0f172a'}
                onChange={(event) => setField({ secondaryColor: event.target.value })}
                className="h-9 w-11 cursor-pointer rounded-md border border-gray-300 bg-white p-1"
                aria-label="Second colour"
              />
              <span
                className="h-5 w-5 rounded-full border border-gray-200 dark:border-gray-700"
                style={{ backgroundColor: draft.secondaryColor || '#0f172a' }}
                aria-hidden
              />
            </div>
          </div>
        </div>
        {!activePreset && (
          <FieldHint className="flex items-center gap-1">
            <Palette className="h-3 w-3" aria-hidden /> Your own custom colours
          </FieldHint>
        )}
      </EditorSection>

      <EditorSection
        title="Writing style"
        hint="The font used for headlines and text across your shop."
      >
        <Select
          value={draft.fontFamily || 'Inter, sans-serif'}
          onValueChange={(value) => setField({ fontFamily: value })}
        >
          <SelectTrigger className="w-full" aria-label="Writing style">
            <SelectValue placeholder="Choose a writing style" />
          </SelectTrigger>
          <SelectContent>
            {fontOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p
          className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800"
          style={{ fontFamily: draft.fontFamily || 'Inter, sans-serif' }}
        >
          Your shop name looks like this
        </p>
        <div className="mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setField({ fontFamily: 'Inter, sans-serif' })}
          >
            Reset writing style
          </Button>
        </div>
      </EditorSection>
    </div>
  );
}
