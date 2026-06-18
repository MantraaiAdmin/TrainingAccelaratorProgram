'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Sidebar, useSidebarOffsetClass } from '@/components/layout/sidebar';
import { AIPanel } from '@/components/ai/ai-panel';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const isLearnPage = pathname?.startsWith('/learn/');
  const sidebarOffset = useSidebarOffsetClass();

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className={cn(sidebarOffset, 'transition-[padding] duration-200 ease-out', isLearnPage ? 'h-screen overflow-hidden' : 'min-h-screen')}>
        <div className={cn(isLearnPage ? 'h-full' : 'p-6 lg:p-8')}>{children}</div>
      </main>
      <AIPanel />
    </div>
  );
}
