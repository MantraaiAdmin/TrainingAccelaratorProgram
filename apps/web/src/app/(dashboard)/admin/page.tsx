'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { QwenUsageMonitor } from '@/components/admin/qwen-usage-monitor';
import Link from 'next/link';
import { Award } from 'lucide-react';
import { BRAND } from '@/lib/branding';

export default function AdminDashboardPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.getAdminAnalytics() as Promise<{
      totalStudents: number;
      activeStudents: number;
      enrolledStudents: number;
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

  const { data: finance } = useQuery({
    queryKey: ['admin-finance'],
    queryFn: () => api.getAdminFinance() as Promise<{
      totalRevenue: number;
      collegeCommission: number;
      salesCommission: number;
      mentorCommission: number;
      companyProfit: number;
      collegeWise: Record<string, number>;
    }>,
  });

  const gross = finance?.totalRevenue ?? analytics?.enrollmentRevenue ?? 0;
  const companyNet = finance?.companyProfit ?? analytics?.companyProfit ?? 0;

  const stats = [
    { label: 'Total Students', value: analytics?.totalStudents || 0, icon: Users, color: 'text-blue-500' },
    { label: 'Enrolled', value: analytics?.enrolledStudents || 0, icon: Activity, color: 'text-green-500' },
    { label: 'Gross Revenue', value: `₹${gross.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-yellow-500' },
    { label: 'Company Net', value: `₹${companyNet.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-500' },
  ];

  const chartData = finance?.collegeWise
    ? Object.entries(finance.collegeWise).map(([name, value]) => ({ name, value }))
    : [];

  const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">{BRAND.name} Platform Management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{isLoading ? '...' : stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Quiz Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-3xl font-bold text-purple-500">{analytics?.avgQuizScore || 0}%</p>
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-3xl font-bold text-green-500">{analytics?.quizPassRate || 0}%</p>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>College-wise Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No revenue data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue by College</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="w-5 h-5 text-cyan-500" />
            College Pitch — Sample Credentials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Preview internship certificate, LoR, hackathon certificate, and paid internship
            completion letter for college demos.
          </p>
          <Link
            href="/admin/sample-credentials"
            className="inline-flex items-center text-sm font-medium text-cyan-600 hover:text-cyan-500"
          >
            Open Sample Credentials →
          </Link>
        </CardContent>
      </Card>

      <QwenUsageMonitor />
    </div>
  );
}
