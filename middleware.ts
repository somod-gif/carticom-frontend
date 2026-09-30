import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface SessionMarker {
  role: string;
  exp: number;
}

function decodeSessionMarker(token: string | undefined): SessionMarker | null {
  if (!token) return null;
  try {
    const decoded = JSON.parse(atob(token));
    if (!decoded || typeof decoded !== 'object') return null;
    const marker = decoded as SessionMarker;
    if (typeof marker.role !== 'string' || typeof marker.exp !== 'number') {
      return null;
    }
    return marker;
  } catch {
    return null;
  }
}

function getRoleRedirect(role: string): string {
  switch (role) {
    case 'CUSTOMER':
      return '/storefront';
    case 'STAFF':
      return '/staff/dashboard';
    case 'BUSINESS_OWNER':
    case 'VENDOR':
      return '/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    case 'SUPER_ADMIN':
      return '/super-admin/dashboard';
    default:
      return '/dashboard';
  }
}

function getBasePath(role: string): string {
  switch (role) {
    case 'CUSTOMER': return '/storefront';
    case 'STAFF': return '/staff';
    case 'BUSINESS_OWNER':
    case 'VENDOR': return '/dashboard';
    case 'ADMIN': return '/admin';
    case 'SUPER_ADMIN': return '/super-admin';
    default: return '';
  }
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/staff/:path*',
    '/admin/:path*',
    '/super-admin/:path*',
    '/onboarding/:path*',
    '/api/auth/:path*',
  ]};

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = decodeSessionMarker(req.cookies.get('carticom_session')?.value);

  // H13: expired session is treated as unauthenticated, never trusted
  const isSessionValid = session !== null && session.exp > Date.now();
  const role = isSessionValid ? session.role : null;

  // Redirect unauthenticated users to login when accessing protected routes
  const protectedPaths = ['/dashboard', '/staff', '/admin', '/super-admin', '/onboarding'];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !isSessionValid) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from landing/auth pages
  if (isSessionValid && (pathname === '/' || pathname === '/login' || pathname === '/register')) {
    const redirect = role ? getRoleRedirect(role) : '/dashboard';
    return NextResponse.redirect(new URL(redirect, req.url));
  }

  // Role-based routing for dashboard routes
  if (isSessionValid && role) {
    const basePath = getBasePath(role);

    // If user is on wrong role's route prefix, redirect to their correct one
    const currentBase = protectedPaths.find((p) => pathname.startsWith(p)) || '';
    if (currentBase && basePath && currentBase !== basePath) {
      // Don't redirect to unknown routes - just go to their home
      if (basePath) {
        return NextResponse.redirect(new URL(basePath === '/dashboard' ? '/dashboard' : `${basePath}/dashboard`, req.url));
      }
    }
  }

  return NextResponse.next();
}
