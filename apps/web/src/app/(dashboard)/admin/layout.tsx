'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthReady, useAuthStore } from '@/lib/store';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const authReady = useAuthReady();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    if (!isAdmin) router.replace('/dashboard');
  }, [authReady, isAuthenticated, user, router]);

  if (!authReady || !isAuthenticated) return null;
  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') return null;

  return <>{children}</>;
}
