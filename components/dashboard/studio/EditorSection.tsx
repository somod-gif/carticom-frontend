// ============================================================
// CARTICOM STOREFRONT STUDIO — Shared editor chrome
// ============================================================

'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Card heading with a plain-English explanation underneath. */
export function EditorSection({
  title,
  hint,
  children,
  className,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-xl border border-gray-200 bg-white p-4 shadow-sm', className)}>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {hint && <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{hint}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** Small caption used under inputs. */
export function FieldHint({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('mt-1 text-xs text-gray-500', className)}>{children}</p>;
}

/** Consistent label above every editor input. */
export function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-gray-700">
      {children}
    </label>
  );
}
