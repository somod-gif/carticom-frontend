'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, ChevronDown, User, Settings, LogOut} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/lib/utils';
import { MobileToggle } from './Sidebar';
import { SidebarCollapsedButton } from './Sidebar';

interface TopNavbarProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

// Friendlier names for pages whose URL segment reads like a folder name.
const PATH_LABEL_OVERRIDES: Record<string, string> = {
  '/dashboard/storefront': 'Design your shop',
};

export function TopNavbar({ onToggleSidebar, isSidebarCollapsed }: TopNavbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const segments = pathname.split('/').filter(Boolean);

  return (
    <header className="sticky top-0 z-40 h-14 md:h-16 bg-card border-b border-border">
      <div className="flex h-full items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            {isSidebarCollapsed ? (
              <SidebarCollapsedButton onClick={onToggleSidebar} />
            ) : (
              <MobileToggle onClick={onToggleSidebar} />
            )}
          </div>
          <nav className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
            {segments.map((seg, i) => {
              const isLast = i === segments.length - 1;
              const defaultLabel = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
              const label =
                (isLast && PATH_LABEL_OVERRIDES[pathname.replace(/\/$/, '')]) || defaultLabel;
              return (
                <React.Fragment key={seg}>
                  {i > 0 && <span className="text-muted-foreground/50">/</span>}
                  <span
                    className={cn(
                      isLast ? 'text-foreground font-medium' : 'text-muted-foreground'
                    )}
                  >
                    {label}
                  </span>
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          <Link
            href="/dashboard/notifications"
            className="relative p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive ring-1 ring-background" />
          </Link>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors"
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-[11px] font-semibold">
                {initials}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
            </button>
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 mt-2 w-56 rounded-2xl border bg-card shadow-lg py-1 z-50"
                  role="menu"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground">
                      {user?.fullName || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email || ''}</p>
                  </div>
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                    role="menuitem"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="h-4 w-4 text-muted-foreground" /> Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                    role="menuitem"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" /> Settings
                  </Link>
                  <div className="my-1 border-t border-border" />
                  <button
                    onClick={() => { logout(); setIsProfileOpen(false); }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
