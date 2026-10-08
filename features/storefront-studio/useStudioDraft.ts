// ============================================================
// CARTICOM STOREFRONT STUDIO — Draft state + autosave
// ============================================================
//
// The seller edits a local draft; every change is auto-saved ~800ms
// after they stop typing. Only changed fields are sent. A failed save
// keeps the draft intact and surfaces a one-tap retry.

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { brandingApi } from './service';
import { extractErrorMessage } from '@/lib/axios';
import {
  buildDraft,
  diffBranding,
  hasChanges,
  isValidHttpUrl,
  URL_FIELDS,
} from './types';
import type { BrandingDraft, BrandingPayload } from './types';
import type { StoreDto } from '@/features/onboarding/types';
import { showToast } from '@/lib/notifications/toast';

export type SaveState = 'clean' | 'pending' | 'saving' | 'error';

const AUTOSAVE_DELAY_MS = 800;

const EMPTY_DRAFT: BrandingDraft = {
  template: '',
  primaryColor: '',
  secondaryColor: '',
  fontFamily: '',
  logoUrl: '',
  bannerUrl: '',
  facebookUrl: '',
  instagramUrl: '',
  twitterUrl: '',
  whatsappNumber: '',
  seoTitle: '',
  seoDescription: '',
  announcementBar: '',
  sectionConfig: '',
};

export interface UseStudioDraftResult {
  /** The seller's working copy — every editor control writes here. */
  draft: BrandingDraft;
  setField: (patch: Partial<BrandingDraft>) => void;
  saveState: SaveState;
  /** Plain-language sentence for the header status pill. */
  statusMessage: string;
  saveNow: () => Promise<void>;
  /** True once the store has loaded and the draft is ready to edit. */
  ready: boolean;
}

export function useStudioDraft(store: StoreDto | undefined): UseStudioDraftResult {
  const [draft, setDraft] = useState<BrandingDraft>(EMPTY_DRAFT);
  const [saveState, setSaveState] = useState<SaveState>('clean');
  const [ready, setReady] = useState(false);

  const baselineRef = useRef<BrandingDraft>(EMPTY_DRAFT);
  const draftRef = useRef<BrandingDraft>(EMPTY_DRAFT);
  const storeIdRef = useRef<string | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  // Stable indirection so the debounced timer can always call the latest save.
  const performSaveRef = useRef<() => Promise<void>>(async () => {});

  // Initialise draft + baseline when the store first arrives.
  useEffect(() => {
    if (store && storeIdRef.current !== store.id) {
      storeIdRef.current = store.id;
      const initial = buildDraft(store);
      baselineRef.current = initial;
      draftRef.current = initial;
      setDraft(initial);
      setSaveState('clean');
      setReady(true);
    }
  }, [store]);

  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void performSaveRef.current();
    }, AUTOSAVE_DELAY_MS);
  }, []);

  const performSave = useCallback(async () => {
    const storeId = storeIdRef.current;
    if (!storeId || savingRef.current) return;

    const payload = diffBranding(baselineRef.current, draftRef.current);
    // A half-typed link (e.g. "instagram.com/shop") is not sendable yet —
    // it gets normalised when the field loses focus; skip it for now.
    for (const field of URL_FIELDS) {
      if (field in payload && !isValidHttpUrl(String(payload[field] ?? ''))) {
        delete (payload as Record<string, unknown>)[field];
      }
    }
    if (!hasChanges(payload)) {
      setSaveState('clean');
      return;
    }

    savingRef.current = true;
    setSaveState('saving');
    try {
      await brandingApi.update(storeId, payload);
      // Only the fields we just sent become clean — edits made while the
      // request was in flight stay dirty and trigger the next autosave.
      baselineRef.current = { ...baselineRef.current, ...payload };
      const stillDirty = hasChanges(diffBranding(baselineRef.current, draftRef.current));
      setSaveState(stillDirty ? 'pending' : 'clean');
      if (stillDirty) scheduleSave();
    } catch (error) {
      setSaveState('error');
      showToast('error', "We couldn't save your latest change", {
        description:
          extractErrorMessage(error) || 'Check your connection, then tap Retry.',
        id: 'studio-save-error',
      });
    } finally {
      savingRef.current = false;
    }
  }, [scheduleSave]);

  useEffect(() => {
    performSaveRef.current = performSave;
  }, [performSave]);

  const setField = useCallback(
    (patch: Partial<BrandingDraft>) => {
      draftRef.current = { ...draftRef.current, ...patch };
      setDraft(draftRef.current);
      setSaveState('pending');
      scheduleSave();
    },
    [scheduleSave]
  );

  // Retry path for failed saves.
  const saveNow = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await performSaveRef.current();
  }, []);

  // Never leave a pending save un-flushed when the page unmounts.
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        void performSaveRef.current();
      }
    };
  }, []);

  const statusMessage =
    saveState === 'saving'
      ? 'Saving your changes…'
      : saveState === 'pending'
        ? 'Saving…'
        : saveState === 'error'
          ? "Couldn't save"
          : 'All changes saved';

  return {
    draft,
    setField,
    saveState,
    statusMessage,
    saveNow,
    ready,
  };
}

// Re-export for consumers that only need the payload shape.
export type { BrandingDraft, BrandingPayload };
