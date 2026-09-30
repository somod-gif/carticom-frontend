'use client';

import { motion } from 'framer-motion';
import { MessageCircle, AtSign, Store, ClipboardList, Package, Laptop, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const PROBLEMS = [
  {
    icon: MessageCircle,
    title: 'Selling across too many places',
    desc: 'WhatsApp, Instagram and your physical shop — each with its own chats, prices and messy order lists.',
  },
  {
    icon: ClipboardList,
    title: 'Managing orders manually',
    desc: 'Copying customer details, confirming payments and chasing deliveries by hand. Mistakes are costly.',
  },
  {
    icon: Package,
    title: 'Losing track of inventory',
    desc: 'You find out you are out of stock only after the sale. No warnings, no reorder alerts.',
  },
  {
    icon: Laptop,
    title: 'No professional online store',
    desc: 'Building a real store means paying a developer — or giving up and staying manual.',
  },
];

export function ProblemSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-black">The problem</p>
          <h2 className="text-3xl font-bold tracking-tight text-brand md:text-4xl">
            Selling shouldn&apos;t be this hard.
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Most African businesses run on scattered tools — and it costs them sales every single day.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROBLEMS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="rounded-2xl border border-gray-100 bg-gray-50/40 p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                <p.icon className="h-5 w-5 text-gray-500" />
              </div>
              <h3 className="font-semibold text-gray-900">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-14 overflow-hidden rounded-3xl bg-brand text-white"
        >
          <div className="grid items-center gap-8 p-8 md:p-12 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-white" />
                <span className="text-xs font-semibold uppercase tracking-wider text-white">The simple solution</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight md:text-3xl">
                Carticom brings it all together.
              </h3>
              <p className="mt-3 max-w-xl text-gray-200 md:text-lg">
                One platform for your store, payments, orders, inventory, customers and team. Everything works together,
                so you can focus on selling — not on paperwork.
              </p>
              <Button
                asChild
                className="mt-6 h-12 rounded-xl border-white bg-brand px-7 text-base font-semibold text-white hover:bg-brand-dark"
              >
                <Link href="/register">
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="hidden lg:flex items-center justify-center gap-3">
              {[Store, AtSign, MessageCircle].map((Icon, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm"
                >
                  <Icon className="h-7 w-7 text-white" />
                </motion.div>
              ))}
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand shadow-lg shadow-brand/30">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
