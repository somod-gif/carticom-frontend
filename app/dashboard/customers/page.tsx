'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentStoreId } from '@/hooks/useCurrentStore';
import Image from 'next/image';
import { useCustomers, useUpdateCustomer } from '@/features/dashboard/hooks/useCustomers';
import { LoadingState, EmptyState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import type { CustomerDto } from '@/features/dashboard/types/customers.types';
import { ViewToggle, useViewPreference } from '@/components/dashboard/ViewToggle';
import { Download, Pencil, X, Save } from 'lucide-react';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function exportCustomersCsv(customers: CustomerDto[]) {
  const headers = ['Name', 'Email', 'Phone', 'Orders', 'Total Spent', 'Joined'];
  const rows = customers.map(c => [
    `${c.firstName} ${c.lastName}`,
    c.email,
    c.phone || '',
    c.totalOrders?.toString() || '0',
    c.totalSpent?.toString() || '0',
    c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'customers.csv'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

export default function CustomersPage() {
  const router = useRouter();
  const { storeId, isLoading: storesLoading } = useCurrentStoreId();
  const [search, setSearch] = useState('');
  const [view, setView] = useViewPreference();
  const updateCustomer = useUpdateCustomer();
  const { data: customers, isLoading, error, refetch } = useCustomers(storeId ?? '', { page: 0, limit: 50 });

  const [editing, setEditing] = useState<CustomerDto | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const openEdit = (customer: CustomerDto) => {
    setEditing(customer);
    setForm({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email || '',
      phone: customer.phone || ''});
    setSaveError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!form.firstName.trim() && !form.lastName.trim()) { setSaveError('Name is required'); return; }
    if (!form.email.trim()) { setSaveError('Email is required'); return; }
    setSaving(true);
    try {
      await updateCustomer.mutateAsync({
        id: editing.id,
        data: {
          name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined}});
      setEditing(null);
      await refetch();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter((c: CustomerDto) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q))
    );
  }, [customers, search]);

  if (isLoading || storesLoading) return <LoadingState message="Loading customers..." />;
  if (error) return <ErrorState title="Failed to load customers" onRetry={refetch} />;
  if (!storeId) return (
    <EmptyState
      title="Set up your shop first"
      description="You need a shop before customers can buy from you. It only takes a few minutes."
      action={{ label: 'Set up my shop', onClick: () => router.push('/onboarding') }}
    />
  );
  if (!customers?.length) return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customers</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your customer relationships</p>
      </div>
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <EmptyState
          title="No customers yet"
          description="Customers will appear here after their first purchase. Share your shop link so people can find you."
          action={{ label: 'Share your shop', onClick: () => router.push('/dashboard/storefront') }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your customer relationships</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportCustomersCsv(filteredCustomers)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Customer</h2>
              <button onClick={() => setEditing(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            {saveError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{saveError}</div>
            )}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First name</label>
                  <input value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} className="w-full h-11 px-3 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last name</label>
                  <input value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} className="w-full h-11 px-3 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="w-full h-11 px-3 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="w-full h-11 px-3 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                  <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-4"
        />

        {view === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCustomers.map((customer: CustomerDto) => (
              <div key={customer.id} className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {customer.avatarUrl ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0"><Image src={customer.avatarUrl} alt={`${customer.firstName} ${customer.lastName}`} fill unoptimized className="object-cover bg-gray-100 dark:bg-gray-800" /></div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-medium shrink-0">
                      {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{customer.firstName} {customer.lastName}</p>
                    <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{customer.phone || '—'}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(customer.totalSpent)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{customer.totalOrders} orders · joined {formatDate(customer.createdAt)}</span>
                  <button
                    onClick={() => openEdit(customer)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Orders</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Total Spent</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Joined</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer: CustomerDto) => (
                <tr key={customer.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {customer.avatarUrl ? (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden"><Image src={customer.avatarUrl} alt={`${customer.firstName} ${customer.lastName}`} fill unoptimized className="object-cover bg-gray-100 dark:bg-gray-800" /></div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-medium">
                          {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium text-gray-900 dark:text-white">{customer.firstName} {customer.lastName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{customer.email}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{customer.phone || '—'}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{customer.totalOrders}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{formatCurrency(customer.totalSpent)}</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{formatDate(customer.createdAt)}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openEdit(customer)}
                      className="p-1.5 inline-flex text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Edit customer"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}
