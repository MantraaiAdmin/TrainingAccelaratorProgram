'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar, useSidebarOffsetClass } from '@/components/layout/sidebar';
import { AIPanel } from '@/components/ai/ai-panel';
import { cn } from '@/lib/utils';
import { useRequireAuth } from '@/hooks/use-require-auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLearnPage = pathname?.startsWith('/learn/');
  const sidebarOffset = useSidebarOffsetClass();
  const { authReady, authed } = useRequireAuth();

  if (!authReady || !authed) return null;

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
