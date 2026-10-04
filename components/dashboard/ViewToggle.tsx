'use client';

import { useEffect, useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';

export type ViewMode = 'list' | 'cards';

const STORAGE_KEY = 'carticom_dashboard_view';

export function useViewPreference(): [ViewMode, (v: ViewMode) => void] {
  const [view, setView] = useState<ViewMode>('list');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'cards' || stored === 'list') {
        setView(stored);
      } else if (window.innerWidth < 640) {
        setView('cards');
      }
    } catch {
      if (window.innerWidth < 640) setView('cards');
    }
  }, []);

  const update = (v: ViewMode) => {
    setView(v);
    try {
      window.localStorage.setItem(STORAGE_KEY, v);
    } catch {
      // storage unavailable — in-memory view still works
    }
  };

  return [view, update];
}

export function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  const base = 'inline-flex items-center justify-center h-9 min-w-[40px] px-2.5 rounded-md transition-colors';
  return (
    <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-0.5" role="group" aria-label="View mode">
      <button
        type="button"
        onClick={() => onChange('list')}
        aria-label="List view"
        aria-pressed={view === 'list'}
        className={`${base} ${view === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
      >
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange('cards')}
        aria-label="Card view"
        aria-pressed={view === 'cards'}
        className={`${base} ${view === 'cards' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
    </div>
  );
}
