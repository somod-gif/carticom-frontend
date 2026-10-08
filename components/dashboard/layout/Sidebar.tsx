'use client';

import React, { useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import {
  LayoutDashboard, Store, Package, ShoppingCart, Users,
  Brain, BarChart3, Crown,
  Headphones, Settings, LogOut, DollarSign,
  ChevronLeft, ChevronRight, Menu, X,
  Tags, CreditCard, UserPlus, LayoutTemplate, Mail,
  FileText, Ticket, Bell, Truck, Palette
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { UserRole } from '@/features/auth/types';
import { cn } from '@/lib/utils';

const OWNER_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'storefront', label: 'My Storefront', icon: Palette, href: '/dashboard/storefront' },
  { id: 'store', label: 'Store', icon: Store, href: '/dashboard/store' },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate, href: '/dashboard/templates' },
  { id: 'products', label: 'Products', icon: Package, href: '/dashboard/products' },
  { id: 'categories', label: 'Categories', icon: Tags, href: '/dashboard/categories' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/dashboard/orders' },
  { id: 'customers', label: 'Customers', icon: Users, href: '/dashboard/customers' },
  { id: 'payments', label: 'Payments', icon: DollarSign, href: '/dashboard/payments' },
  { id: 'invoices', label: 'Invoices', icon: FileText, href: '/dashboard/invoices' },
  { id: 'shipping', label: 'Shipping', icon: Truck, href: '/dashboard/shipping' },
  { id: 'coupons', label: 'Coupons', icon: Ticket, href: '/dashboard/coupons' },
  { id: 'subscription', label: 'Subscription', icon: Crown, href: '/dashboard/subscription' },
  { id: 'staff', label: 'Staff', icon: UserPlus, href: '/dashboard/team' },
  { id: 'custom-solutions', label: 'Custom Solutions', icon: Package, href: '/dashboard/custom-solutions' },
  { id: 'ai', label: 'Carticom AI', icon: Brain, href: '/dashboard/ai' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
  { id: 'notifications', label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  { id: 'support', label: 'Support', icon: Headphones, href: '/dashboard/support' },
];

const STAFF_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/staff/dashboard' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/staff/orders' },
  { id: 'products', label: 'Products', icon: Package, href: '/staff/products' },
  { id: 'customers', label: 'Customers', icon: Users, href: '/staff/customers' },
  { id: 'categories', label: 'Categories', icon: Tags, href: '/staff/categories' },
];

const ADMIN_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { id: 'users', label: 'Users', icon: Users, href: '/admin/users' },
  { id: 'stores', label: 'Stores', icon: Store, href: '/admin/stores' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
  { id: 'payments', label: 'Payments', icon: DollarSign, href: '/admin/payments' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
  { id: 'subscriptions', label: 'Subscriptions', icon: Crown, href: '/admin/subscriptions' },
];

const SUPER_ADMIN_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/super-admin/dashboard' },
  { id: 'users', label: 'Users', icon: Users, href: '/super-admin/users' },
  { id: 'stores', label: 'Stores', icon: Store, href: '/super-admin/stores' },
  { id: 'plans', label: 'Plans', icon: Crown, href: '/super-admin/plans' },
  { id: 'subscriptions', label: 'Subscriptions', icon: DollarSign, href: '/super-admin/subscriptions' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/super-admin/analytics' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/super-admin/settings' },
  { id: 'custom-solutions', label: 'Custom Solutions', icon: Package, href: '/super-admin/custom-solutions' },
  { id: 'payments', label: 'Payments', icon: CreditCard, href: '/super-admin/payments' },
  { id: 'waitlist', label: 'Waitlist', icon: Mail, href: '/super-admin/waitlist' },
  { id: 'audit', label: 'Audit Logs', icon: Headphones, href: '/super-admin/audit-logs' },
];

function getRoleItems(role: string | undefined) {
  switch (role) {
    case UserRole.STAFF: return STAFF_ITEMS;
    case UserRole.ADMIN: return ADMIN_ITEMS;
    case UserRole.SUPER_ADMIN: return SUPER_ADMIN_ITEMS;
    case UserRole.BUSINESS_OWNER:
    default: return OWNER_ITEMS;
  }
}

const NAV_GROUPS: Record<string, { label: string; keys: string[] }[]> = {
  [UserRole.BUSINESS_OWNER]: [
    { label: 'Menu', keys: ['dashboard', 'storefront', 'store', 'templates', 'products', 'categories', 'orders', 'customers', 'payments', 'invoices', 'shipping', 'coupons'] },
    { label: 'Manage', keys: ['subscription', 'staff', 'custom-solutions', 'ai'] },
    { label: 'Insights', keys: ['analytics', 'notifications', 'settings', 'support'] },
  ],
  [UserRole.STAFF]: [
    { label: 'Menu', keys: ['dashboard', 'orders', 'products', 'customers', 'categories'] },
  ],
  [UserRole.ADMIN]: [
    { label: 'Menu', keys: ['dashboard', 'users', 'stores', 'orders', 'payments'] },
    { label: 'Insights', keys: ['analytics', 'subscriptions'] },
  ],
  [UserRole.SUPER_ADMIN]: [
    { label: 'Menu', keys: ['dashboard', 'users', 'stores', 'plans', 'subscriptions'] },
    { label: 'Insights', keys: ['analytics', 'settings'] },
    { label: 'Manage', keys: ['custom-solutions', 'payments', 'waitlist', 'audit'] },
  ]};

function getNavGroups(role: string | undefined) {
  return NAV_GROUPS[role || UserRole.BUSINESS_OWNER] || NAV_GROUPS[UserRole.BUSINESS_OWNER];
}

function isActive(href: string | undefined, pathname: string) {
  if (!href) return false;
  if (href === pathname) return true;
  if (href !== '/' && pathname.startsWith(href + '/')) return true;
  return false;
}

function getLogoHref(role: string | undefined): string {
  switch (role) {
    case UserRole.STAFF: return '/staff/dashboard';
    case UserRole.ADMIN: return '/admin/dashboard';
    case UserRole.SUPER_ADMIN: return '/super-admin/dashboard';
    default: return '/dashboard';
  }
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

function NavItem({ item, active, collapsed, onMouseEnter, onClick }: {
  item: { id: string; label: string; href?: string; icon: React.ComponentType<{ className?: string }> };
  active: boolean;
  collapsed: boolean;
  onMouseEnter?: () => void;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href || '#'}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        'group relative flex items-center gap-3 rounded-2xl text-sm font-medium transition-all duration-150',
        collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2',
        active
          ? 'text-blue-700 bg-blue-50'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      )}
      title={collapsed ? item.label : undefined}
      aria-current={active ? 'page' : undefined}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-blue-600" />
      )}
      <Icon className={cn('shrink-0', collapsed ? 'h-5 w-5' : 'h-4 w-4')} aria-hidden />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const role = user?.role;
  const items = useMemo(() => getRoleItems(role), [role]);
  const groups = useMemo(() => getNavGroups(role), [role]);
  const logoHref = useMemo(() => getLogoHref(role), [role]);
  const queryClient = useQueryClient();

  const prefetchDashboard = useCallback(() => {
    const queryKey = role === UserRole.SUPER_ADMIN ? ['super-admin', 'dashboard'] : ['business-owner', 'dashboard'];
    if (!queryClient.getQueryData(queryKey)) {
      queryClient.prefetchQuery({
        queryKey,
        queryFn: async () => {
          const endpoint = role === UserRole.SUPER_ADMIN ? '/api/v1/super-admin/dashboard' : '/api/v1/business-owner/dashboard';
          const res = await axiosInstance.get(endpoint);
          return res.data.data;
        },
        staleTime: 1000 * 60 * 5});
    }
  }, [queryClient, role]);

  const itemsMap = useMemo(() => {
    const map = new Map<string, typeof items[0]>();
    for (const item of items) map.set(item.id, item);
    return map;
  }, [items]);

  const sidebarContent = (isMobile: boolean) => (
    <div className="flex h-full flex-col bg-white">
      <div className={cn(
        'flex items-center border-b border-gray-200',
        isCollapsed && !isMobile ? 'justify-center h-16' : 'justify-between h-16 px-4'
      )}>
        <Link href={logoHref} className="flex items-center gap-3 min-w-0" aria-label="Dashboard home">
          <Image src="/image/carticom_logo.png" alt="Carticom Logo" width={32} height={32} className="rounded-lg shrink-0" />
          {(!isCollapsed || isMobile) && (
            <span className="font-semibold text-gray-900 text-sm tracking-tight">Carticom</span>
          )}
        </Link>
        {(!isCollapsed || isMobile) && (
          <button
            onClick={isMobile ? onMobileClose : onToggleCollapse}
            className="flex p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={isMobile ? 'Close menu' : isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isMobile ? (
              <X className="h-4 w-4 text-gray-400" />
            ) : isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-400" />
            )}
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
        {groups.map((group) => (
          <div key={group.label}>
            {(!isCollapsed || isMobile) && (
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 mb-2">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.keys.map((key) => {
                const item = itemsMap.get(key);
                if (!item) return null;
                const active = isActive(item.href, pathname);
                return (
                  <NavItem
                    key={item.id}
                    item={item}
                    active={active}
                    collapsed={isCollapsed && !isMobile}
                    onMouseEnter={item.id === 'dashboard' ? prefetchDashboard : undefined}
                    onClick={isMobile ? onMobileClose : undefined}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={cn('border-t border-gray-200', isCollapsed && !isMobile ? 'px-2 py-3' : 'px-3 py-3')}>
        <button
          onClick={() => { logout(); if (isMobile) onMobileClose(); }}
          className={cn(
            'flex w-full items-center gap-3 rounded-2xl text-sm font-medium transition-all duration-150 text-gray-500 hover:text-red-600 hover:bg-red-50',
            isCollapsed && !isMobile ? 'justify-center p-2' : 'px-3 py-2'
          )}
          aria-label="Logout"
          title={isCollapsed && !isMobile ? 'Logout' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {(!isCollapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          'hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col',
          'border-r border-gray-200 dark:border-gray-800',
          'transition-all duration-300 ease-in-out'
        )}
        style={{ width: isCollapsed ? 72 : 240 }}
        aria-label="Sidebar navigation"
      >
        {sidebarContent(false)}
      </aside>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl"
            >
              {sidebarContent(true)}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function MobileToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-1.5 rounded-lg hover:bg-accent transition-colors"
      aria-label="Open menu"
    >
      <Menu className="h-4 w-4 text-muted-foreground" aria-hidden />
    </button>
  );
}

export function SidebarCollapsedButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="hidden lg:flex p-1.5 rounded-lg hover:bg-accent transition-colors"
      aria-label="Expand sidebar"
    >
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
