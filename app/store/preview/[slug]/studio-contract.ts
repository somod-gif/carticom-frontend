// ============================================================
// CARTICOM — Studio live-preview postMessage contract
//
// Shared by BOTH sides of the live-preview iframe so they can
// never drift apart:
//
//   • parent  — the seller dashboard editor (frames the preview)
//   • child   — `/store/preview/[slug]?studio=1` (this route)
//
// Import this module from the dashboard instead of re-declaring
// the message shapes.
//
// Handshake
//   1. Preview mounts (studio mode)  → { type: 'studio:ready',   version: 1 }
//   2. Editor pushes a draft         → { type: 'studio:apply',   version: 1, store: {...} }
//   3. Editor discards the draft     → { type: 'studio:reset',   version: 1 }
//   4. Preview reports a load fault  → { type: 'studio:error',   version: 1, message }
//      Preview reports a user action → { type: 'studio:interaction', version: 1, value }
//
// Rules
//   • Every message carries `version`. Anything whose version does not
//     equal `STUDIO_MESSAGE_VERSION` is ignored (never an error).
//   • The preview accepts inbound messages ONLY when
//     `event.origin === window.location.origin` AND
//     `event.source === window.parent`.
//   • The preview posts to `window.parent` with `targetOrigin: '*'`.
//   • `studio:apply` is a pure state merge — it must never trigger a
//     network refetch. Only a slug change reloads the store.
// ============================================================

import type { StoreDto } from '@/features/onboarding/types';

/** Bump only for a breaking change to either direction of the protocol. */
export const STUDIO_MESSAGE_VERSION = 1;

/** Query flag that turns the gallery demo into the studio live preview. */
export const STUDIO_PARAM_KEY = 'studio';
export const STUDIO_PARAM_VALUE = '1';

/** Build the iframe URL for a store slug, e.g. `/store/preview/acme?studio=1`. */
export function studioPreviewPath(slug: string): string {
  return `/store/preview/${encodeURIComponent(slug)}?${STUDIO_PARAM_KEY}=${STUDIO_PARAM_VALUE}`;
}

/** True when a location search string (`?studio=1`) selects studio mode. */
export function isStudioPreviewSearch(search: string | null | undefined): boolean {
  if (!search) return false;
  try {
    return new URLSearchParams(search.startsWith('?') ? search.slice(1) : search).get(STUDIO_PARAM_KEY) === STUDIO_PARAM_VALUE;
  } catch {
    return false;
  }
}

/**
 * The draft the editor posts with `studio:apply`.
 *
 * A partial store: only the fields being edited are present, and they are
 * merged over the store loaded from the API. The two extras below are not
 * (yet) part of `StoreDto` but are rendered by the preview shell, so they
 * are part of the contract.
 */
export type StudioStoreDraft = Partial<StoreDto> & {
  /** Announcement bar copy rendered above the storefront. `null`/empty clears it. */
  announcementBar?: string | null;
  /** JSON array string of section tokens — see `features/templates/sectionConfig`. */
  sectionConfig?: string;
};

/** Messages the dashboard editor posts INTO the preview iframe. */
export type StudioPreviewMessage =
  | { type: 'studio:apply'; version: typeof STUDIO_MESSAGE_VERSION; store: StudioStoreDraft }
  | { type: 'studio:reset'; version: typeof STUDIO_MESSAGE_VERSION };

/** Values reported through `studio:interaction`. */
export type StudioInteractionValue = 'add-to-cart';

/** Messages the preview iframe posts OUT to the dashboard editor. */
export type StudioPreviewOutboundMessage =
  | { type: 'studio:ready'; version: typeof STUDIO_MESSAGE_VERSION }
  | { type: 'studio:error'; version: typeof STUDIO_MESSAGE_VERSION; message: string }
  | { type: 'studio:interaction'; version: typeof STUDIO_MESSAGE_VERSION; value: StudioInteractionValue };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard for messages arriving at the preview. Deliberately total:
 * malformed payloads simply return `false`, never throw.
 */
export function isStudioPreviewMessage(data: unknown): data is StudioPreviewMessage {
  if (!isRecord(data)) return false;
  if (data.version !== STUDIO_MESSAGE_VERSION) return false;
  if (data.type === 'studio:reset') return true;
  if (data.type === 'studio:apply') return isRecord(data.store);
  return false;
}

/**
 * Type guard for messages arriving at the dashboard from the preview.
 * Same total behaviour as `isStudioPreviewMessage`.
 */
export function isStudioPreviewOutboundMessage(data: unknown): data is StudioPreviewOutboundMessage {
  if (!isRecord(data)) return false;
  if (data.version !== STUDIO_MESSAGE_VERSION) return false;
  if (data.type === 'studio:ready') return true;
  if (data.type === 'studio:error') return typeof data.message === 'string';
  if (data.type === 'studio:interaction') return data.value === 'add-to-cart';
  return false;
}

/**
 * Client-side sanitizer for `store.customCss`.
 *
 * Returns the CSS to inject, or `null` when anything suspicious is present
 * — in which case nothing is rendered at all (fail closed, never partially).
 */
export function sanitizeCustomCss(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const css = raw.trim();
  if (!css) return null;
  const lower = css.toLowerCase();
  const forbidden = ['<', '>', '@import', 'expression(', 'javascript:', 'data:text/html'];
  for (const token of forbidden) {
    if (lower.includes(token)) return null;
  }
  return css;
}

/**
 * Normalises `store.announcementBar` to plain text safe to render.
 * Non-strings and blank values collapse to `''` (nothing rendered).
 */
export function sanitizeAnnouncementBar(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const text = raw.trim();
  if (!text) return '';
  // Strip control characters; React escapes markup, so `<` is harmless here.
  return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}
