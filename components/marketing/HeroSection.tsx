'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Store, ShoppingBag, Package, Users, MessageCircle, TrendingUp, Wallet, Sparkles, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const } },
});

const STATS = [
  { icon: Wallet, label: 'Sales today', value: '₦128,500', delta: '+12%' },
  { icon: ShoppingBag, label: 'Orders', value: '24', delta: '+8%' },
  { icon: Package, label: 'Products', value: '132', delta: '3 low' },
];

const BARS = [42, 58, 40, 66, 52, 78, 64];

const RECENT_ORDERS = [
  { id: '#1042', item: 'Linen Dress (M)', amount: '₦45,000', status: 'Paid', tone: 'text-brand-dark bg-brand-soft' },
  { id: '#1041', item: 'Leather Loafers', amount: '₦62,000', status: 'Paid', tone: 'text-brand-dark bg-brand-soft' },
  { id: '#1040', item: 'Handbag · Beige', amount: '₦38,000', status: 'Pending', tone: 'text-amber-600 bg-amber-50' },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-soft/60 via-white to-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 md:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-8 max-w-xl">
            <motion.div
              {...fadeUp(0.05)}
              className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-violet-600" />
              <span className="text-xs font-semibold tracking-wide text-violet-700">AI-Powered Commerce Infrastructure for Africa</span>
            </motion.div>

            <motion.h1
              {...fadeUp(0.15)}
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl leading-[1.08]"
            >
              The AI Commerce{' '}
              <span className="text-brand">Operating System</span>{' '}
              Built for Africa.
            </motion.h1>

            <motion.p {...fadeUp(0.25)} className="text-lg md:text-xl leading-relaxed text-gray-600">
              Turn WhatsApp and social-media conversations into sales. Manage products, customers, orders and operations — with AI handling the heavy lifting.
              <span className="mt-2 block text-base font-semibold text-gray-900 md:text-lg">
                Build. Sell. <span className="text-brand">Grow Smartly.</span>
              </span>
            </motion.p>

            <motion.div {...fadeUp(0.35)} className="flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="group h-13 rounded-xl bg-brand px-7 text-base shadow-lg shadow-brand/20 hover:bg-brand-dark"
              >
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-13 rounded-xl border-gray-300 px-7 text-base text-gray-700 hover:bg-gray-50"
              >
                <Link href="#how-it-works">
                  See How It Works
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div {...fadeUp(0.45)} className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
              <p className="text-sm font-medium text-gray-500">Built for the way African businesses sell.</p>
              <div className="flex items-center gap-4 text-gray-400">
                <span className="flex items-center gap-1.5 text-xs"><Bot className="h-3.5 w-3.5 text-violet-500" /> AI-Powered</span>
                <span className="flex items-center gap-1.5 text-xs"><MessageCircle className="h-3.5 w-3.5 text-brand" /> WhatsApp-first</span>
                <span className="flex items-center gap-1.5 text-xs"><Users className="h-3.5 w-3.5 text-brand" /> Team-ready</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand/5 via-brand/5 to-transparent blur-2xl" />

            <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl shadow-brand/10">
              <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/80 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-brand/70" />
                </div>
                <div className="ml-3 flex-1 rounded-lg bg-white border border-gray-200/70 px-3 py-1 text-xs text-gray-400">
                  app.carticom.com/dashboard
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Good day, Adaeze</p>
                    <p className="text-xs text-gray-500">Your store summary</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-dark">
                    <TrendingUp className="h-3.5 w-3.5" /> Growth
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {STATS.map((s) => (
                    <div key={s.label} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                      <div className="flex items-center justify-between">
                        <s.icon className="h-3.5 w-3.5 text-brand/60" />
                        <span className="text-[10px] font-semibold text-brand-dark">{s.delta}</span>
                      </div>
                      <p className="mt-2 text-sm font-bold text-brand">{s.value}</p>
                      <p className="text-[11px] text-gray-500">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-gray-100 p-3.5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-700">Sales this week</p>
                    <p className="text-[11px] text-gray-400">₦478,200</p>
                  </div>
                  <div className="flex items-end gap-1.5 h-16">
                    {BARS.map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.6, delay: 0.6 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                        className={cn('flex-1 rounded-t-md', i === BARS.length - 1 ? 'bg-brand' : 'bg-brand/20')}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100">
                  {RECENT_ORDERS.map((o, i) => (
                    <div
                      key={o.id}
                      className={cn(
                        'flex items-center justify-between gap-2 px-3.5 py-2.5',
                        i > 0 && 'border-t border-gray-100'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft">
                          <Package className="h-3.5 w-3.5 text-brand" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-800">{o.item}</p>
                          <p className="text-[10px] text-gray-400">{o.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-semibold text-gray-800">{o.amount}</span>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', o.tone)}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="absolute -left-4 -bottom-5 flex items-center gap-2.5 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-xl shadow-brand/10"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft">
                <MessageCircle className="h-4.5 w-4.5 text-brand-dark" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">New WhatsApp order</p>
                <p className="text-[11px] text-gray-500">₦45,000 · just now</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
