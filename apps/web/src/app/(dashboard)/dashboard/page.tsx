'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Button } from '@/components/ui/button';
import {
  BookOpen, Trophy, Flame, Star, Award, TrendingUp, ArrowRight, Zap,
  FileText, Medal, Target, Sparkles, Clock, CheckCircle2, CircleDashed,
} from 'lucide-react';
import { cn, formatXP, getDifficultyColor, getDifficultyLabel } from '@/lib/utils';
import { BRAND } from '@/lib/branding';

interface DashboardData {
  user: {
    firstName: string;
    lastName: string;
    xp: number;
    level: number;
    streak: number;
    xpToNextLevel: number;
    levelProgress: number;
  };
  assignedTracks: Array<{
    id: string;
    name: string;
    slug: string;
    difficulty: string;
    tagline?: string;
    progressPercent: number;
    completedLessons: number;
    totalLessons: number;
  }>;
  overallProgress: { completed: number; total: number; percent: number };
  badges: number;
  badgeList: Array<{ id: string; name: string; description: string; icon: string; earnedAt: string }>;
  certificates: number;
  certificateList: Array<{ id: string; certificateId: string; trackName: string; issuedAt: string }>;
  pendingAssignments: number;
  pendingAssignmentList: Array<{
    id: string;
    title: string;
    trackName: string;
    trackSlug: string;
    deadline: string | null;
    status: string;
  }>;
  leaderboardRank: number;
  interviewReadiness: number;
  quizPassRate: number;
  recentActivity: Array<{
    id: string;
    reason: string;
    amount: number;
    createdAt: string;
    title: string;
    context: string | null;
  }>;
}

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const statAccents = [
  { ring: 'from-yellow-500/20 to-amber-600/5', icon: 'text-yellow-400', glow: 'shadow-yellow-500/10' },
  { ring: 'from-purple-500/20 to-violet-600/5', icon: 'text-purple-400', glow: 'shadow-purple-500/10' },
  { ring: 'from-orange-500/20 to-red-600/5', icon: 'text-orange-400', glow: 'shadow-orange-500/10' },
  { ring: 'from-blue-500/20 to-cyan-600/5', icon: 'text-blue-400', glow: 'shadow-blue-500/10' },
];

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.getDashboard() as Promise<DashboardData>,
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-36 bg-secondary/40 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-secondary/40 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-secondary/40 rounded-2xl" />
          <div className="h-96 bg-secondary/40 rounded-2xl" />
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'XP Points', value: formatXP(data?.user.xp || 0), sub: `${data?.user.xpToNextLevel ?? 0} to next level`, icon: Zap },
    { label: 'Level', value: data?.user.level || 1, sub: `${data?.user.levelProgress ?? 0}% progress`, icon: Star },
    { label: 'Streak', value: `${data?.user.streak || 0}`, sub: 'days in a row', icon: Flame },
    { label: 'Rank', value: `#${data?.leaderboardRank || '—'}`, sub: 'on leaderboard', icon: Trophy },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-purple-950/40 via-background to-background p-6 md:p-8"
      >
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-sm text-purple-300/80 font-medium tracking-wide uppercase">Your learning hub</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">
              Welcome back, <span className="gradient-text">{data?.user.firstName}</span>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Continue your journey with {BRAND.name} — {data?.overallProgress.completed ?? 0} of{' '}
              {data?.overallProgress.total ?? 0} lessons completed across your tracks.
            </p>
          </div>
          <div className="flex-shrink-0 w-full md:w-56 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall progress</span>
              <span className="font-semibold text-purple-400">{data?.overallProgress.percent ?? 0}%</span>
            </div>
            <ProgressBar value={data?.overallProgress.percent ?? 0} className="h-2.5" />
            <p className="text-xs text-muted-foreground text-right">
              Level {data?.user.level} · {formatXP(data?.user.xp ?? 0)} XP
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const accent = statAccents[i];
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div
                className={cn(
                  'rounded-2xl border border-border/60 bg-gradient-to-br p-5 shadow-lg',
                  accent.ring,
                  accent.glow,
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                    <p className="text-2xl md:text-3xl font-bold mt-1 tabular-nums">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{stat.sub}</p>
                  </div>
                  <div className={cn('p-2.5 rounded-xl bg-background/50 border border-border/40', accent.icon)}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tracks */}
          <Card className="border-border/60 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-secondary/20">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-purple-500" />
                Assigned Tracks
              </CardTitle>
              <Link href="/tracks">
                <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {data?.assignedTracks?.length ? (
                data.assignedTracks.map((track) => (
                  <Link key={track.id} href={`/learn/${track.slug}`}>
                    <div className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-border/50 bg-secondary/20 hover:bg-secondary/40 hover:border-purple-500/30 transition-all">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold group-hover:text-purple-300 transition-colors">{track.name}</h3>
                          <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', getDifficultyColor(track.difficulty))}>
                            {getDifficultyLabel(track.difficulty)}
                          </span>
                        </div>
                        {track.tagline && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{track.tagline}</p>
                        )}
                        <div className="mt-3 space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              {track.completedLessons}/{track.totalLessons} lessons
                            </span>
                            <span className="font-medium">{track.progressPercent}%</span>
                          </div>
                          <ProgressBar value={track.progressPercent} />
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-purple-400 shrink-0 hidden sm:block" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No tracks assigned yet. Contact your admin.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card className="border-border/60">
            <CardHeader className="px-6 pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              {data?.recentActivity?.length ? (
                <ul className="divide-y divide-border/50">
                  {data.recentActivity.map((activity) => (
                    <li
                      key={activity.id}
                      className="grid grid-cols-[2rem_minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 items-center py-3 first:pt-0 last:pb-0"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-snug truncate">{activity.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {activity.context ? `${activity.context} · ` : ''}
                          {formatRelativeTime(activity.createdAt)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-emerald-400 tabular-nums whitespace-nowrap pl-2">
                        +{activity.amount} XP
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center py-8 text-muted-foreground">Start learning to earn XP and unlock badges!</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick stats */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatRow
                icon={<Medal className="w-4 h-4 text-amber-400" />}
                label="Badges earned"
                value={String(data?.badges ?? 0)}
                hint={data?.badges ? `${data.badgeList.length} shown below` : 'Complete lessons to earn'}
              />

              <Link href="/certificates" className="block">
                <StatRow
                  icon={<Award className="w-4 h-4 text-purple-400" />}
                  label="Certificates"
                  value={String(data?.certificates ?? 0)}
                  hint={data?.certificates ? 'View certificates' : 'Finish tracks to earn'}
                />
              </Link>

              <StatRow
                icon={<FileText className="w-4 h-4 text-orange-400" />}
                label="Pending assignments"
                value={String(data?.pendingAssignments ?? 0)}
                hint={data?.pendingAssignments ? 'Action required' : 'All caught up'}
              />

              <div className="pt-2 border-t border-border/50 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Interview readiness</span>
                  <span className="font-semibold">{data?.interviewReadiness ?? 0}%</span>
                </div>
                <ProgressBar value={data?.interviewReadiness ?? 0} />
                <p className="text-[10px] text-muted-foreground">
                  Based on track progress ({data?.overallProgress.percent ?? 0}%), quiz pass rate ({data?.quizPassRate ?? 0}%)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Badges preview */}
          {data?.badgeList && data.badgeList.length > 0 && (
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Medal className="w-4 h-4 text-amber-400" />
                  Recent Badges
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 space-y-2">
                {data.badgeList.slice(0, 4).map((badge) => (
                  <div key={badge.id} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 items-center p-2.5 rounded-lg bg-secondary/30">
                    <span className="text-2xl leading-none text-center">{badge.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(badge.earnedAt)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Pending assignments */}
          {data?.pendingAssignmentList && data.pendingAssignmentList.length > 0 && (
            <Card className="border-border/60 border-orange-500/20">
              <CardHeader className="px-6 pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-400 shrink-0" />
                  Assignments Due
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 space-y-2">
                {data.pendingAssignmentList.slice(0, 4).map((a) => (
                  <Link key={a.id} href={`/learn/${a.trackSlug}`} className="block">
                    <div className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3 items-start p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <div className="flex h-5 w-5 items-center justify-center shrink-0 mt-0.5">
                        {a.status === 'not_started' ? (
                          <CircleDashed className="w-4 h-4 text-orange-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-snug">{a.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.trackName}</p>
                        {a.deadline && (
                          <p className="text-xs text-orange-400/90 mt-1">
                            Due {new Date(a.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Certificates preview */}
          {data?.certificateList && data.certificateList.length > 0 && (
            <Card className="border-border/60">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Certificates
                </CardTitle>
                <Link href="/certificates" className="text-xs text-purple-400 hover:underline">View all</Link>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.certificateList.slice(0, 3).map((cert) => (
                  <div key={cert.id} className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20">
                    <p className="text-sm font-medium">{cert.trackName}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {cert.certificateId} · {new Date(cert.issuedAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* AI assistant */}
          <Card className="gradient-bg text-white border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI2IDQ4YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
            <CardContent className="pt-6 relative">
              <Sparkles className="w-8 h-8" />
              <h3 className="font-bold mt-3 text-lg">{BRAND.aiAssistantName}</h3>
              <p className="text-sm text-white/85 mt-1 leading-relaxed">{BRAND.aiTagline}</p>
              <p className="text-xs text-white/55 mt-4">Tap the sparkle button at the bottom right →</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/25 hover:bg-secondary/40 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-background/60 border border-border/40 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          {hint && <p className="text-[10px] text-muted-foreground/70">{hint}</p>}
        </div>
      </div>
      <span className="text-xl font-bold tabular-nums">{value}</span>
    </div>
  );
}
