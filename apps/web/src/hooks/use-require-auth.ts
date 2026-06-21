'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthReady, useAuthStore } from '@/lib/store';
import { hasClientSession } from '@/lib/auth-client';

/** Shared client auth gate — avoids redirect loops after login/reload. */
export function useRequireAuth(options?: { adminOnly?: boolean }) {
  const authReady = useAuthReady();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const authed = isAuthenticated || hasClientSession();

  useEffect(() => {
    if (!authReady) return;
    if (!authed) {
      router.replace('/login');
      return;
    }
    if (options?.adminOnly) {
      const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
      if (user && !isAdmin) router.replace('/dashboard');
    }
  }, [authReady, authed, user, router, options?.adminOnly]);

  return { authReady, authed, user };
}
