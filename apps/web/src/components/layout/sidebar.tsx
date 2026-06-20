'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore, useThemeStore, useSidebarStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BookOpen, Trophy, Award, LogOut,
  Moon, Sun, Menu, X, Shield, Sparkles, Users, TrendingUp, Layers, Percent,
  ChevronLeft, ChevronRight, UserCog, ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { BRAND } from '@/lib/branding';

const studentNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tracks', label: 'My Tracks', icon: BookOpen },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/certificates', label: 'Certificates', icon: Award },
];

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: Shield, exact: true },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/submissions', label: 'Lab Reviews', icon: ClipboardCheck },
  { href: '/admin/users', label: 'Admin Users', icon: UserCog },
  { href: '/admin/tracks', label: 'Course Tracks', icon: Layers },
  { href: '/admin/commissions', label: 'Commission', icon: Percent },
  { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/admin/sample-credentials', label: 'Sample Credentials', icon: Award },
];

function SidebarToggle({
  collapsed,
  onToggle,
  className,
}: {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      className={cn(
        'flex items-center justify-center rounded-md border border-border bg-background shadow-sm',
        'text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors',
        collapsed ? 'h-9 w-9' : 'h-8 w-8',
        className,
      )}
    >
      {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
    </button>
  );
}

function SidebarPanel({
  collapsed,
  onToggleCollapse,
  onNavigate,
}: {
  collapsed: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const navItems = isAdmin ? adminNav : studentNav;
  const homeHref = isAdmin ? '/admin' : '/dashboard';

  return (
    <>
      <div className={cn('border-b border-border shrink-0', collapsed ? 'px-2 py-3' : 'px-4 py-4')}>
        <div className={cn('flex items-center gap-2', collapsed ? 'flex-col' : 'justify-between')}>
          <Link
            href={homeHref}
            onClick={onNavigate}
            className={cn('flex items-center gap-3 min-w-0', collapsed && 'justify-center')}
            title={collapsed ? BRAND.name : undefined}
          >
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="font-bold text-sm gradient-text leading-tight">{BRAND.name}</h1>
                <p className="text-xs text-muted-foreground truncate">
                  {isAdmin ? 'Admin Portal' : BRAND.tagline}
                </p>
              </div>
            )}
          </Link>
          {onToggleCollapse && (
            <SidebarToggle
              collapsed={collapsed}
              onToggle={onToggleCollapse}
              className={collapsed ? 'w-full' : 'shrink-0'}
            />
          )}
        </div>
      </div>

      <nav className={cn('flex-1 p-3 space-y-1 overflow-y-auto min-h-0 scroll-area', collapsed && 'px-2')}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = 'exact' in item && item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center rounded-lg text-sm font-medium transition-all',
                collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                active
                  ? 'gradient-bg text-white shadow-lg shadow-purple-500/20'
                  : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={cn('border-t border-border shrink-0 space-y-2', collapsed ? 'p-2' : 'p-4')}>
        {user && (
          <div className={cn('flex items-center gap-3', collapsed ? 'justify-center py-1' : 'px-1')}>
            <div
              className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold shrink-0"
              title={collapsed ? `${user.firstName} ${user.lastName}` : undefined}
            >
              {user.firstName[0]}{user.lastName[0]}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {isAdmin ? user.role.replace('_', ' ') : `Level ${user.level} · ${user.xp} XP`}
                </p>
              </div>
            )}
          </div>
        )}

        <div className={cn('flex gap-2', collapsed && 'flex-col items-center')}>
          <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size={collapsed ? 'icon' : 'sm'}
            onClick={logout}
            className={cn('text-muted-foreground', !collapsed && 'flex-1')}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className={cn('w-4 h-4', !collapsed && 'mr-2')} />
            {!collapsed && 'Logout'}
          </Button>
        </div>
      </div>
    </>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { collapsed, toggleCollapsed } = useSidebarStore();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-40 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      <aside
        className={cn(
          'hidden lg:flex flex-col fixed inset-y-0 left-0 glass border-r border-border z-30 transition-[width] duration-200 ease-out',
          collapsed ? 'w-[4.5rem]' : 'w-64',
        )}
      >
        <SidebarPanel collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
      </aside>

      {mobileOpen && (
        <aside className="lg:hidden fixed inset-y-0 left-0 w-64 flex flex-col glass border-r border-border z-40">
          <SidebarPanel collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </aside>
      )}
    </>
  );
}

/** Main content offset matching sidebar width (desktop). */
export function useSidebarOffsetClass() {
  const collapsed = useSidebarStore((s) => s.collapsed);
  return collapsed ? 'lg:pl-[4.5rem]' : 'lg:pl-64';
}
