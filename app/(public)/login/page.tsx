// ============================================================
// CARTICOM — Login
// ============================================================

'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { PublicOnlyGuard } from '@/features/auth/components/AuthGuard';
import { loginSchema } from '@/features/auth/schemas';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { authToasts } from '@/features/auth/hooks/useToast';
import axiosInstance from '@/lib/axios';
import type { LoginSchema } from '@/features/auth/schemas';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const sessionExpired = searchParams.get('session') === 'expired';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }} = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''}});

  const onSubmit = async (data: LoginSchema) => {
    setServerError(null);
    const result = await login({
      email: data.email,
      password: data.password});

    if (result.success) {
      authToasts.loginSuccess();
      const currentUser = useAuthStore.getState().user;

      // First-time merchant: guide them through creating their store
      if (currentUser?.onboardingCompleted === false) {
        router.push('/onboarding');
        return;
      }

      const returnUrl = searchParams.get('returnUrl') || searchParams.get('redirect');

      if (returnUrl) {
        router.push(decodeURIComponent(returnUrl));
        return;
      }

      const roleRedirectMap: Record<string, string> = {
        SUPER_ADMIN: '/super-admin/dashboard',
        ADMIN: '/admin/dashboard',
        BUSINESS_OWNER: '/dashboard',
        VENDOR: '/dashboard',
        STAFF: '/staff/dashboard',
        CUSTOMER: '/storefront'};
      const redirect = roleRedirectMap[currentUser?.role ?? ''] ?? '/dashboard';
      router.push(redirect);
    } else {
      const errorMessage = result.error ?? 'Login failed. Please try again.';
      setServerError(errorMessage);
      authToasts.loginError(errorMessage);
    }
  };

  return (
    <>
      {/* Session Expired Alert */}
      {sessionExpired && (
        <div
          className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>Your session has expired. Please login again.</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Server Error */}
        {serverError && (
          <div
            className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{serverError}</p>
          </div>
        )}

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className={`mt-1 block w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 ${
              errors.email
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-700'
            }`}
            placeholder="hello@techworld.africa"
            autoFocus
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-xs text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password')}
              className={`block w-full rounded-xl border px-4 py-2.5 pr-10 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 ${
                errors.password
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-700'
              }`}
              placeholder="Enter your password"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="mt-1 text-xs text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Signing in...
            </>
          ) : (
            'Login'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white dark:bg-gray-900 px-4 text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={async () => {
          try {
            const res = await axiosInstance.get('/api/v1/auth/oauth/google/url');
            const url = res.data?.data?.url ?? res.data?.url;
            const state = res.data?.data?.state ?? res.data?.state;
            if (url) {
              sessionStorage.setItem('carticom-oauth-state', state ?? '');
              window.location.href = url;
            }
          } catch {
            window.location.href = `${process.env.NEXT_PUBLIC_APP_URL}/login?oauth=error`;
          }
        }}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <FcGoogle className="h-5 w-5" />
        Continue with Google
      </button>

      {/* Register Link */}
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          Create Business Account
        </Link>
      </p>
    </>
  );
}

// ─── Login Page ──────────────────────────────────────────────

export default function LoginPage() {
  return (
    <PublicOnlyGuard>
      <AuthLayout
        title="Welcome back"
        subtitle="Login to your Carticom dashboard"
      >
        <Suspense
          fallback={
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </AuthLayout>
    </PublicOnlyGuard>
  );
}
