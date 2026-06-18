'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bot, Coins, MessageSquare, Users, Zap } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface AiUsageStudent {
  userId: string;
  name: string;
  email: string;
  year?: number;
  college: string;
  department: string;
  totalCalls: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostInr: number;
  lastUsedAt?: string;
  usageByType: Array<{ type: string; calls: number; tokens: number }>;
}

interface AiUsageResponse {
  summary: {
    periodDays: number;
    totalCalls: number;
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    estimatedCostInr: number;
    todayCalls: number;
    todayTokens: number;
    todayCostInr: number;
    activeStudentsWithUsage: number;
    totalStudents: number;
    provider: string;
  };
  usageByType: Array<{ type: string; calls: number; tokens: number }>;
  dailyUsage: Array<{ date: string; tokens: number; costInr: number; calls: number }>;
  students: AiUsageStudent[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

const TYPE_LABELS: Record<string, string> = {
  CHAT: 'Chat',
  STREAM: 'Stream',
  HINT: 'Hints',
  MOCK_INTERVIEW: 'Mock Interview',
  SCOPE_REFUSAL: 'Scope Guard',
};

export function QwenUsageMonitor() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [days, setDays] = useState(30);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-ai-usage', page, search, days],
    queryFn: () =>
      api.getAdminAiUsage({ page, pageSize: 10, search: search || undefined, days }) as Promise<AiUsageResponse>,
  });

  const summary = data?.summary;

  const statCards = [
    {
      label: 'Total API Calls',
      value: summary?.totalCalls ?? 0,
      sub: `${summary?.todayCalls ?? 0} today`,
      icon: MessageSquare,
      color: 'text-cyan-500',
    },
    {
      label: 'Total Tokens',
      value: (summary?.totalTokens ?? 0).toLocaleString('en-IN'),
      sub: `${(summary?.todayTokens ?? 0).toLocaleString('en-IN')} today`,
      icon: Zap,
      color: 'text-violet-500',
    },
    {
      label: 'Est. Cost (INR)',
      value: `₹${(summary?.estimatedCostInr ?? 0).toFixed(2)}`,
      sub: `₹${(summary?.todayCostInr ?? 0).toFixed(2)} today`,
      icon: Coins,
      color: 'text-amber-500',
    },
    {
      label: 'Students Using AI',
      value: summary?.activeStudentsWithUsage ?? 0,
      sub: `of ${summary?.totalStudents ?? 0} enrolled`,
      icon: Users,
      color: 'text-emerald-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-cyan-500" />
          <div>
            <h2 className="text-xl font-bold">Qwen AI Usage Monitor</h2>
            <p className="text-sm text-muted-foreground">
              Token usage & estimated cost per student · last {days} days
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={days}
            onChange={(e) => {
              setDays(Number(e.target.value));
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Input
            placeholder="Search student..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-48"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold mt-1">{isLoading ? '…' : stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                  </div>
                  <Icon className={`w-7 h-7 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Daily Token Usage</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.dailyUsage?.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.dailyUsage}>
                  <defs>
                    <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v: number, name: string) =>
                      name === 'tokens' ? [v.toLocaleString('en-IN'), 'Tokens'] : [v, name]
                    }
                  />
                  <Area type="monotone" dataKey="tokens" stroke="#06b6d4" fill="url(#tokenGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12 text-sm">
                No AI usage recorded yet. Usage appears when students use the AI tutor.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usage by Feature</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.usageByType ?? []).length === 0 && !isLoading && (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            )}
            {(data?.usageByType ?? []).map((item) => (
              <div key={item.type} className="flex justify-between items-center text-sm">
                <span className="font-medium">{TYPE_LABELS[item.type] ?? item.type}</span>
                <span className="text-muted-foreground">
                  {item.calls} calls · {item.tokens.toLocaleString('en-IN')} tok
                </span>
              </div>
            ))}
            {summary && (
              <div className="pt-3 border-t text-xs text-muted-foreground space-y-1">
                <p>Prompt: {summary.promptTokens.toLocaleString('en-IN')} tokens</p>
                <p>Completion: {summary.completionTokens.toLocaleString('en-IN')} tokens</p>
                <p>Provider: {summary.provider}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage by Student</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="p-3 font-medium">Student</th>
                  <th className="p-3 font-medium">College / Dept</th>
                  <th className="p-3 font-medium">Year</th>
                  <th className="p-3 font-medium text-right">Calls</th>
                  <th className="p-3 font-medium text-right">Tokens</th>
                  <th className="p-3 font-medium text-right">Est. Cost</th>
                  <th className="p-3 font-medium">Last Used</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Loading…
                    </td>
                  </tr>
                )}
                {!isLoading && (data?.students ?? []).length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No student AI usage in this period
                    </td>
                  </tr>
                )}
                {(data?.students ?? []).map((s) => (
                  <tr key={s.userId} className="border-b hover:bg-muted/20">
                    <td className="p-3">
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {s.college}
                      <br />
                      <span className="text-xs">{s.department}</span>
                    </td>
                    <td className="p-3">{s.year ?? '—'}</td>
                    <td className="p-3 text-right">{s.totalCalls}</td>
                    <td className="p-3 text-right">{s.totalTokens.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right">₹{s.estimatedCostInr.toFixed(3)}</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {s.lastUsedAt ? new Date(s.lastUsedAt).toLocaleString('en-IN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} students)
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 text-sm rounded border disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 text-sm rounded border disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
