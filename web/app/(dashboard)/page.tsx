// FILE: web/app/(dashboard)/page.tsx

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { ROLES } from '@/lib/constants';
import { FullPageSpinner } from '@/components/ui/spinner';

/**
 * This page acts as a client-side router after login.
 * The middleware redirects any logged-in user here,
 * and this component handles the final redirection to the
 * correct role-based dashboard. This prevents UI flashing.
 */
export default function DashboardRedirectPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      // If for some reason user is not authenticated, send to login
      router.replace('/login');
      return;
    }

    if (user) {
      const dashboardUrl = {
        [ROLES.STUDENT]: '/student',
        [ROLES.COUNSELLOR]: '/counsellor',
        [ROLES.VOLUNTEER]: '/volunteer',
        [ROLES.ADMIN]: '/admin',
      }[user.role];

      if (dashboardUrl) {
        router.replace(dashboardUrl);
      } else {
        // Fallback if role is unknown
        router.replace('/');
      }
    }
  }, [user, isAuthenticated, router]);

  return <FullPageSpinner />;
}