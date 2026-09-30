'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Quote, SearchCheck, Star } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

function Counter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (value === 0) {
      setN(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 1300;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {prefix}
      {n}
      {suffix}
    </span>
  );
}

const STATS = [
  { node: <Counter value={20} suffix="+" />, label: 'Nigerian vendors surveyed' },
  { node: <Counter value={16} />, label: 'Ready-made storefront templates' },
  { node: <Counter value={5} />, label: 'African APIs integrated' },
  { node: <Counter value={0} prefix="₦" />, label: 'Commission on your sales' },
];

function MaleAvatar() {
  return (
    <span className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 ring-2 ring-white shadow-sm">
      <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
        <circle cx="20" cy="15" r="6.5" fill="#fff" />
        <path d="M7.5 36c1.6-7.4 6.7-11 12.5-11s10.9 3.6 12.5 11" fill="#fff" />
      </svg>
    </span>
  );
}

function FemaleAvatar() {
  return (
    <span className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-pink-500 to-rose-500 ring-2 ring-white shadow-sm">
      <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
        <circle cx="20" cy="9" r="3.4" fill="#fff" />
        <circle cx="20" cy="16" r="7.6" fill="#fff" />
        <path d="M7.5 36c1.6-7.4 6.7-11 12.5-11s10.9 3.6 12.5 11" fill="#fff" />
      </svg>
    </span>
  );
}

const TESTIMONIALS = [
  {
    name: 'Adeniyi Olawale',
    business: 'Electronics vendor · Lagos',
    quote:
      'Orders used to disappear inside WhatsApp chats. Now every order, payment and stock update sits in one dashboard — I finally know what my business actually made.',
    gender: 'male' as const,
  },
  {
    name: 'Aisha Mohammed',
    business: 'Fashion & apparel · Kano',
    quote:
      'My customers pay by card and transfer right at checkout, and the receipt reaches them instantly through SendByte. That trust alone changed my sales.',
    gender: 'female' as const,
  },
  {
    name: 'Barakat Mustofa',
    business: 'Groceries & home · Ibadan',
    quote:
      'The low-stock alerts saved me on market days. I no longer find out I am out of stock after the sale — the dashboard tells me before it happens.',
    gender: 'female' as const,
  },
  {
    name: 'Falodun Tumise',
    business: 'Beauty & wellness · Abuja',
    quote:
      'I picked a template, added my products and had a real store live the same afternoon. No developer, no design fees — my shop finally looks like a brand.',
    gender: 'male' as const,
  },
];

export function ProofSection() {
  return (
    <section className="bg-gradient-to-b from-white via-blue-50/40 to-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Header */}
        <motion.div {...fadeUp(0)} className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5">
            <SearchCheck className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs font-semibold tracking-wide text-blue-700">
              Research-backed &middot; Built with the Africa Is Building stack
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Real vendors. Real feedback. <span className="text-brand">Real proof.</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Every feature in Carticom came out of listening to how African vendors actually sell
            — not from a playbook written for somewhere else.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="mb-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              {...fadeUp(0.05 * i)}
              className="rounded-2xl border border-gray-200/80 bg-white p-5 text-center shadow-sm transition-shadow hover:shadow-md md:p-6"
            >
              <p className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                {s.node}
              </p>
              <p className="mt-2 text-xs font-medium leading-snug text-gray-500 md:text-sm">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <motion.p {...fadeUp(0)} className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
          What vendors told us
        </motion.p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              {...fadeUp(0.05 * i)}
              className="flex flex-col rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg"
            >
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <Quote className="mb-2 h-5 w-5 text-brand/40" />
              <blockquote className="flex-1 text-sm leading-relaxed text-gray-600">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
                {t.gender === 'male' ? <MaleAvatar /> : <FemaleAvatar />}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="truncate text-xs text-gray-500">{t.business}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
