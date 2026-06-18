'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    if (!isAdmin) router.replace('/dashboard');
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated) return null;
  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') return null;

  return <>{children}</>;
}
