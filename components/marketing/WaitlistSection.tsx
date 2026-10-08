'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles } from 'lucide-react';
import axiosInstance, { extractErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';

export function WaitlistSection() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const value = email.trim();
    if (!value) {
      setError('Please enter your email address.');
      return;
    }
    setSubmitting(true);
    try {
      await axiosInstance.post('/api/v1/waitlist/join', { name: 'Early Access Member', email: value });
      setJoined(true);
    } catch (err) {
      setError(extractErrorMessage(err) || 'Could not join the waitlist. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-purple-50 p-8 md:p-12 text-center"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            Get early access
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-gray-600">
            We&apos;re onboarding merchants in phases. Join the waitlist and be first in
            line when your spot opens.
          </p>

          {joined ? (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
              <CheckCircle className="h-4 w-4" />
              You&apos;re on the list — watch your inbox!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@business.com"
                aria-label="Email address"
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <Button type="submit" disabled={submitting} className="h-auto rounded-xl px-6 py-3 text-sm font-semibold">
                {submitting ? 'Joining...' : 'Join the Waitlist'}
              </Button>
            </form>
          )}

          {error && (
            <p className="mx-auto mt-3 max-w-md text-sm text-red-600">{error}</p>
          )}

          <p className="mt-4 text-xs text-gray-400">
            Already on the list?{' '}
            <Link href="/waitlist#check" className="font-medium text-blue-600 hover:underline">
              Check your spot
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}