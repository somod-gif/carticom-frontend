'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { DashboardFooter } from './DashboardFooter';
import { SubscriptionBanner } from '@/components/dashboard/subscription/SubscriptionBanner';
import { DashboardTour } from './DashboardTour';
import { PageTransition } from '@/components/ui/page-transition';
import { cn } from '@/lib/utils';

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-soft/50 via-light-bg to-light-bg dark:from-gray-950 dark:via-background dark:to-background">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={cn(
        'transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[240px]'
      )}>
        <TopNavbar onToggleSidebar={sidebarCollapsed ? () => setSidebarCollapsed(false) : () => setMobileOpen(true)} isSidebarCollapsed={sidebarCollapsed} />
        <SubscriptionBanner />
        <DashboardTour />
        <main className="p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
}
