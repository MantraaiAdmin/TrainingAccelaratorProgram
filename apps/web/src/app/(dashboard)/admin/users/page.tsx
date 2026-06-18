'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  UserCog, Plus, ChevronLeft, ChevronRight, Eye, EyeOff,
  Search, X, ArrowUpDown, ArrowUp, ArrowDown, Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
}

type SortField = 'name' | 'email' | 'role' | 'createdAt' | 'lastLoginAt';
type SortOrder = 'asc' | 'desc';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: 'Demo@123',
  role: 'ADMIN' as 'ADMIN' | 'SUPER_ADMIN',
};

const inputClass =
  'w-full bg-secondary/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500';

const filterSelectClass =
  'bg-secondary/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[140px]';

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function SortableHeader({
  label,
  field,
  sortBy,
  sortOrder,
  onSort,
}: {
  label: string;
  field: SortField;
  sortBy: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}) {
  const active = sortBy === field;
  const Icon = active ? (sortOrder === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th className="text-left p-4">
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          'flex items-center gap-1 font-medium hover:text-foreground transition-colors',
          active ? 'text-purple-400' : 'text-muted-foreground',
        )}
      >
        {label}
        <Icon className="w-3.5 h-3.5" />
      </button>
    </th>
  );
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterStatus, setFilterStatus] = useState<'active' | 'inactive' | 'all'>('active');
  const [filterRole, setFilterRole] = useState<'ADMIN' | 'SUPER_ADMIN' | 'all'>('all');

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: 20,
      search: search || undefined,
      sortBy,
      sortOrder,
      status: filterStatus,
      role: filterRole,
    }),
    [page, search, sortBy, sortOrder, filterStatus, filterRole],
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', queryParams],
    queryFn: () => api.getAdminUsers(queryParams) as Promise<{
      items: AdminUser[];
      total: number;
      totalPages: number;
    }>,
  });

  const handleSort = useCallback((field: SortField) => {
    setSortBy((prev) => {
      if (prev === field) {
        setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortOrder('asc');
      return field;
    });
    setPage(1);
  }, []);

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setFilterStatus('active');
    setFilterRole('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters =
    search || filterStatus !== 'active' || filterRole !== 'all';

  const createMutation = useMutation({
    mutationFn: () => api.createAdminUser(form),
    onSuccess: () => {
      toast.success('Admin user created');
      setForm(emptyForm);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => api.deleteAdminUser(userId),
    onSuccess: () => {
      toast.success('Admin user deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleDelete = (user: AdminUser) => {
    if (!confirm(`Delete ${user.firstName} ${user.lastName} (${user.email})? This cannot be undone.`)) {
      return;
    }
    deleteMutation.mutate(user.id);
  };

  const canSubmit =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.password.trim().length >= 6;

  const canDeleteUser = (user: AdminUser) => {
    if (user.id === currentUser?.id) return false;
    if (user.role === 'SUPER_ADMIN' && !isSuperAdmin) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserCog className="w-8 h-8 text-purple-500" /> Admin Users
          </h1>
          <p className="text-muted-foreground mt-1">Create and manage admin portal accounts</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />Add Admin
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Admin User</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First Name">
              <input
                placeholder="e.g. Priya"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Last Name">
              <input
                placeholder="e.g. Sharma"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Email" className="md:col-span-2">
              <input
                type="email"
                placeholder="admin@mantra.ai"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Role">
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as 'ADMIN' | 'SUPER_ADMIN' })}
                className={inputClass}
              >
                <option value="ADMIN">Admin</option>
                {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin</option>}
              </select>
              {!isSuperAdmin && (
                <p className="text-[10px] text-muted-foreground mt-1">Only super admins can create super admin accounts</p>
              )}
            </Field>
            <Field label="Password">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Initial login password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!canSubmit || createMutation.isPending}
              className="md:col-span-2"
            >
              Create Admin User
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={`${inputClass} pl-9`}
            />
          </div>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="shrink-0">
              <X className="w-4 h-4 mr-1" /> Clear filters
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value as typeof filterRole); setPage(1); }}
            className={filterSelectClass}
          >
            <option value="all">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value as typeof filterStatus); setPage(1); }}
            className={filterSelectClass}
          >
            <option value="all">All status</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {error && <p className="p-4 text-red-400">{(error as Error).message}</p>}
          {isLoading ? (
            <p className="p-8 text-center text-muted-foreground">Loading admin users...</p>
          ) : data?.items.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">No admin users match your search or filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <SortableHeader label="Name" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    <SortableHeader label="Email" field="email" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    <SortableHeader label="Role" field="role" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    <SortableHeader label="Last Login" field="lastLoginAt" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    <SortableHeader label="Created" field="createdAt" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    <th className="text-left p-4 text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items.map((user) => (
                    <tr key={user.id} className="border-b border-border/50">
                      <td className="p-4 font-medium">
                        {user.firstName} {user.lastName}
                        {user.id === currentUser?.id && (
                          <span className="ml-2 text-xs text-purple-400">(you)</span>
                        )}
                        {!user.isActive && (
                          <span className="ml-2 text-xs text-red-400">(inactive)</span>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">{user.email}</td>
                      <td className="p-4">
                        <span
                          className={cn(
                            'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                            user.role === 'SUPER_ADMIN'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-purple-500/20 text-purple-400',
                          )}
                        >
                          {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{formatDate(user.lastLoginAt)}</td>
                      <td className="p-4 text-muted-foreground">{formatDate(user.createdAt)}</td>
                      <td className="p-4">
                        {canDeleteUser(user) ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300"
                            disabled={deleteMutation.isPending}
                            onClick={() => handleDelete(user)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>

        {data && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground order-2 sm:order-1">
              Showing {data.total === 0 ? 0 : (page - 1) * queryParams.pageSize + 1}–
              {Math.min(page * queryParams.pageSize, data.total)} of {data.total} admin user{data.total !== 1 ? 's' : ''}
              {hasActiveFilters ? ' (filtered)' : ''}
            </p>
            <div className="flex items-center gap-1 order-1 sm:order-2 sm:ml-auto">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: data.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === data.totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === 'ellipsis' ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground text-sm">…</span>
                  ) : (
                    <Button
                      key={p}
                      variant={page === p ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  ),
                )}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= data.totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
