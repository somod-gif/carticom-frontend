// ============================================================
// CARTICOM AUTHENTICATION — Role Guard Component
// ============================================================

'use client';

import { useAuthStore } from '../store/auth.store';
import { UserRole } from '../types';

interface RoleGuardProps {
  children: React.ReactNode;
  /** Allowed roles that can view this content */
  allowedRoles: UserRole[];
  /** Fallback component to show if user doesn't have permission */
  fallback?: React.ReactNode;
  /** Whether to redirect instead of showing fallback */
  redirectTo?: string;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback}: RoleGuardProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Not authenticated — don't render anything (AuthGuard handles redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Check if user has an allowed role
  const hasPermission = allowedRoles.includes(user.role as UserRole);

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
              <svg
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You do not have permission to access this area. Please contact your
            administrator if you believe this is a mistake.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ─── Permission Check Hook ──────────────────────────────────

export function usePermission(allowedRoles: UserRole[]): {
  hasPermission: boolean;
  userRole: UserRole | null;
} {
  const user = useAuthStore((state) => state.user);
  const userRole = (user?.role as UserRole) ?? null;

  if (!user) {
    return { hasPermission: false, userRole: null };
  }

  return {
    hasPermission: allowedRoles.includes(userRole as UserRole),
    userRole};
}

// ─── Role Constants ─────────────────────────────────────────

export const BUSINESS_OWNER_ONLY = [UserRole.BUSINESS_OWNER, UserRole.VENDOR];
export const STAFF_AND_ABOVE = [
  UserRole.BUSINESS_OWNER,
  UserRole.VENDOR,
  UserRole.STAFF,
];
export const ADMIN_AND_ABOVE = [
  UserRole.BUSINESS_OWNER,
  UserRole.VENDOR,
  UserRole.STAFF,
  UserRole.ADMIN,
];
export const SUPER_ADMIN_ONLY = [UserRole.SUPER_ADMIN];
export const AUTHENTICATED_USERS = [
  UserRole.BUSINESS_OWNER,
  UserRole.VENDOR,
  UserRole.STAFF,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
];

export default RoleGuard;