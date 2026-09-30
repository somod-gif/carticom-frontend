'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from './Container';
import { useAuthStore } from '@/features/auth/store/auth.store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';
import { usePathname } from 'next/navigation';

const subscribeToClientState = () => () => {};

export function DynamicNavbar() {
  const pathname = usePathname();
  const isClient = useSyncExternalStore(subscribeToClientState, () => true, () => false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  // SSR guard
  if (!isClient) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20 bg-transparent" />
    );
  }

  // Hide on dashboard, staff, admin, super-admin, and onboarding
  const hidePaths = ['/dashboard', '/staff', '/admin', '/super-admin', '/store', '/onboarding'];
  const isHidden = hidePaths.some((p) => pathname?.startsWith(p));
  if (isHidden) {
    return null;
  }

  const publicNavLinks = [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const roleNavLinks: Record<string, { href: string; label: string }[]> = {
    BUSINESS_OWNER: [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/dashboard/store', label: 'Store' },
      { href: '/dashboard/products', label: 'Products' },
      { href: '/dashboard/orders', label: 'Orders' },
      { href: '/dashboard/ai', label: 'Carticom AI' },
    ],
    STAFF: [
      { href: '/staff/dashboard', label: 'Dashboard' },
      { href: '/staff/orders', label: 'Orders' },
      { href: '/staff/products', label: 'Products' },
      { href: '/staff/customers', label: 'Customers' },
    ],
    ADMIN: [
      { href: '/admin/dashboard', label: 'Dashboard' },
      { href: '/admin/users', label: 'Users' },
      { href: '/admin/stores', label: 'Stores' },
      { href: '/admin/subscriptions', label: 'Subscriptions' },
      { href: '/admin/analytics', label: 'Analytics' },
    ],
    SUPER_ADMIN: [
      { href: '/super-admin/dashboard', label: 'Dashboard' },
      { href: '/super-admin/users', label: 'Users' },
      { href: '/super-admin/stores', label: 'Stores' },
      { href: '/super-admin/plans', label: 'Plans' },
      { href: '/super-admin/audit-logs', label: 'Audit Logs' },
    ],
    CUSTOMER: [
      { href: '/storefront', label: 'My Storefront' },
      { href: '/storefront/orders', label: 'Orders' },
    ]};

  const roleRedirectMap: Record<string, string> = {
    SUPER_ADMIN: '/super-admin/dashboard',
    ADMIN: '/admin/dashboard',
    BUSINESS_OWNER: '/dashboard',
    STAFF: '/staff/dashboard',
    CUSTOMER: '/storefront'};

  const navLinks = isAuthenticated
    ? roleNavLinks[user?.role ?? ''] ?? roleNavLinks.BUSINESS_OWNER
    : publicNavLinks;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/70 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] border-b border-gray-100/40'
          : 'bg-transparent'
      }`}
    >
      <Container size="xl">
        <div className="flex h-16 md:h-20 items-center justify-between">
          <Link
            href={isAuthenticated ? (roleRedirectMap[user?.role ?? ''] ?? '/dashboard') : '/'}
            className="flex items-center gap-3 group"
            aria-label="Carticom Home"
          >
            <div className="relative">
              <Image
                src="/image/carticom_logo.png"
                alt="Carticom Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col gap-0">
              <span className="font-bold text-lg tracking-tight text-gray-900">
                Carticom
              </span>
              {!isAuthenticated && (
                <span className="text-xs font-medium text-gray-500 -mt-1">
                  Pan-African Commerce
                </span>
              )}
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors rounded-xl hover:bg-blue-50/50 group"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full" aria-label="User menu">
                      <Avatar className="h-10 w-10">
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold">
                          {user?.fullName?.charAt(0) || 'U'}
                        </div>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user?.fullName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(user?.role === 'BUSINESS_OWNER' || user?.role === 'VENDOR') && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/profile">My Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/settings">Store Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/subscription">Subscription</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/support">Support</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {user?.role === 'STAFF' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/staff/dashboard">My Dashboard</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {user?.role === 'ADMIN' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/dashboard">My Dashboard</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {user?.role === 'SUPER_ADMIN' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/super-admin/settings">System Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/super-admin/audit-logs">Audit Logs</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {user?.role === 'CUSTOMER' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/storefront/profile">My Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/storefront/orders">Order History</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login" className="relative text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors px-4 py-2 rounded-xl hover:bg-blue-50/50">
                  Login
                </Link>
                <Button size="sm" className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20 text-white font-medium" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="lg:hidden relative h-10 w-10 flex items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden bg-white/50 backdrop-blur-md -mx-6 border-t border-gray-100/40"
            >
              <div className="py-6 px-6 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="pt-6 mt-6 border-t border-gray-100 flex flex-col gap-3">
                  {isAuthenticated ? (
                    <>
                      {(user?.role === 'BUSINESS_OWNER' || user?.role === 'VENDOR') && (
                        <Link href="/dashboard/profile" className="text-center text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                          My Profile
                        </Link>
                      )}
                      {user?.role === 'STAFF' && (
                        <Link href="/staff/dashboard" className="text-center text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                          My Dashboard
                        </Link>
                      )}
                      {user?.role === 'ADMIN' && (
                        <Link href="/admin/dashboard" className="text-center text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                          My Dashboard
                        </Link>
                      )}
                      {user?.role === 'SUPER_ADMIN' && (
                        <Link href="/super-admin/settings" className="text-center text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                          System Settings
                        </Link>
                      )}
                      {user?.role === 'CUSTOMER' && (
                        <Link href="/storefront/profile" className="text-center text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                          My Profile
                        </Link>
                      )}
                      <Button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="text-center text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        Login
                      </Link>
                      <Button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium" asChild>
                        <Link href="/register">Get Started</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </div>
  );
}