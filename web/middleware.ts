// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { ROLES } from './lib/constants';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-fallback-secret');

const AUTH_ROUTES = ['/login', '/register'];
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
  if (!token && !AUTH_ROUTES.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there is a token
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role as string;

      // If authenticated, redirect from auth routes to their dashboard
      if (AUTH_ROUTES.some(p => pathname.startsWith(p))) {
        const dashboardUrl = DASHBOARD_ROOTS[role as keyof typeof DASHBOARD_ROOTS] || '/';
        return NextResponse.redirect(new URL(dashboardUrl, request.url));
      }

      // Role-based route protection
      const requiredRole = Object.keys(DASHBOARD_ROOTS).find(r => pathname.startsWith(DASHBOARD_ROOTS[r as keyof typeof DASHBOARD_ROOTS]));
      
      if (requiredRole && role !== requiredRole) {
         return NextResponse.redirect(new URL('/unauthorized', request.url)); // Or a 403 page
      }

    } catch (err) {
      // Token is invalid, clear it and redirect to login
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