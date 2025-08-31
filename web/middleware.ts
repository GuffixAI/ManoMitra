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
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/auth/login', '/auth/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const isPublicRoute = PUBLIC_ROUTES.some(p => pathname === p);
  const isAuthRoute = AUTH_ROUTES.some(p => pathname === p);

  // If there's no token and the user is trying to access a protected route, redirect to login.
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If there is a token and the user is on an auth route (like /login or /register),
  // redirect them to a generic dashboard page. The client-side logic on that page
  // will then handle the final role-specific redirection. This prevents UI flashing.
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow the request to proceed.
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