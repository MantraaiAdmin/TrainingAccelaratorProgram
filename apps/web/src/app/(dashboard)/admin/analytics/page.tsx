'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users, BookOpen, TrendingUp, DollarSign, Activity, Layers, GraduationCap, Building2, Briefcase, UserCheck,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function AdminAnalyticsPage() {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.getAdminAnalytics() as Promise<{
      totalStudents: number;
      enrolledStudents: number;
      totalTracks: number;
      totalEnrollments: number;
      totalCompletions: number;
      enrollmentRevenue: number;
      collegeCommission: number;
      salesCommission: number;
      mentorCommission: number;
      companyProfit: number;
      avgQuizScore: number;
      quizPassRate: number;
    }>,
  });

  const { data: finance, error: financeError } = useQuery({
    queryKey: ['admin-finance'],
    queryFn: () => api.getAdminFinance() as Promise<{
      totalRevenue: number;
      collegeCommission: number;
      salesCommission: number;
      mentorCommission: number;
      companyProfit: number;
      collegeWise: Record<string, number>;
      collegeCommissionWise: Record<string, number>;
      companyNetWise: Record<string, number>;
      trackWise: Record<string, number>;
    }>,
  });

  const gross = finance?.totalRevenue ?? analytics?.enrollmentRevenue ?? 0;
  const collegeComm = finance?.collegeCommission ?? analytics?.collegeCommission ?? 0;
  const salesComm = finance?.salesCommission ?? analytics?.salesCommission ?? 0;
  const mentorComm = finance?.mentorCommission ?? analytics?.mentorCommission ?? 0;
  const companyNet = finance?.companyProfit ?? analytics?.companyProfit ?? 0;

  const stats = [
    { label: 'Total Students', value: analytics?.totalStudents ?? 0, icon: Users, color: 'text-blue-500' },
    { label: 'Enrolled Students', value: analytics?.enrolledStudents ?? 0, icon: GraduationCap, color: 'text-cyan-500' },
    { label: 'Track Enrollments', value: analytics?.totalEnrollments ?? 0, icon: Activity, color: 'text-green-500' },
    { label: 'Published Tracks', value: analytics?.totalTracks ?? 0, icon: Layers, color: 'text-indigo-500' },
    { label: 'Gross Revenue', value: fmt(gross), icon: DollarSign, color: 'text-yellow-500' },
    { label: 'College Share', value: fmt(collegeComm), icon: Building2, color: 'text-orange-500' },
    { label: 'Sales Share', value: fmt(salesComm), icon: Briefcase, color: 'text-pink-500' },
    { label: 'Mentor Share', value: fmt(mentorComm), icon: UserCheck, color: 'text-violet-500' },
    { label: 'Company Net', value: fmt(companyNet), icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'Completions', value: analytics?.totalCompletions ?? 0, icon: BookOpen, color: 'text-purple-500' },
  ];

  const splitChart = [
    { name: 'College', value: collegeComm },
    { name: 'Sales', value: salesComm },
    { name: 'Mentor', value: mentorComm },
    { name: 'Company', value: companyNet },
  ].filter((d) => d.value > 0);

  const collegeChart = finance?.collegeWise
    ? Object.entries(finance.collegeWise).map(([name, value]) => ({ name, value }))
    : [];

  const trackChart = finance?.trackWise
    ? Object.entries(finance.trackWise).map(([name, value]) => ({ name, value }))
    : [];

  const COLORS = ['#f97316', '#ec4899', '#8b5cf6', '#10b981', '#3b82f6'];

  if (error || financeError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400">Failed to load analytics: {(error || financeError)?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Revenue split uses per-college commission rates from{' '}
          <a href="/admin/commissions" className="text-purple-400 hover:underline">Commission settings</a>
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                    <p className="text-lg font-bold mt-1">{isLoading ? '...' : stat.value}</p>
                  </div>
                  <Icon className={`w-6 h-6 flex-shrink-0 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Revenue Split</CardTitle></CardHeader>
          <CardContent>
            {splitChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={splitChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {splitChart.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No enrollment revenue yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quiz Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-3xl font-bold text-purple-500">{analytics?.avgQuizScore ?? 0}%</p>
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-3xl font-bold text-green-500">{analytics?.quizPassRate ?? 0}%</p>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {trackChart.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Gross Revenue by Course Track</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trackChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {collegeChart.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Gross Revenue by College</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={collegeChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
