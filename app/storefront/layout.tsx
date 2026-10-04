'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, User, Menu, X, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/Container';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { storefrontApi } from '@/features/onboarding/services/onboarding.service';

export default function StorefrontLayout({
  children}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const queryStoreId = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('store')
    : null;
  const [resolvedStoreId, setResolvedStoreId] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { items, fetchCart, setStoreId, storeId: rememberedStoreId } = useCartStore();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const getStoreSlugFromPath = () => {
    if (!pathname) return null;
    const match = pathname.match(/^\/store\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  };

  const storeSlug = getStoreSlugFromPath();
  const storeId = queryStoreId || resolvedStoreId || rememberedStoreId;
  const storeLabel = storeSlug ? storeSlug.replace(/-/g, ' ') : null;

  useEffect(() => {
    if (queryStoreId) return;
    if (!storeSlug) return;
    let cancelled = false;
    storefrontApi.getStoreBySlug(storeSlug)
      .then((res) => {
        if (!cancelled && res.data.data?.id) setResolvedStoreId(res.data.data.id);
      })
      .catch(() => {
        // Store resolution failed — slug may be invalid
      });
    return () => { cancelled = true; };
  }, [storeSlug, queryStoreId]);

  useEffect(() => {
    if (!storeId) return;
    setStoreId(storeId);
    // Refetch on every navigation so the badge is always current
    // (and clears after checkout converts the cart server-side).
    fetchCart(storeId);
  }, [storeId, pathname, fetchCart, setStoreId]);

  const isCheckoutPage = pathname?.startsWith('/storefront/checkout');
  const isPreviewPage = pathname?.startsWith('/store/preview/');

  if (isPreviewPage) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <Container size="xl">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/storefront"
              className="flex items-center gap-2 text-lg font-bold tracking-tight text-gray-900 dark:text-white"
            >
              <Store className="h-5 w-5 text-blue-600" />
              {storeLabel ? (
                <span className="truncate max-w-[200px] capitalize">{storeLabel}</span>
              ) : (
                <span>Carticom Storefront</span>
              )}
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/storefront"
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  pathname === '/storefront'
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                Home
              </Link>
              {storeSlug && (
                <>
                  <Link
                    href={`/store/${storeSlug}`}
                    className={cn(
                      'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      pathname === `/store/${storeSlug}`
                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    Products
                  </Link>
                </>
              )}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href={storeId ? `/storefront/cart?store=${storeId}` : '/storefront/cart'}
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              <Link
                href="/storefront/profile"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="My account"
              >
                <User className="h-5 w-5" />
              </Link>

              {isAuthenticated ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <Button size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
              )}

              <button
                className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 space-y-1">
              <Link
                href="/storefront"
                className="block px-3 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              {storeSlug && (
                <Link
                  href={`/store/${storeSlug}`}
                  className="block px-3 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Products
                </Link>
              )}
            </nav>
          )}
        </Container>
      </header>

      <main className={cn('flex-1', isCheckoutPage ? '' : 'py-6')}>
        <Container size={isCheckoutPage ? 'md' : 'xl'}>
          {children}
        </Container>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-auto">
        <Container size="xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-6 text-sm text-gray-500 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} Carticom. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/about" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                About
              </Link>
              <Link href="/contact" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Contact
              </Link>
              <Link href="/legal/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Privacy
              </Link>
              <Link href="/legal/terms" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
