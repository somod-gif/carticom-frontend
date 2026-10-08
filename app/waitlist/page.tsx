'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, Users, Sparkles, ArrowRight } from 'lucide-react';
import axiosInstance, { extractErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function WaitlistPage() {
  const [form, setForm] = useState({ name: '', email: '', businessName: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  const [checkEmail, setCheckEmail] = useState('');
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<{ status: string; position?: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.email.trim()) {
      setError('Please enter your name and email address.');
      return;
    }
    setSubmitting(true);
    try {
      await axiosInstance.post('/api/v1/waitlist/join', {
        name: form.name.trim(),
        email: form.email.trim(),
        businessName: form.businessName.trim() || undefined,
        phone: form.phone.trim() || undefined,
      });
      setJoined(true);
    } catch (err) {
      setError(extractErrorMessage(err) || 'Could not join the waitlist. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckError(null);
    setCheckResult(null);
    const value = checkEmail.trim();
    if (!value || !value.includes('@')) {
      setCheckError('Please enter a valid email address.');
      return;
    }
    setChecking(true);
    try {
      const res = await axiosInstance.get('/api/v1/waitlist/check', { params: { email: value } });
      setCheckResult(res.data?.data as { status: string; position?: number });
    } catch (err) {
      setCheckError(extractErrorMessage(err) || 'We could not look up your spot. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="absolute -bottom-24 left-0 h-80 w-80 rounded-full bg-purple-200/40 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-2xl px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-blue-500/10">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Get Early Access
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-lg text-gray-600">
              Carticom is rolling out to merchants in phases. Join the waitlist to be
              notified when we open up access for your business.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-10 rounded-3xl border border-gray-200 bg-white/90 p-8 shadow-xl shadow-blue-500/5 backdrop-blur-sm"
          >
            {joined ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">You&apos;re on the list!</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Thanks {form.name.split(' ')[0] || 'friend'}! We&apos;ve sent a confirmation
                  email to <span className="font-medium text-gray-700">{form.email}</span>. We&apos;ll
                  let you know the moment your spot opens up.
                </p>
                <Button asChild className="mt-6">
                  <Link href="#check">
                    Check my spot
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
                        Full name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={form.name}
                        onChange={update('name')}
                        placeholder="Ada Obi"
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={update('email')}
                        placeholder="ada@business.com"
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="businessName" className="mb-1.5 block text-sm font-medium text-gray-700">
                        Business name <span className="text-gray-400">(optional)</span>
                      </label>
                      <input
                        id="businessName"
                        type="text"
                        value={form.businessName}
                        onChange={update('businessName')}
                        placeholder="Ada's Fashion"
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-700">
                        Phone number <span className="text-gray-400">(optional)</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={update('phone')}
                        placeholder="+234 801 234 5678"
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-12 w-full rounded-xl text-base font-semibold"
                  >
                    {submitting ? 'Joining...' : 'Join the Waitlist'}
                  </Button>
                </form>
                <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                  <Mail className="h-3.5 w-3.5" />
                  We&apos;ll only email you about your spot. No spam.
                </p>
              </>
            )}
          </motion.div>

          <motion.div
            id="check"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-6 scroll-mt-24 rounded-3xl border border-gray-200 bg-white/90 p-8 shadow-xl shadow-blue-500/5 backdrop-blur-sm"
          >
            <h2 className="text-xl font-bold text-gray-900">Check your spot</h2>
            <p className="mt-1 text-sm text-gray-500">
              Already joined? Enter your email to see where you stand.
            </p>

            <form onSubmit={handleCheck} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={checkEmail}
                onChange={(e) => setCheckEmail(e.target.value)}
                placeholder="ada@business.com"
                aria-label="Email address to check"
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <Button
                type="submit"
                disabled={checking}
                className="rounded-xl px-6 py-2.5 text-sm font-semibold"
              >
                {checking ? 'Checking...' : 'Check my spot'}
              </Button>
            </form>

            {checkError && (
              <p className="mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">
                {checkError}
              </p>
            )}

            {checkResult && (
              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 text-sm text-gray-700">
                {checkResult.status === 'WAITING' && (
                  <p>
                    You&apos;re in line!{' '}
                    {typeof checkResult.position === 'number' && (
                      <span className="font-semibold text-gray-900">
                        #{checkResult.position}
                      </span>
                    )}{' '}
                    among the waiting list. We&apos;ll email you the moment your spot opens.
                  </p>
                )}
                {checkResult.status === 'INVITED' && (
                  <p>
                    You&apos;ve been invited! Check your inbox for your sign-up email — your
                    spot is waiting.
                  </p>
                )}
                {checkResult.status === 'APPROVED' && (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <p className="flex-1">
                      You&apos;re approved! Your account is ready — sign in to start building
                      your shop.
                    </p>
                    <Button asChild size="sm" className="shrink-0">
                      <Link href="/login">Open Carticom</Link>
                    </Button>
                  </div>
                )}
                {checkResult.status === 'REJECTED' && (
                  <p>
                    This email address isn&apos;t on the active waitlist right now.
                  </p>
                )}
                {checkResult.status === 'NOT_FOUND' && (
                  <p>
                    We couldn&apos;t find that email on the list. Scroll up to join — it only
                    takes a moment.
                  </p>
                )}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {[
              { icon: Users, title: 'Prioritized access', desc: 'Waitlist members get access before the public launch.' },
              { icon: Sparkles, title: 'Early-bird pricing', desc: 'Lock in launch discounts reserved for early members.' },
              { icon: CheckCircle, title: 'Priority onboarding', desc: 'Get hands-on setup help when your spot opens.' },
            ].map((item) => (
              <div
                key={item.title}
                className={cn(
                  'rounded-2xl border border-gray-200 bg-white/70 p-5 backdrop-blur-sm',
                  'flex items-start gap-3'
                )}
              >
                <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="mt-1 text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}