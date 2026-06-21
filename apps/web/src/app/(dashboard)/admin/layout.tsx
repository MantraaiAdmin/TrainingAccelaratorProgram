'use client';

import { useRequireAuth } from '@/hooks/use-require-auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { authReady, authed, user } = useRequireAuth({ adminOnly: true });

  if (!authReady || !authed) return null;
  if (user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') return null;

  return <>{children}</>;
}
