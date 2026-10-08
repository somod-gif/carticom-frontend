// ============================================================
// CARTICOM STOREFRONT STUDIO — Save status pill
// ============================================================

'use client';

import { CircleCheck, CloudUpload, RefreshCw, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SaveState } from '@/features/storefront-studio/useStudioDraft';

interface SaveStatusProps {
  saveState: SaveState;
  statusMessage: string;
  onRetry: () => void;
}

export function SaveStatus({ saveState, statusMessage, onRetry }: SaveStatusProps) {
  if (saveState === 'error') {
    return (
      <div className="flex items-center gap-2 rounded-full bg-red-50 py-1 pl-2.5 pr-1.5 text-xs font-medium text-red-700">
        <TriangleAlert className="h-3.5 w-3.5" aria-hidden />
        <span>{statusMessage}</span>
        <Button
          type="button"
          size="xs"
          variant="outline"
          onClick={onRetry}
          className="h-6 border-red-200 bg-white px-2 text-red-700 hover:bg-red-100"
        >
          <RefreshCw className="h-3 w-3" aria-hidden />
          Retry
        </Button>
      </div>
    );
  }

  const busy = saveState === 'saving' || saveState === 'pending';

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium',
        busy ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
      )}
      role="status"
      aria-live="polite"
    >
      {busy ? (
        <CloudUpload className="h-3.5 w-3.5 animate-pulse" aria-hidden />
      ) : (
        <CircleCheck className="h-3.5 w-3.5" aria-hidden />
      )}
      {statusMessage}
    </div>
  );
}
