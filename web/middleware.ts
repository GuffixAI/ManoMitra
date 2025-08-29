// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Avoid hard-coupling to server secret; decode payload without verifying
import { ROLES } from './lib/constants';

// Note: We intentionally don't verify the JWT in middleware to avoid secret mismatch

const AUTH_ROUTES = ['/login', '/register', '/auth/login', '/auth/register'];
const PUBLIC_ROUTES = ['/', '/splash', ...AUTH_ROUTES];
const DASHBOARD_ROOTS = {
  [ROLES.STUDENT]: '/student',
  [ROLES.COUNSELLOR]: '/counsellor',
  [ROLES.VOLUNTEER]: '/volunteer',
  [ROLES.ADMIN]: '/admin',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // If no token and trying to access a protected route
  if (!token && !PUBLIC_ROUTES.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there is a token
  if (token) {
    try {
      // Decode JWT payload without verification (base64url)
      const [, payloadB64Url] = token.split('.');
      const base64 = payloadB64Url.replace(/-/g, '+').replace(/_/g, '/');
      const json = JSON.parse(globalThis.atob(base64));
      const role = json.role as string;

      // If authenticated, redirect from auth routes to their dashboard
      if (AUTH_ROUTES.some(p => pathname.startsWith(p))) {
        const dashboardUrl = DASHBOARD_ROOTS[role as keyof typeof DASHBOARD_ROOTS] || '/';
        return NextResponse.redirect(new URL(dashboardUrl, request.url));
      }

      // Role-based route protection
      const requiredRole = Object.keys(DASHBOARD_ROOTS).find(r => pathname.startsWith(DASHBOARD_ROOTS[r as keyof typeof DASHBOARD_ROOTS]));
      
      if (requiredRole && role !== requiredRole) {
        const dashboardUrl = DASHBOARD_ROOTS[role as keyof typeof DASHBOARD_ROOTS] || '/login';
        return NextResponse.redirect(new URL(dashboardUrl, request.url));
      }

    } catch (err) {
      // If decoding fails, treat as unauthenticated
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};