'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users, Plus, Upload, ChevronLeft, ChevronRight, Eye, EyeOff,
  Search, X, ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  CommissionConfig,
  DEFAULT_COMMISSION,
  StudentCommissionTier,
  estimateEnrollmentSplit,
  collegeRowToConfig,
} from '@/lib/commission-types';

interface Student {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  year?: number;
  commissionTier: StudentCommissionTier;
  college?: { id: string; name: string } | null;
  department?: { id: string; name: string; code: string } | null;
  trackAssignments: Array<{
    trackId: string;
    isActive: boolean;
    track: { id: string; name: string; slug: string; priceInr: number };
  }>;
}

interface Track {
  id: string;
  name: string;
  slug: string;
  priceInr?: number;
}

type SortField = 'name' | 'email' | 'year' | 'department' | 'college' | 'createdAt';
type SortOrder = 'asc' | 'desc';

const TIER_OPTIONS: { value: StudentCommissionTier; label: string; hint: string }[] = [
  { value: 'AUTO', label: 'Auto (by course fee)', hint: 'Uses college threshold — ≤ fee = Standard, above = Premium' },
  { value: 'STANDARD', label: 'Standard tier', hint: 'Fixed standard commission per enrollment' },
  { value: 'PREMIUM', label: 'Premium tier', hint: 'Fixed premium commission per enrollment' },
];

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  collegeName: '',
  departmentName: '',
  year: 2,
  password: 'Demo@123',
  commissionTier: 'AUTO' as StudentCommissionTier,
};

function resolveStudentConfig(
  student: Student,
  defaults: CommissionConfig,
  collegeConfigs: Array<CommissionConfig & { id: string }>,
): CommissionConfig {
  if (student.college?.id) {
    const college = collegeConfigs.find((c) => c.id === student.college!.id);
    if (college) return collegeRowToConfig(college);
  }
  return defaults;
}

function StudentCommissionCell({
  student,
  defaults,
  collegeConfigs,
  onTierChange,
  saving,
}: {
  student: Student;
  defaults: CommissionConfig;
  collegeConfigs: Array<CommissionConfig & { id: string }>;
  onTierChange: (tier: StudentCommissionTier) => void;
  saving: boolean;
}) {
  const config = resolveStudentConfig(student, defaults, collegeConfigs);
  const activeTracks = student.trackAssignments.filter((a) => a.isActive);
  const splits = activeTracks.map((a) => estimateEnrollmentSplit(a.track.priceInr, config, student.commissionTier));
  const totalCompany = splits.reduce((sum, s) => sum + s.company, 0);
  const primarySplit = splits[0] ?? null;

  return (
    <div className="space-y-1.5 min-w-[160px]">
      <select
        value={student.commissionTier}
        onChange={(e) => onTierChange(e.target.value as StudentCommissionTier)}
        disabled={saving}
        className="bg-secondary/50 rounded px-2 py-1 text-xs w-full"
      >
        {TIER_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {primarySplit && (
        <div className="text-[10px] text-muted-foreground leading-relaxed">
          <span className={primarySplit.tier === 'PREMIUM' ? 'text-amber-400' : 'text-cyan-400'}>
            {student.commissionTier === 'AUTO' ? `Auto → ${primarySplit.tier}` : primarySplit.tier}
          </span>
          {config.mode === 'FLAT_PER_STUDENT' ? (
            <>
              {' · '}₹{primarySplit.total.toLocaleString('en-IN')}/enrollment
              <br />
              Company net: ₹{totalCompany.toLocaleString('en-IN')}
              {activeTracks.length > 1 && ` (${activeTracks.length} enrollments)`}
            </>
          ) : (
            <>
              {' · '}Company net: ₹{totalCompany.toLocaleString('en-IN')}
              {activeTracks.length > 1 && ` (${activeTracks.length} tracks)`}
            </>
          )}
        </div>
      )}
      {activeTracks.length === 0 && (
        <p className="text-[10px] text-muted-foreground">Assign a track to preview profit</p>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full bg-secondary/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500';

const filterSelectClass =
  'bg-secondary/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[140px]';

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

export default function AdminStudentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [assignTrackId, setAssignTrackId] = useState<Record<string, string>>({});

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterCollege, setFilterCollege] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterTrack, setFilterTrack] = useState('');
  const [filterStatus, setFilterStatus] = useState<'active' | 'inactive' | 'all'>('all');

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
      collegeId: filterCollege || undefined,
      departmentId: filterDepartment || undefined,
      year: filterYear ? parseInt(filterYear, 10) : undefined,
      trackId: filterTrack || undefined,
      status: filterStatus,
    }),
    [page, search, sortBy, sortOrder, filterCollege, filterDepartment, filterYear, filterTrack, filterStatus],
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-students', queryParams],
    queryFn: () => api.getStudents(queryParams) as Promise<{
      items: Student[];
      total: number;
      totalPages: number;
    }>,
  });

  const { data: tracks } = useQuery({
    queryKey: ['admin-tracks-list'],
    queryFn: () => api.getAdminTracks() as Promise<Track[]>,
  });

  const { data: colleges } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => api.getColleges(),
  });

  const { data: commissions } = useQuery({
    queryKey: ['admin-commissions'],
    queryFn: () => api.getCommissions(),
  });

  const commissionDefaults = commissions?.defaults ?? DEFAULT_COMMISSION;
  const commissionColleges = commissions?.colleges ?? [];

  const filterDepartments = useMemo(() => {
    if (!colleges || !filterCollege) return [];
    return colleges.find((c) => c.id === filterCollege)?.departments ?? [];
  }, [colleges, filterCollege]);

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
    setFilterCollege('');
    setFilterDepartment('');
    setFilterYear('');
    setFilterTrack('');
    setFilterStatus('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters =
    search || filterCollege || filterDepartment || filterYear || filterTrack || filterStatus !== 'all';

  const closeForm = useCallback(() => {
    setShowForm(false);
    setForm(emptyForm);
    setShowPassword(false);
  }, []);

  const createMutation = useMutation({
    mutationFn: () =>
      api.createStudent({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        collegeName: form.collegeName.trim() || undefined,
        departmentName: form.departmentName.trim() || undefined,
        year: form.year,
        commissionTier: form.commissionTier,
      }),
    onSuccess: () => {
      toast.success('Student created');
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['colleges'] });
      queryClient.invalidateQueries({ queryKey: ['admin-commissions'] });
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const assignMutation = useMutation({
    mutationFn: ({ userId, trackId }: { userId: string; trackId: string }) => api.assignTrack(userId, trackId),
    onSuccess: () => {
      toast.success('Track assigned');
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const unassignMutation = useMutation({
    mutationFn: ({ userId, trackId }: { userId: string; trackId: string }) => api.unassignTrack(userId, trackId),
    onSuccess: () => {
      toast.success('Track removed');
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deactivateMutation = useMutation({
    mutationFn: (userId: string) => api.deactivateStudent(userId),
    onSuccess: () => {
      toast.success('Student deactivated');
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const tierMutation = useMutation({
    mutationFn: ({ userId, commissionTier }: { userId: string; commissionTier: StudentCommissionTier }) =>
      api.updateStudentCommissionTier(userId, commissionTier),
    onSuccess: () => {
      toast.success('Commission tier updated');
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-finance'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await api.bulkUploadStudents(file);
      toast.success(`Imported ${result.created} students`);
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
    } catch (err) {
      toast.error((err as Error).message);
    }
    e.target.value = '';
  };

  const canSubmit =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.password.trim() &&
    form.collegeName.trim() &&
    form.departmentName.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-purple-500" /> Students
          </h1>
          <p className="text-muted-foreground mt-1">Manage student accounts and track assignments</p>
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleBulkUpload} />
            <Button variant="outline" asChild>
              <span><Upload className="w-4 h-4 mr-2" />Bulk Upload</span>
            </Button>
          </label>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />Add Student
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>New Student</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={closeForm}
              aria-label="Close"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First Name">
              <input placeholder="e.g. Arjun" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Last Name">
              <input placeholder="e.g. Kumar" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputClass} />
            </Field>
            <Field label="College Email" className="md:col-span-2">
              <input type="email" placeholder="student.name@college.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
            </Field>
            <Field label="College">
              <input
                placeholder="e.g. Coimbatore Institute of Technology"
                value={form.collegeName}
                onChange={(e) => setForm({ ...form, collegeName: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Department">
              <input
                placeholder="e.g. Computer Science"
                value={form.departmentName}
                onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Year">
              <select value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value, 10) })} className={inputClass}>
                {[1, 2, 3, 4].map((y) => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </Field>
            <Field label="Commission Tier">
              <select
                value={form.commissionTier}
                onChange={(e) => setForm({ ...form, commissionTier: e.target.value as StudentCommissionTier })}
                className={inputClass}
              >
                {TIER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground mt-1">
                {TIER_OPTIONS.find((o) => o.value === form.commissionTier)?.hint}
              </p>
            </Field>
            <Field label="Password">
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="Initial login password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={`${inputClass} pr-10`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>
            <Button onClick={() => createMutation.mutate()} disabled={!canSubmit || createMutation.isPending} className="md:col-span-2">
              Create Student
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Global search & filters */}
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
          <select value={filterCollege} onChange={(e) => { setFilterCollege(e.target.value); setFilterDepartment(''); setPage(1); }} className={filterSelectClass}>
            <option value="">All colleges</option>
            {colleges?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterDepartment} onChange={(e) => { setFilterDepartment(e.target.value); setPage(1); }} className={filterSelectClass} disabled={!filterCollege}>
            <option value="">All departments</option>
            {filterDepartments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setPage(1); }} className={filterSelectClass}>
            <option value="">All years</option>
            {[1, 2, 3, 4].map((y) => <option key={y} value={y}>Year {y}</option>)}
          </select>
          <select value={filterTrack} onChange={(e) => { setFilterTrack(e.target.value); setPage(1); }} className={filterSelectClass}>
            <option value="">All tracks</option>
            {tracks?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value as 'active' | 'inactive' | 'all'); setPage(1); }} className={filterSelectClass}>
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
            <p className="p-8 text-center text-muted-foreground">Loading students...</p>
          ) : data?.items.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">No students match your search or filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <SortableHeader label="Name" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    <SortableHeader label="College Email" field="email" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    <SortableHeader label="Department" field="department" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    <SortableHeader label="Year" field="year" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    <th className="text-left p-4 text-muted-foreground font-medium">Commission Tier</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Tracks</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Assign Track</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items.map((student) => {
                    const activeTracks = student.trackAssignments.filter((a) => a.isActive);
                    return (
                      <tr key={student.id} className="border-b border-border/50">
                        <td className="p-4 font-medium">
                          {student.firstName} {student.lastName}
                          {!student.isActive && (
                            <span className="ml-2 text-xs text-red-400">(inactive)</span>
                          )}
                        </td>
                        <td className="p-4 text-muted-foreground">{student.email}</td>
                        <td className="p-4">
                          {student.department?.name ?? '—'}
                          {student.college && (
                            <p className="text-xs text-muted-foreground">{student.college.name}</p>
                          )}
                        </td>
                        <td className="p-4">{student.year ? `Year ${student.year}` : '—'}</td>
                        <td className="p-4">
                          <StudentCommissionCell
                            student={student}
                            defaults={commissionDefaults}
                            collegeConfigs={commissionColleges}
                            saving={tierMutation.isPending}
                            onTierChange={(tier) => tierMutation.mutate({ userId: student.id, commissionTier: tier })}
                          />
                        </td>
                        <td className="p-4">
                          {activeTracks.length === 0 ? (
                            <span className="text-muted-foreground">None</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {activeTracks.map((a) => (
                                <span key={a.trackId} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-xs">
                                  {a.track.name}
                                  <button className="text-red-400 hover:text-red-300" onClick={() => unassignMutation.mutate({ userId: student.id, trackId: a.trackId })}>×</button>
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <select value={assignTrackId[student.id] || ''} onChange={(e) => setAssignTrackId({ ...assignTrackId, [student.id]: e.target.value })} className="bg-secondary/50 rounded px-2 py-1 text-xs">
                              <option value="">Select track</option>
                              {tracks?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <Button size="sm" variant="outline" disabled={!assignTrackId[student.id]} onClick={() => assignMutation.mutate({ userId: student.id, trackId: assignTrackId[student.id] })}>
                              Assign
                            </Button>
                          </div>
                        </td>
                        <td className="p-4">
                          {student.isActive && (
                            <Button size="sm" variant="ghost" className="text-red-400" onClick={() => deactivateMutation.mutate(student.id)}>
                              Deactivate
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>

        {data && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground order-2 sm:order-1">
              Showing {data.total === 0 ? 0 : (page - 1) * queryParams.pageSize + 1}–{Math.min(page * queryParams.pageSize, data.total)} of {data.total} student{data.total !== 1 ? 's' : ''}
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
