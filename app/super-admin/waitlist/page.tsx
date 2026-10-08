'use client';

import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance, { extractErrorMessage } from '@/lib/axios';
import { LoadingState, EmptyState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import { showToast } from '@/lib/notifications/toast';
import { cn } from '@/lib/utils';
import { Copy } from 'lucide-react';

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  businessName?: string;
  phone?: string;
  status: 'WAITING' | 'INVITED' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface WaitlistStats {
  total: number;
  waiting: number;
  invited: number;
  approved: number;
  rejected: number;
}

const STATUS_FILTERS = ['ALL', 'WAITING', 'INVITED', 'APPROVED', 'REJECTED'] as const;

const STATUS_STYLES: Record<string, string> = {
  WAITING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  INVITED: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
  REJECTED: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'});
}

export default function SuperAdminWaitlistPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['super-admin', 'waitlist', 'stats'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/v1/super-admin/waitlist/stats');
      return res.data?.data as WaitlistStats;
    }});

  const { data: entries, isLoading, error, refetch } = useQuery({
    queryKey: ['super-admin', 'waitlist', filter],
    queryFn: async () => {
      const res = await axiosInstance.get(
        filter === 'ALL'
          ? '/api/v1/super-admin/waitlist'
          : `/api/v1/super-admin/waitlist?status=${filter}`
      );
      return res.data?.data as WaitlistEntry[];
    }});

  const updateStatus = useCallback(async (id: string, status: string, confirmMessage?: string) => {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    setUpdatingId(id);
    try {
      await axiosInstance.put(`/api/v1/super-admin/waitlist/${id}/status?status=${status}`);
      showToast('success', `Entry marked as ${status.charAt(0) + status.slice(1).toLowerCase()}.`);
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'waitlist'] });
      refetchStats();
    } catch (err) {
      showToast('error', extractErrorMessage(err) || 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  }, [queryClient, refetchStats]);

  const copyEmail = useCallback(async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      showToast('success', 'Email copied.');
    } catch {
      showToast('error', 'Could not copy the email.');
    }
  }, []);

  const statCards = [
    { label: 'Total', value: stats?.total ?? 0, color: 'bg-blue-50 text-blue-700' },
    { label: 'Waiting', value: stats?.waiting ?? 0, color: 'bg-amber-50 text-amber-700' },
    { label: 'Invited', value: stats?.invited ?? 0, color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Approved', value: stats?.approved ?? 0, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Rejected', value: stats?.rejected ?? 0, color: 'bg-red-50 text-red-700' },
  ];

  if (isLoading || statsLoading) return <LoadingState message="Loading waitlist..." />;
  if (error) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Waitlist</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage early-access signups and invite merchants as spots open up.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <p className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', s.color)}>{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
              filter === status
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
          >
            {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {!entries?.length ? (
        <EmptyState title="No entries" description="No waitlist entries match this filter." />
      ) : (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Applicant</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Business</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Joined</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900 dark:text-white">{entry.name}</p>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`mailto:${entry.email}`}
                          className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {entry.email}
                        </a>
                        <button
                          onClick={() => copyEmail(entry.email)}
                          title="Copy email address"
                          aria-label={`Copy email address for ${entry.name}`}
                          className="rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {entry.businessName || '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {entry.phone || '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{formatDate(entry.createdAt)}</td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                        STATUS_STYLES[entry.status] ?? ''
                      )}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2">
                        {entry.status === 'WAITING' && (
                          <>
                            <button
                              onClick={() => updateStatus(entry.id, 'INVITED', `Invite ${entry.name}? We'll email them a sign-up link.`)}
                              disabled={updatingId === entry.id}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                              Invite
                            </button>
                            <button
                              onClick={() => updateStatus(entry.id, 'REJECTED', `Reject ${entry.name}? They'll stay off the list.`)}
                              disabled={updatingId === entry.id}
                              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {entry.status === 'INVITED' && (
                          <>
                            <button
                              onClick={() => updateStatus(entry.id, 'APPROVED', `Approve ${entry.name}? Their account will be ready to use.`)}
                              disabled={updatingId === entry.id}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(entry.id, 'REJECTED', `Reject ${entry.name}? They'll stay off the list.`)}
                              disabled={updatingId === entry.id}
                              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {(entry.status === 'INVITED' || entry.status === 'APPROVED' || entry.status === 'REJECTED') && (
                          <button
                            onClick={() => updateStatus(entry.id, 'WAITING', `Move ${entry.name} back to the waiting list?`)}
                            disabled={updatingId === entry.id}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}