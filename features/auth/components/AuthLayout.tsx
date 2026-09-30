// ============================================================
// CARTICOM AUTHENTICATION — Shared Auth Page Layout
// ============================================================

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, Bot, MessageCircle, ShoppingBag, Sparkles, TrendingUp } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  /** Hide social proof section */
  hideSocialProof?: boolean;
}

const FLOAT_CARDS = [
  {
    icon: ShoppingBag,
    title: 'New order · ₦45,000',
    subtitle: 'Ankara Wrap Dress × 2',
    badge: 'Paid',
    badgeTone: 'text-emerald-300 bg-emerald-400/15 ring-emerald-400/30',
    className: 'top-[16%] left-[8%] animate-[float_6s_ease-in-out_infinite]',
  },
  {
    icon: Bot,
    title: 'WhatsApp AI',
    subtitle: 'Answered 12 chats · closed 3 sales',
    badge: 'Live',
    badgeTone: 'text-sky-300 bg-sky-400/15 ring-sky-400/30',
    className: 'bottom-[20%] left-[14%] animate-[float_7s_ease-in-out_infinite_reverse]',
  },
  {
    icon: TrendingUp,
    title: 'Instagram ad → lead',
    subtitle: 'Converted in 4 minutes',
    badge: '+18%',
    badgeTone: 'text-violet-300 bg-violet-400/15 ring-violet-400/30',
    className: 'top-[26%] right-[8%] animate-[float_8s_ease-in-out_infinite]',
  },
];

export function AuthLayout({
  children,
  title,
  subtitle,
  hideSocialProof = false}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-950">
      {/* Left Panel - Form */}
      <div className="relative flex flex-1 flex-col justify-center overflow-hidden px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        {/* Soft background accents */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-violet-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-8"
          >
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <span className="relative h-9 w-9 overflow-hidden rounded-xl ring-1 ring-gray-200/80">
                <Image
                  src="/image/carticom_logo.png"
                  alt="Carticom"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </span>
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-brand transition-colors">
                Carticom
              </span>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
          >
            {children}
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500"
          >
            &copy; {new Date().getFullYear()} Carticom. All rights reserved.
          </motion.p>
        </div>
      </div>

      {/* Right Panel - Branding / Social Proof */}
      {!hideSocialProof && (
        <div className="relative hidden flex-1 lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
            {/* Pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #fff 1.5px, transparent 1.5px)",
                backgroundSize: "40px 40px"}}
            />
            {/* Glow accents */}
            <div className="absolute -top-24 -right-16 h-96 w-96 rounded-full bg-blue-500/25 blur-3xl" />
            <div className="absolute bottom-[-10%] left-[-8%] h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />
          </div>

          {/* Floating product cards */}
          {FLOAT_CARDS.map((card) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className={`absolute z-10 hidden w-56 rounded-2xl border border-white/15 bg-white/10 p-3.5 shadow-xl backdrop-blur-md xl:block ${card.className}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
                  <card.icon className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">{card.title}</p>
                  <p className="mt-0.5 truncate text-[11px] text-blue-200/90">{card.subtitle}</p>
                </div>
                <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ring-1 ${card.badgeTone}`}>
                  {card.badge}
                </span>
              </div>
            </motion.div>
          ))}

          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="max-w-lg text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 ring-1 ring-white/15"
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-300" />
                <span className="text-xs font-semibold tracking-wide text-blue-200">
                  AI-Powered Commerce Infrastructure for Africa
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-3xl font-bold text-white sm:text-4xl"
              >
                Build. Sell.{' '}
                <span className="text-blue-300">Grow Smartly.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-4 text-lg text-blue-100/90"
              >
                Your storefront, social ads, payments and AI assistant — one powerful
                platform for how Africa really sells.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-12 grid grid-cols-3 gap-6 text-center"
              >
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/10">
                  <p className="text-2xl font-bold text-white">50K+</p>
                  <p className="mt-1 text-xs text-blue-200">Active Sellers</p>
                </div>
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/10">
                  <p className="text-2xl font-bold text-white">$2.5B</p>
                  <p className="mt-1 text-xs text-blue-200">GMV Processed</p>
                </div>
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/10">
                  <p className="text-2xl font-bold text-white">45+</p>
                  <p className="mt-1 text-xs text-blue-200">Countries</p>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-10 inline-flex items-center gap-1.5 text-xs font-medium text-blue-200/80"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp-first selling
                <ArrowUpRight className="h-3.5 w-3.5" />
                Social ads coming soon
              </motion.p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
