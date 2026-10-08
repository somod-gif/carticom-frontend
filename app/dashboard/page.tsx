'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useBusinessOwnerDashboard, useBusinessOwnerAnalytics } from '@/features/business-owner/hooks/useBusinessOwner';
import { useMyStores } from '@/features/onboarding/hooks/useOnboarding';
import { useProductsByStore } from '@/features/dashboard/hooks/useProducts';
import { KpiGrid, type KpiCardData } from '@/components/dashboard/cards/KpiCards';
import { LoadingState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import { FadeIn } from '@/components/ui/motion';
import { DollarSign, ShoppingCart, Clock, TrendingUp, Loader2, ArrowRight, BarChart3 } from 'lucide-react';
import type { RecentOrder } from '@/types/dashboard';
import type { OrderSummaryDTO } from '@/features/business-owner/types';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { extractErrorMessage } from '@/lib/axios';
import { LaunchChecklist, type ChecklistItem } from '@/components/dashboard/launch/LaunchChecklist';

const SalesBarChart = dynamic(() => import('@/components/dashboard/charts/ChartCard').then(m => ({ default: m.SalesBarChart })), {
  loading: () => <ChartSkeleton />});

const RevenueLineChart = dynamic(() => import('@/components/dashboard/charts/ChartCard').then(m => ({ default: m.RevenueLineChart })), {
  loading: () => <ChartSkeleton />});

const TargetProgressCard = dynamic(() => import('@/components/dashboard/charts/ChartCard').then(m => ({ default: m.TargetProgressCard })), {
  loading: () => <ChartSkeleton />});

const DemographicCard = dynamic(() => import('@/components/dashboard/charts/ChartCard').then(m => ({ default: m.DemographicCard })), {
  loading: () => <ChartSkeleton />});

const RecentOrdersCard = dynamic(() => import('@/components/dashboard/charts/ChartCard').then(m => ({ default: m.RecentOrdersCard })), {
  loading: () => <ChartSkeleton />});

function ChartSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-5 h-80 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
    </div>
  );
}

function toRecentOrder(o: OrderSummaryDTO): RecentOrder {
  return {
    id: o.id,
    orderId: o.orderId,
    customer: { name: o.customerName, email: o.customerEmail },
    amount: o.total,
    currency: o.currency || 'NGN',
    status: (o.status?.toLowerCase() ?? 'pending') as RecentOrder['status'],
    items: o.items,
    date: o.createdAt};
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600',
  processing: 'bg-blue-50 text-blue-600',
  completed: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-red-50 text-red-600',
  refunded: 'bg-muted text-muted-foreground'};

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function greetingForHour(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { data: dashboard, isLoading, error, refetch } = useBusinessOwnerDashboard();
  const { data: analytics } = useBusinessOwnerAnalytics('monthly');
  const { data: stores } = useMyStores();
  const store = stores?.[0];
  const { data: products } = useProductsByStore(store?.id ?? '');
  const [greeting] = useState(greetingForHour);

  const orders = useMemo(() => (dashboard?.recentOrders ?? []).map(toRecentOrder), [dashboard?.recentOrders]);

  if (isLoading) {
    return <LoadingState message="Loading your dashboard..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        description={extractErrorMessage(error)}
        onRetry={refetch}
      />
    );
  }

  if (!dashboard) return null;

  const firstName = user?.fullName?.split(' ')[0] || 'User';
  const businessName = user?.businessName || 'Welcome to Carticom';

  // Compute real changes from analytics data (compare last two periods)
  const analyticsData = analytics ?? [];
  const lastPeriod = analyticsData[analyticsData.length - 1];
  const prevPeriod = analyticsData[analyticsData.length - 2];
  const hasComparison = !!(lastPeriod && prevPeriod);

  const revenueChange = hasComparison && prevPeriod.revenue > 0
    ? Math.round(((lastPeriod.revenue - prevPeriod.revenue) / prevPeriod.revenue) * 100)
    : null;

  const ordersChange = hasComparison && prevPeriod.orders > 0
    ? Math.round(((lastPeriod.orders - prevPeriod.orders) / prevPeriod.orders) * 100)
    : null;

  const formatChange = (percent: number | null): string | undefined => {
    if (percent === null) return undefined;
    return `${percent >= 0 ? '+' : ''}${percent}%`;
  };

  const kpiCards: KpiCardData[] = [
    {
      id: 'available-revenue',
      label: 'Available Revenue',
      value: `₦${formatCurrency(dashboard.availableRevenue)}`,
      change: formatChange(revenueChange),
      changeType: revenueChange !== null ? (revenueChange >= 0 ? 'positive' : 'negative') : undefined,
      icon: DollarSign,
    },
    {
      id: 'pending-orders',
      label: 'Pending Orders',
      value: String(dashboard.pendingOrders ?? 0),
      change: formatChange(ordersChange),
      changeType: ordersChange !== null ? (ordersChange >= 0 ? 'positive' : 'negative') : undefined,
      icon: ShoppingCart,
    },
    {
      id: 'lifetime-revenue',
      label: 'Lifetime Revenue',
      value: `₦${formatCurrency(dashboard.lifetimeRevenue)}`,
      change: formatChange(revenueChange),
      changeType: revenueChange !== null ? (revenueChange >= 0 ? 'positive' : 'negative') : undefined,
      icon: TrendingUp,
    },
    {
      id: 'pending-revenue',
      label: 'Pending Revenue',
      value: `₦${formatCurrency(dashboard.pendingRevenue)}`,
      change: 'Awaiting payment',
      changeType: 'neutral',
      icon: Clock,
    },
  ];

  // Checklist items derived from real data — no fabricated progress
  const checklistItems: ChecklistItem[] = [
    {
      id: 'create-shop',
      label: 'Create your shop',
      completed: !!store,
      link: '/dashboard/store',
      linkLabel: 'Set up',
    },
    {
      id: 'add-product',
      label: 'Add your first product',
      completed: (products?.length ?? 0) > 0,
      link: '/dashboard/products',
      linkLabel: 'Add product',
    },
    {
      id: 'design-shop',
      label: 'Design your shop',
      completed: !!(store?.template || store?.primaryColor),
      link: '/dashboard/storefront',
      linkLabel: 'Design',
    },
    {
      id: 'publish-shop',
      label: 'Publish your shop',
      completed: store?.status === 'ACTIVE',
      link: '/dashboard/storefront',
      linkLabel: 'Publish',
    },
    {
      id: 'share-link',
      label: 'Share your shop link',
      completed: store?.status === 'ACTIVE' && !!store?.slug,
      link: store?.slug ? `/store/${store.slug}` : undefined,
      linkLabel: 'View shop',
    },
  ];

  const hasRevenue = (dashboard.lifetimeRevenue ?? 0) > 0;
  const hasOrders = (dashboard.pendingOrders ?? 0) > 0 || (dashboard.recentOrders?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-foreground tracking-tight">
              {greeting}, {firstName}
            </h1>
            <p className="text-sm text-muted-foreground">{businessName}</p>
          </div>
        </div>
      </FadeIn>

      <LaunchChecklist items={checklistItems} />

      <KpiGrid cards={kpiCards} isLoading={isLoading} />

      <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            {analytics?.length ? (
              <SalesBarChart data={analytics.map((a) => ({
                name: a.period,
                sales: a.orders,
                revenue: a.revenue}))} />
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 flex flex-col items-center justify-center text-center">
                <BarChart3 className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 font-medium">No sales yet</p>
                <p className="text-xs text-gray-400 mt-1 mb-4">Your monthly sales chart will appear here after your first order</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/storefront">Design your shop</Link>
                </Button>
              </div>
            )}
          </div>
          {hasRevenue && (
            <div>
              <TargetProgressCard percentage={Math.min(100, ((dashboard.lifetimeRevenue ?? 0) / 20000000) * 100)} target="₦20M" revenue={`₦${formatCurrency(dashboard.lifetimeRevenue ?? 0)}`} today="₦0" />
            </div>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={0.15}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            {analytics?.length ? (
              <RevenueLineChart data={analytics.map((a) => ({
                name: a.period,
                revenue: a.revenue,
                orders: a.orders}))} />
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 flex flex-col items-center justify-center text-center">
                <BarChart3 className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 font-medium">No revenue yet</p>
                <p className="text-xs text-gray-400 mt-1 mb-4">Revenue trends will appear here once your first payment is completed</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/products">Add your first product</Link>
                </Button>
              </div>
            )}
          </div>
          {hasOrders && (
            <div>
              <DemographicCard data={[{ country: 'Nigeria', flag: '🇳🇬', customers: dashboard.recentOrders?.length ?? 0, percentage: 100 }]} />
            </div>
          )}
        </div>
      </FadeIn>

      <RecentOrdersCard>
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Order</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Items</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-right font-medium text-muted-foreground text-xs uppercase tracking-wider" />
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order, i) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                          {order.customer.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-foreground text-sm">{order.customer.name}</div>
                          <div className="text-xs text-muted-foreground">{order.customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">#{order.orderId}</td>
                    <td className="px-5 py-3.5 font-semibold text-foreground text-sm">
                      {new Intl.NumberFormat('en-NG', { style: 'currency', currency: order.currency, minimumFractionDigits: 0 }).format(order.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-sm">{order.items} item{order.items !== 1 ? 's' : ''}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize', STATUS_STYLES[order.status] || STATUS_STYLES.pending)}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/dashboard/orders/${order.orderId}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        View <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<ShoppingCart className="h-6 w-6 text-muted-foreground" />}
            title="No orders yet"
            description="Start by adding products to your store."
            action={
              <Link href="/dashboard/products">
                <Button size="sm">Add Product</Button>
              </Link>
            }
          />
        )}
      </RecentOrdersCard>
    </div>
  );
}
