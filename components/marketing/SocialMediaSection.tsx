'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Megaphone,
  MessageCircle,
  Sparkles,
  Target,
  UserPlus,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9a3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.68a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
    </svg>
  );
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const CHANNELS = [
  {
    icon: FacebookIcon,
    title: 'Facebook Ads',
    desc: 'Sync your catalog as a Facebook shop, run conversion ads, and retarget shoppers with the exact products they viewed — straight from your Carticom inventory.',
    tone: 'from-blue-500 to-blue-600',
    chip: 'Meta ads',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Ads & Click-to-Chat',
    desc: 'Sponsored click-to-chat ads drop customers into WhatsApp, where your AI assistant answers questions, recommends products and closes the order.',
    tone: 'from-emerald-500 to-green-600',
    chip: 'Conversational',
  },
  {
    icon: InstagramIcon,
    title: 'Instagram Shopping',
    desc: 'Shoppable posts and stories synced to your storefront catalog — one tap from inspiration to checkout, with every sale tracked back to the campaign.',
    tone: 'from-fuchsia-500 to-pink-600',
    chip: 'Visual commerce',
  },
  {
    icon: Target,
    title: 'Unified Leads Engine',
    desc: 'Every lead from every platform lands in one inbox — AI-scored, auto-tagged and ready for your team to follow up before the lead goes cold.',
    tone: 'from-violet-500 to-indigo-600',
    chip: 'Lead capture',
  },
];

const PIPELINE = [
  { label: 'Ad published', icon: Megaphone },
  { label: 'Lead captured', icon: UserPlus },
  { label: 'AI follows up on WhatsApp', icon: MessageCircle },
  { label: 'Order paid', icon: Zap },
  { label: 'Visible in dashboard', icon: Sparkles },
];

export function SocialMediaSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-white py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute -right-24 top-10 h-96 w-96 rounded-full bg-indigo-200/25 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <motion.div {...fadeUp(0)} className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-1.5 shadow-sm">
            <Zap className="h-3.5 w-3.5 text-sky-600" />
            <span className="text-xs font-semibold tracking-wide text-sky-700">
              Future Project &middot; Social Growth Engine
            </span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Turn Africa&rsquo;s social feed into{' '}
            <span className="text-sky-600">your sales channel</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            Next on our roadmap: your Carticom storefront plugs directly into Facebook,
            WhatsApp and Instagram — run ads, capture leads and close sales without ever
            leaving your dashboard.
          </p>
        </motion.div>

        {/* Channel cards */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map((c, i) => (
            <motion.article
              key={c.title}
              {...fadeUp(0.05 * i)}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100/60"
            >
              <div
                className={cn(
                  'mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm',
                  c.tone
                )}
              >
                <c.icon className="h-5 w-5 text-white" />
              </div>
              <div className="mb-1.5">
                <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                  {c.chip}
                </span>
              </div>
              <h3 className="text-base font-semibold leading-snug text-gray-900">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{c.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 opacity-80">
                Planned release
                <span className="h-1 w-1 rounded-full bg-sky-600" />
                Roadmap 2026
              </span>
            </motion.article>
          ))}
        </div>

        {/* Pipeline */}
        <motion.div
          {...fadeUp(0.15)}
          className="mt-12 rounded-3xl border border-gray-200/80 bg-white/80 p-5 shadow-sm backdrop-blur md:p-6"
        >
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
            How a social sale flows through Carticom
          </p>
          <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:justify-between">
            {PIPELINE.map((step, i) => (
              <div key={step.label} className="flex items-center gap-3 md:flex-1">
                <div className="flex items-center gap-2.5 rounded-xl bg-sky-50 px-3 py-2.5 ring-1 ring-sky-100">
                  <step.icon className="h-4 w-4 shrink-0 text-sky-600" />
                  <span className="text-xs font-semibold text-gray-800">{step.label}</span>
                </div>
                {i < PIPELINE.length - 1 && (
                  <ArrowRight className="hidden h-4 w-4 shrink-0 text-gray-300 md:block" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Positioning band */}
        <motion.div
          {...fadeUp(0.2)}
          className="mt-14 overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-gray-900 to-slate-800 px-6 py-10 text-center shadow-xl md:px-12 md:py-12"
        >
          <div className="pointer-events-none absolute" />
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 ring-1 ring-white/15">
              <Sparkles className="h-3.5 w-3.5 text-sky-400" />
              <span className="text-xs font-semibold tracking-wide text-sky-300">
                Our North Star
              </span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              We are building the AI-powered commerce infrastructure for Africa
            </h3>
            <p className="mt-3 text-base text-gray-300 md:text-lg">
              One platform to launch your store, sell across social channels and grow with
              AI &mdash; from the first ad impression to the repeat customer.
            </p>
            <p className="mt-5 text-xl font-semibold tracking-[0.2em] text-white md:text-2xl">
              Build. <span className="text-sky-400">Sell.</span> Grow Smartly.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                className="h-11 rounded-xl bg-white px-6 text-sm font-semibold text-gray-900 hover:bg-gray-100"
              >
                <Link href="/register">
                  Start building free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-xl border-white/25 bg-transparent px-6 text-sm font-semibold text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/demo">
                  <Megaphone className="mr-2 h-4 w-4" /> See the live demo
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
