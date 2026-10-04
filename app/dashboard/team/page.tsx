'use client';

import { useState } from 'react';
import { useCurrentStoreId } from '@/hooks/useCurrentStore';
import { useStaff, useInviteStaff, useDeleteStaff, useUpdateStaff } from '@/features/dashboard/hooks/useStaff';
import { LoadingState, ErrorState, EmptyState } from '@/components/dashboard/shared/StateComponents';
import { StaffRole, StaffStatus, type StaffDto } from '@/features/dashboard/types/staff.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const roleColors: Record<StaffRole, string> = {
  [StaffRole.ADMIN]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  [StaffRole.MANAGER]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  [StaffRole.STAFF]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [StaffRole.VIEWER]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'};

const statusColors: Record<StaffStatus, string> = {
  [StaffStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  [StaffStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [StaffStatus.SUSPENDED]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  [StaffStatus.DEACTIVATED]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'};

const roleDescriptions: Record<string, string> = {
  [StaffRole.ADMIN]: 'Full access to all features',
  [StaffRole.MANAGER]: 'Can manage products, orders, and staff',
  [StaffRole.STAFF]: 'Can view orders and customers',
  [StaffRole.VIEWER]: 'Can respond to customer inquiries'};

export default function StaffPage() {
  const { storeId } = useCurrentStoreId();
  const { data: staffList, isLoading, error, refetch } = useStaff(storeId ?? '');
  const inviteMutation = useInviteStaff();
  const deleteMutation = useDeleteStaff();
  const updateMutation = useUpdateStaff();

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<StaffRole>(StaffRole.STAFF);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId || !inviteEmail) return;
    inviteMutation.mutate({ storeId, email: inviteEmail, role: inviteRole }, {
      onSuccess: () => {
        setInviteEmail('');
        setShowInvite(false);
      }});
  };

  const handleDelete = (staff: StaffDto) => {
    if (window.confirm(`Remove ${staff.firstName} ${staff.lastName} from your team?`)) {
      deleteMutation.mutate(staff.id);
    }
  };

  if (isLoading) return <LoadingState message="Loading staff..." />;
  if (error) return <ErrorState title="Failed to load staff" onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Staff</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your team members and permissions
          </p>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Invite Staff
        </button>
      </div>

      {showInvite && (
        <form onSubmit={handleInvite} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invite Team Member</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="email"
              placeholder="email@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as StaffRole)}
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(StaffRole).map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            <Button type="submit" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? 'Sending...' : 'Send Invite'}
            </Button>
          </div>
        </form>
      )}

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        {!staffList || staffList.length === 0 ? (
          <EmptyState
            title="No staff members yet"
            description="Invite your team to collaborate."
            action={{
              label: 'Invite Staff',
              onClick: () => setShowInvite(true)}}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Role</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff) => (
                  <tr key={staff.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                      {staff.firstName} {staff.lastName}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{staff.email}</td>
                    <td className="py-3 px-4">
                      <select
                        value={staff.role}
                        onChange={(e) => updateMutation.mutate({ id: String(staff.id), data: { role: e.target.value as StaffRole } })}
                        className={`h-9 px-2 border border-transparent rounded-full text-xs font-medium cursor-pointer ${roleColors[staff.role]}`}
                        aria-label={`Role for ${staff.firstName} ${staff.lastName}`}
                      >
                        {Object.values(StaffRole).map((role) => (
                          <option key={role} value={role}>
                            {role.charAt(0) + role.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[staff.status]}`}>
                        {staff.status.charAt(0) + staff.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(staff)}
                        className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Permission Roles</h2>
        <div className="space-y-3">
          {Object.entries(roleDescriptions).map(([role, desc]) => (
            <div key={role} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
