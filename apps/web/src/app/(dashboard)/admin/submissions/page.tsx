'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ClipboardCheck, Search, X, ArrowUpDown, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, CheckCircle2, XCircle, Eye, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SubmissionRow {
  id: string;
  type: 'LAB' | 'ASSIGNMENT';
  status: string;
  submittedAt: string;
  studentName: string;
  student: { id: string; email: string; firstName: string; lastName: string; year?: number | null };
  collegeName: string;
  departmentName: string | null;
  year: number | null;
  trackName: string;
  track: { id: string; name: string; slug: string };
  moduleTitle: string | null;
  title: string;
  passedTests?: number;
  totalTests?: number;
  code?: string;
  content?: string | null;
  feedback?: string | null;
  score?: number | null;
}

type SortField = 'submittedAt' | 'student' | 'college' | 'year' | 'track' | 'title' | 'status';
type SortOrder = 'asc' | 'desc';

const inputClass =
  'w-full bg-secondary/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500';

const filterSelectClass =
  'bg-secondary/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[140px]';

const stickyActionsClass =
  'sticky right-0 z-20 bg-card/95 backdrop-blur-sm border-l border-border shadow-[-8px_0_16px_-8px_rgba(0,0,0,0.4)]';

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
    <th className="text-left p-3 whitespace-nowrap">
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    SUBMITTED: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    RESUBMIT: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    APPROVED: 'bg-green-500/15 text-green-400 border-green-500/30',
    GRADED: 'bg-green-500/15 text-green-400 border-green-500/30',
    REJECTED: 'bg-red-500/15 text-red-400 border-red-500/30',
  };
  return (
    <span className={cn('text-xs px-2 py-0.5 rounded-full border capitalize', styles[status] || 'bg-secondary text-muted-foreground')}>
      {status.toLowerCase().replace('_', ' ')}
    </span>
  );
}

function isPending(status: string) {
  return status === 'SUBMITTED' || status === 'PENDING' || status === 'RESUBMIT';
}

export default function AdminSubmissionsPage() {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('submittedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [collegeId, setCollegeId] = useState('');
  const [year, setYear] = useState('');
  const [trackId, setTrackId] = useState('');
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [type, setType] = useState<'lab' | 'assignment' | 'all'>('all');
  const [selectedId, setSelectedId] = useState<{ id: string; type: 'LAB' | 'ASSIGNMENT' } | null>(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState('100');

  useEffect(() => setMounted(true), []);

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: 20,
      search: search || undefined,
      sortBy,
      sortOrder,
      collegeId: collegeId || undefined,
      year: year ? parseInt(year, 10) : undefined,
      trackId: trackId || undefined,
      status,
      type,
    }),
    [page, search, sortBy, sortOrder, collegeId, year, trackId, status, type],
  );

  const { data, isLoading } = useQuery({
    queryKey: ['admin-submissions', queryParams],
    queryFn: () =>
      api.getAdminSubmissions(queryParams) as Promise<{
        items: SubmissionRow[];
        pagination: { page: number; pageSize: number; total: number; totalPages: number };
        statusCounts: { pending: number; approved: number; rejected: number };
      }>,
  });

  const { data: selected, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-submission-detail', selectedId?.type, selectedId?.id],
    queryFn: () =>
      api.getAdminSubmissionDetail(
        selectedId!.type === 'LAB' ? 'lab' : 'assignment',
        selectedId!.id,
      ) as Promise<SubmissionRow>,
    enabled: !!selectedId,
  });

  const { data: colleges } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => api.getColleges(),
  });

  const { data: tracks } = useQuery({
    queryKey: ['admin-tracks'],
    queryFn: () => api.getAdminTracks() as Promise<Array<{ id: string; name: string }>>,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ action, target }: { action: 'approve' | 'reject'; target: SubmissionRow }) =>
      api.reviewSubmission(target.type === 'LAB' ? 'lab' : 'assignment', target.id, {
        action,
        feedback: feedback.trim() || undefined,
        score: action === 'approve' && target.type === 'ASSIGNMENT' ? parseInt(score, 10) : undefined,
      }),
    onSuccess: (_, { action }) => {
      toast.success(action === 'approve' ? 'Submission approved' : 'Submission rejected');
      setSelectedId(null);
      setFeedback('');
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-submission-detail'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openReview = useCallback((row: SubmissionRow) => {
    setSelectedId({ id: row.id, type: row.type });
    setFeedback(row.feedback || '');
    setScore(String(row.score ?? 100));
  }, []);

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortBy === field) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
      else {
        setSortBy(field);
        setSortOrder('asc');
      }
      setPage(1);
    },
    [sortBy],
  );

  const applySearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setCollegeId('');
    setYear('');
    setTrackId('');
    setStatus('pending');
    setType('all');
    setPage(1);
  };

  const handleApprove = (target: SubmissionRow) => {
    reviewMutation.mutate({ action: 'approve', target });
  };

  const handleReject = (target: SubmissionRow) => {
    if (!feedback.trim()) {
      toast.error('Please add feedback before rejecting');
      return;
    }
    reviewMutation.mutate({ action: 'reject', target });
  };

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const counts = data?.statusCounts;

  const reviewModal = selectedId && mounted ? createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={() => setSelectedId(null)}
      role="dialog"
      aria-modal="true"
    >
      <Card
        className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-purple-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        {detailLoading || !selected ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading submission...
          </div>
        ) : (
          <>
            <CardHeader className="border-b border-border shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">{selected.title}</CardTitle>
                  <div className="text-sm text-muted-foreground space-y-1 mt-2">
                    <p><strong>{selected.studentName}</strong> · {selected.student.email}</p>
                    <p>{selected.collegeName} · {selected.year ? `Year ${selected.year}` : 'Year N/A'} · {selected.trackName}</p>
                    {selected.moduleTitle && <p>Module: {selected.moduleTitle}</p>}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span>Submitted: {new Date(selected.submittedAt).toLocaleString()}</span>
                      <StatusBadge status={selected.status} />
                    </div>
                    {selected.type === 'LAB' && selected.totalTests != null && (
                      <p>Automated tests: {selected.passedTests}/{selected.totalTests} passed</p>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedId(null)} aria-label="Close">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4 pt-4">
              {(selected.code || selected.content) ? (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Submission code / content</p>
                  <pre className="bg-[#1a1a1a] rounded-lg p-4 text-xs font-mono overflow-x-auto max-h-[320px] whitespace-pre-wrap border border-border/60">
                    {selected.code || selected.content}
                  </pre>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground rounded-lg border border-dashed border-border p-4">
                  No code or text content attached to this submission.
                </p>
              )}
              {selected.type === 'ASSIGNMENT' && isPending(selected.status) && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Score (optional)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className={cn(inputClass, 'mt-1 max-w-[120px]')}
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Feedback {isPending(selected.status) ? '(required for reject)' : ''}
                </label>
                <textarea
                  className={cn(inputClass, 'mt-1 min-h-[100px]')}
                  placeholder="Add feedback for the student..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
            </CardContent>
            <div className="flex flex-wrap justify-end gap-2 p-4 border-t border-border shrink-0 bg-card">
              <Button variant="outline" onClick={() => setSelectedId(null)}>Close</Button>
              {isPending(selected.status) && (
                <>
                  <Button
                    variant="destructive"
                    disabled={reviewMutation.isPending}
                    onClick={() => handleReject(selected)}
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                  <Button
                    disabled={reviewMutation.isPending}
                    onClick={() => handleApprove(selected)}
                  >
                    {reviewMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                    )}
                    Approve
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </Card>
    </div>,
    document.body,
  ) : null;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardCheck className="w-7 h-7 text-purple-400" />
          Lab & Assignment Reviews
        </h1>
        <p className="text-muted-foreground mt-1">
          Click a row or use the action buttons to review, approve, or reject submissions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-amber-500/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending review</p>
            <p className="text-2xl font-bold text-amber-400">{counts?.pending ?? '—'}</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-green-400">{counts?.approved ?? '—'}</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Rejected</p>
            <p className="text-2xl font-bold text-red-400">{counts?.rejected ?? '—'}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Search & filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-1 min-w-[220px] gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  className={cn(inputClass, 'pl-9')}
                  placeholder="Search student name or email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                />
              </div>
              <Button onClick={applySearch}>Search</Button>
            </div>
            <select className={filterSelectClass} value={collegeId} onChange={(e) => { setCollegeId(e.target.value); setPage(1); }}>
              <option value="">All colleges</option>
              {(colleges ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select className={filterSelectClass} value={year} onChange={(e) => { setYear(e.target.value); setPage(1); }}>
              <option value="">All years</option>
              {[1, 2, 3, 4].map((y) => (
                <option key={y} value={y}>Year {y}</option>
              ))}
            </select>
            <select className={filterSelectClass} value={trackId} onChange={(e) => { setTrackId(e.target.value); setPage(1); }}>
              <option value="">All tracks</option>
              {(tracks ?? []).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <select className={filterSelectClass} value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1); }}>
              <option value="pending">Pending review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All statuses</option>
            </select>
            <select className={filterSelectClass} value={type} onChange={(e) => { setType(e.target.value as typeof type); setPage(1); }}>
              <option value="all">Labs + assignments</option>
              <option value="lab">Labs only</option>
              <option value="assignment">Assignments only</option>
            </select>
            <Button variant="outline" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" /> Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1100px]">
              <thead className="border-b border-border bg-secondary/30">
                <tr>
                  <SortableHeader label="Submitted" field="submittedAt" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <SortableHeader label="Student" field="student" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <SortableHeader label="College" field="college" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <SortableHeader label="Year" field="year" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <SortableHeader label="Track" field="track" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <SortableHeader label="Lab" field="title" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <SortableHeader label="Status" field="status" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <th className={cn('text-right p-3 whitespace-nowrap text-muted-foreground font-medium', stickyActionsClass)}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">Loading submissions...</td>
                  </tr>
                )}
                {!isLoading && items.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">No submissions match your filters.</td>
                  </tr>
                )}
                {items.map((row) => (
                  <tr
                    key={`${row.type}-${row.id}`}
                    className="border-b border-border/50 hover:bg-secondary/20 cursor-pointer group"
                    onClick={() => openReview(row)}
                  >
                    <td className="p-3 whitespace-nowrap text-muted-foreground">
                      {new Date(row.submittedAt).toLocaleString()}
                    </td>
                    <td className="p-3 min-w-[160px]">
                      <div className="font-medium">{row.studentName}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[180px]">{row.student.email}</div>
                    </td>
                    <td className="p-3 max-w-[140px] truncate" title={row.collegeName}>{row.collegeName}</td>
                    <td className="p-3 whitespace-nowrap">{row.year ? `Y${row.year}` : '—'}</td>
                    <td className="p-3 max-w-[160px]">
                      <div className="truncate" title={row.trackName}>{row.trackName}</div>
                      {row.moduleTitle && (
                        <div className="text-xs text-muted-foreground truncate" title={row.moduleTitle}>{row.moduleTitle}</div>
                      )}
                    </td>
                    <td className="p-3 max-w-[140px] truncate" title={row.title}>{row.title}</td>
                    <td className="p-3"><StatusBadge status={row.status} /></td>
                    <td className={cn('p-3 text-right', stickyActionsClass)} onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="secondary" size="sm" onClick={() => openReview(row)}>
                          <Eye className="w-3.5 h-3.5" /> Open
                        </Button>
                        {isPending(row.status) && (
                          <>
                            <Button
                              size="sm"
                              className="hidden xl:inline-flex"
                              disabled={reviewMutation.isPending}
                              onClick={() => handleApprove(row)}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="hidden xl:inline-flex"
                              disabled={reviewMutation.isPending}
                              onClick={() => {
                                openReview(row);
                                toast.message('Add feedback in the review panel, then click Reject');
                              }}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} submissions
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {reviewModal}
    </div>
  );
}
