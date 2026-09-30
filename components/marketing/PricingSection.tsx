'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import axiosInstance from '@/lib/axios';

interface SubscriptionPlanDTO {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  productLimit: number;
  staffLimit: number;
  paymentsEnabled: boolean;
  customDomainEnabled: boolean;
  durationDays: number | null;
}

interface Plan {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  popular: boolean;
  savePct: number | null;
}

const PLAN_ORDER: Record<string, number> = {
  Starter: 0, Growth: 1, Business: 2, Enterprise: 3,
};

const PAID_PLAN_NAMES = new Set(Object.keys(PLAN_ORDER));

function formatPrice(amount: number): string {
  if (amount === 0) return 'Free';
  return `₦${amount.toLocaleString()}`;
}

function buildFeatures(dto: SubscriptionPlanDTO): string[] {
  const features: string[] = [];
  features.push(`${dto.productLimit >= 99999 ? 'Unlimited' : `${dto.productLimit.toLocaleString()} products`}`);
  features.push(`${dto.staffLimit >= 99999 ? 'Unlimited staff' : `${dto.staffLimit} staff accounts`}`);
  features.push('Payments via Paystack');
  features.push('WhatsApp AI assistant');
  if (dto.customDomainEnabled) features.push('Custom domain');
  features.push('Order management & inventory');
  if (dto.name === 'Growth' || dto.name === 'Business' || dto.name === 'Enterprise') features.push('Advanced analytics');
  if (dto.name === 'Business' || dto.name === 'Enterprise') features.push('Dedicated account manager');
  if (dto.name === 'Enterprise') features.push('SLA guarantee & 24/7 support');
  return features.slice(0, 6);
}

export function PricingSection() {
  const [yearly, setYearly] = useState(false);

  const { data: plans, isLoading, error } = useQuery<SubscriptionPlanDTO[]>({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/v1/subscriptions/plans');
      return res.data?.data ?? [];
    },
    staleTime: 5 * 60_000,
  });

  const displayPlans: Plan[] = useMemo(() => {
    if (!plans) return [];
    const sorted = [...plans]
      .filter((p) => PAID_PLAN_NAMES.has(p.name))
      .sort((a, b) => (PLAN_ORDER[a.name] ?? 99) - (PLAN_ORDER[b.name] ?? 99));
    return sorted.map((dto) => {
      const monthly = dto.monthlyPrice;
      const savePct = monthly > 0 && dto.yearlyPrice > 0
        ? Math.round((1 - dto.yearlyPrice / (monthly * 12)) * 100)
        : null;
      const price = yearly ? dto.yearlyPrice : monthly;
      return {
        name: dto.name,
        price: formatPrice(price),
        period: yearly ? '/year' : '/month',
        desc: dto.description,
        features: buildFeatures(dto),
        popular: dto.name === 'Growth',
        savePct: yearly && savePct && savePct > 0 ? savePct : null,
      };
    });
  }, [plans, yearly]);

  const showSaveBadge = yearly && plans?.some((p) => p.monthlyPrice > 0 && p.yearlyPrice < p.monthlyPrice * 12);

  return (
    <section className="bg-white py-20 md:py-28" id="pricing">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand">Pricing</p>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Simple, affordable pricing</h2>
          <p className="mt-4 text-lg text-gray-600">
            Start free for 30 days. Upgrade as you grow — and keep 100% of your sales.
          </p>

          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 p-1">
            <button
              onClick={() => setYearly(false)}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-medium transition-all',
                !yearly ? 'bg-white text-brand shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all',
                yearly ? 'bg-white text-brand shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Yearly
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand-dark">
                2 months free
              </span>
            </button>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-brand" />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-gray-500">
            <p>Unable to load pricing.</p>
            <p className="mt-1 text-sm">Please refresh or contact support.</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4">
            {displayPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={cn(
                  'relative flex w-full flex-col rounded-2xl border bg-white p-6 transition-all duration-300 sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]',
                  plan.popular
                    ? 'border-brand/30 shadow-xl shadow-brand/10 ring-1 ring-brand/20'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand px-4 py-1 text-xs font-bold text-white shadow-sm">
                    Most Popular
                  </div>
                )}

                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold tracking-tight text-brand">{plan.price}</span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                </div>
                {plan.savePct && (
                  <span className="mt-1.5 inline-flex w-fit items-center gap-1 rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-bold text-brand-dark">
                    2 months free with yearly billing
                  </span>
                )}
                <p className="mt-3 text-sm text-gray-500">{plan.desc}</p>

                <div className="my-5 flex-1 space-y-2.5 border-t border-gray-100 pt-5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span className="text-gray-600">{f}</span>
                    </div>
                  ))}
                </div>

                <Button
                  asChild
                  className={cn(
                    'h-12 w-full rounded-xl text-sm font-semibold',
                    plan.popular
                      ? 'bg-brand text-white shadow-md shadow-brand/20 hover:bg-brand-dark'
                      : 'bg-brand-soft text-brand hover:bg-brand hover:text-white'
                  )}
                >
                  <Link href="/register">Start Free Trial</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand-soft px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            <p className="text-sm font-semibold text-brand-dark">No commission on your sales.</p>
          </div>
          <p className="text-sm text-gray-500">
            Every plan starts with a free 30-day trial — no card required.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
