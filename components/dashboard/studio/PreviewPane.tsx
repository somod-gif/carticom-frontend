// ============================================================
// CARTICOM STOREFRONT STUDIO — Live preview pane
// ============================================================
//
// Renders the real storefront route in an iframe and streams draft
// edits into it via postMessage, so sellers see every change the
// moment they make it — no save button, no page reload.

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Monitor, RotateCcw, Smartphone, Tablet, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BrandingDraft } from '@/features/storefront-studio/types';

const STUDIO_MESSAGE_VERSION = 1;

type DeviceId = 'desktop' | 'tablet' | 'phone';

const DEVICES: { id: DeviceId; label: string; icon: typeof Monitor; width: number | null }[] = [
  { id: 'desktop', label: 'Computer', icon: Monitor, width: null },
  { id: 'tablet', label: 'Tablet', icon: Tablet, width: 834 },
  { id: 'phone', label: 'Phone', icon: Smartphone, width: 390 },
];

interface PreviewPaneProps {
  slug: string;
  draft: BrandingDraft;
  className?: string;
}

export function PreviewPane({ slug, draft, className }: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<DeviceId>('desktop');
  const [attempt, setAttempt] = useState(0);

  // Keep the latest draft available to the message listener without
  // touching refs during render.
  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const post = useCallback((message: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage(message, window.location.origin);
  }, []);

  // Handshake + inbound messages from the preview iframe.
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; version?: number; message?: string } | null;
      if (!data || typeof data.type !== 'string') return;
      if (data.version !== STUDIO_MESSAGE_VERSION) return;

      if (data.type === 'studio:ready') {
        setReady(true);
        setError(null);
        post({ type: 'studio:apply', version: STUDIO_MESSAGE_VERSION, store: draftRef.current });
      } else if (data.type === 'studio:error') {
        setError(data.message || "We couldn't load your preview.");
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [post]);

  // Stream every draft change into the preview (same-frame feedback).
  useEffect(() => {
    if (!ready) return;
    post({ type: 'studio:apply', version: STUDIO_MESSAGE_VERSION, store: draft });
  }, [draft, ready, post]);

  // A different shop means a different storefront loading — restart the
  // handshake. (React's documented "adjust state when a prop changes"
  // pattern: state is adjusted during render, guarded by the comparison.)
  const [lastSlug, setLastSlug] = useState(slug);
  if (lastSlug !== slug) {
    setLastSlug(slug);
    setError(null);
    setReady(false);
  }

  const reload = useCallback(() => {
    setError(null);
    setReady(false);
    setAttempt((value) => value + 1);
  }, []);

  const activeDevice = DEVICES.find((entry) => entry.id === device) ?? DEVICES[0];

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Device switcher */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 py-2">
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          {DEVICES.map((entry) => {
            const Icon = entry.icon;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setDevice(entry.id)}
                aria-pressed={device === entry.id}
                aria-label={`Preview on ${entry.label.toLowerCase()}`}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                  device === entry.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden sm:inline">{entry.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              'hidden items-center gap-1.5 text-xs text-gray-500 sm:flex',
              ready && 'text-emerald-600'
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                ready ? 'bg-emerald-500' : 'animate-pulse bg-amber-400'
              )}
            />
            {ready ? 'Live preview' : 'Loading preview…'}
          </span>
          <Button variant="ghost" size="sm" onClick={reload} aria-label="Reload preview">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Refresh
          </Button>
        </div>
      </div>

      {/* Preview surface */}
      <div className="relative flex-1 overflow-hidden bg-gray-100">
        <div
          className="mx-auto h-full transition-[width] duration-300"
          style={{
            width: activeDevice.width ? `${activeDevice.width}px` : '100%',
            maxWidth: '100%',
          }}
        >
          <iframe
            key={attempt}
            ref={iframeRef}
            src={`/store/preview/${slug}?studio=1`}
            title="Live preview of your shop"
            className="h-full w-full border-0 bg-white shadow-sm"
          />
        </div>

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-100/95 p-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
              <TriangleAlert className="h-5 w-5 text-amber-600" aria-hidden />
            </div>
            <p className="max-w-sm text-sm font-medium text-gray-800">{error}</p>
            <Button type="button" onClick={reload} size="sm">
              Try again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
