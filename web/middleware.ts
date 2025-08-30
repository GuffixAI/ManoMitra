// web/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// These routes are accessible to unauthenticated users.
const PUBLIC_ROUTES = [
  '/',
  '/splash',
  '/login',
  '/register',
  '/auth/login',
  '/auth/register',
  '/forgot-password'
];

// Authenticated users trying to access these routes will be redirected to their dashboard.
const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const isPublicRoute = PUBLIC_ROUTES.some(p => pathname === p);

  if (!token && !isPublicRoute) {
    // If there's no token and the user is trying to access a protected route, redirect to login.
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname); // You can use this to redirect back after login
    return NextResponse.redirect(loginUrl);
  }

  if (token) {
    // If there is a token and the user is on an auth route (like /login),
    // we can attempt a soft redirect to a generic dashboard or home.
    // The client-side logic in the page will handle the role-specific redirect.
    if (AUTH_ROUTES.some(p => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/student', request.url)); // Default redirect, client will correct it
    }
  }

  // Allow the request to proceed. Role-based logic will be handled client-side.
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