import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { calculateLevel, LEVEL_THRESHOLDS, xpToNextLevel } from '@constel/config';

@Injectable()
export class ProgressService {
  constructor(
    private prisma: PrismaService,
    private gamification: GamificationService,
  ) {}

  async markComplete(userId: string, subsectionId: string) {
    const subsection = await this.prisma.subsection.findUnique({
      where: { id: subsectionId },
      include: {
        lesson: true,
        chapter: { include: { module: { select: { trackId: true } } } },
      },
    });

    if (!subsection) throw new NotFoundException('Subsection not found');

    const trackId = subsection.chapter.module.trackId;

    const record = await this.prisma.progressRecord.upsert({
      where: { userId_subsectionId: { userId, subsectionId } },
      create: { userId, subsectionId, trackId, isCompleted: true, completedAt: new Date() },
      update: { isCompleted: true, completedAt: new Date(), trackId },
    });

    if (subsection.lesson) {
      await this.gamification.awardXP(userId, subsection.lesson.xpReward, 'lesson_complete', subsectionId);
    } else {
      await this.gamification.awardXP(userId, 5, 'subsection_complete', subsectionId);
    }

    return record;
  }

  async getDashboard(userId: string) {
    await this.gamification.syncAchievements(userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        trackAssignments: {
          where: { isActive: true },
          include: { track: { select: { id: true, name: true, slug: true, difficulty: true, tagline: true } } },
        },
        certificates: { orderBy: { issuedAt: 'desc' }, take: 5 },
        userAchievements: {
          include: { achievement: true },
          orderBy: { earnedAt: 'desc' },
          take: 6,
        },
      },
    });

    if (!user) return null;

    const trackIds = user.trackAssignments.map((a) => a.track.id);

    const badgeTotal = await this.prisma.userAchievement.count({ where: { userId } });
    const certificateTotal = await this.prisma.certificate.count({ where: { userId } });

    const [completedCount, totalSubsections, pendingAssignmentRows, quizAttempts, mockInterviews] =
      await Promise.all([
        this.prisma.progressRecord.count({ where: { userId, isCompleted: true } }),
        trackIds.length
          ? this.prisma.subsection.count({
              where: { chapter: { module: { trackId: { in: trackIds } } } },
            })
          : Promise.resolve(0),
        trackIds.length
          ? this.prisma.assignment.findMany({
              where: { trackId: { in: trackIds } },
              include: {
                track: { select: { name: true, slug: true } },
                module: { select: { id: true, order: true, title: true } },
                submissions: { where: { userId }, take: 1, orderBy: { submittedAt: 'desc' } },
              },
              orderBy: [{ module: { order: 'asc' } }, { deadline: 'asc' }],
            })
          : Promise.resolve([]),
        this.prisma.quizAttempt.findMany({ where: { userId }, select: { passed: true, score: true } }),
        this.prisma.mockInterview.count({ where: { userId, completedAt: { not: null } } }),
      ]);

    const unlockedModuleIds = await this.getUnlockedModuleIds(userId, trackIds);

    const pendingAssignments = pendingAssignmentRows.filter((a) => {
      if (a.moduleId && !unlockedModuleIds.has(a.moduleId)) return false;
      const sub = a.submissions[0];
      if (!sub) return true;
      return sub.status === 'PENDING' || sub.status === 'RESUBMIT' || sub.status === 'REJECTED';
    });

    // Show at most the current week's open assignments (avoid listing all 8+ weeks at once)
    const currentWeekAssignments = pendingAssignments.slice(0, 2);

    const assignedTracks = await Promise.all(
      user.trackAssignments.map(async (a) => {
        const trackTotal = await this.prisma.subsection.count({
          where: { chapter: { module: { trackId: a.track.id } } },
        });
        const trackCompleted = await this.prisma.progressRecord.count({
          where: { userId, trackId: a.track.id, isCompleted: true },
        });
        const progressPercent = trackTotal ? Math.round((trackCompleted / trackTotal) * 100) : 0;
        return {
          ...a.track,
          progressPercent,
          completedLessons: trackCompleted,
          totalLessons: trackTotal,
        };
      }),
    );

    const overallPercent = totalSubsections
      ? Math.round((completedCount / totalSubsections) * 100)
      : 0;

    const quizPassRate = quizAttempts.length
      ? Math.round((quizAttempts.filter((q) => q.passed).length / quizAttempts.length) * 100)
      : 0;
    const interviewReadiness = Math.min(
      100,
      Math.round(overallPercent * 0.45 + quizPassRate * 0.35 + Math.min(100, mockInterviews * 20) * 0.2),
    );
    const interviewReadinessHint =
      interviewReadiness === 0
        ? 'Complete lessons, pass weekly quizzes, and practice interview prep to build readiness.'
        : interviewReadiness < 50
          ? 'Good start — keep completing modules and mock interviews.'
          : 'Strong progress — finish capstone and interview modules to maximize readiness.';

    const leaderboard = await this.gamification.getLeaderboard(100);
    const rank = leaderboard.findIndex((e) => e.userId === userId) + 1;

    const level = calculateLevel(user.xp);
    const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
    const nextThreshold = LEVEL_THRESHOLDS[level] ?? currentThreshold + 1000;
    const levelProgress =
      nextThreshold > currentThreshold
        ? Math.round(((user.xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
        : 100;

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        xp: user.xp,
        level,
        streak: user.streak,
        avatarUrl: user.avatarUrl,
        xpToNextLevel: xpToNextLevel(user.xp),
        levelProgress,
      },
      assignedTracks,
      overallProgress: {
        completed: completedCount,
        total: totalSubsections,
        percent: overallPercent,
      },
      badges: badgeTotal,
      badgeList: user.userAchievements.map((ua) => ({
        id: ua.achievement.id,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        earnedAt: ua.earnedAt,
      })),
      certificates: certificateTotal,
      certificateList: user.certificates.map((c) => ({
        id: c.id,
        certificateId: c.certificateId,
        trackName: c.trackName,
        issuedAt: c.issuedAt,
      })),
      pendingAssignments: currentWeekAssignments.length,
      pendingAssignmentList: currentWeekAssignments.map((a) => {
        const sub = a.submissions[0];
        return {
          id: a.id,
          title: a.title,
          trackName: a.track.name,
          trackSlug: a.track.slug,
          moduleTitle: a.module?.title,
          deadline: a.deadline,
          status: !sub ? 'not_started' : sub.status.toLowerCase(),
        };
      }),
      leaderboardRank: rank || 0,
      interviewReadiness,
      interviewReadinessHint,
      quizPassRate,
      recentActivity: await this.enrichRecentActivity(userId),
    };
  }

  private async enrichRecentActivity(userId: string) {
    const activities = await this.prisma.xPHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });

    if (!activities.length) return [];

    const subsectionIds = new Set<string>();
    const quizIds = new Set<string>();
    const exerciseIds = new Set<string>();

    for (const a of activities) {
      if (!a.sourceId) continue;
      if (a.reason === 'lesson_complete' || a.reason === 'subsection_complete') {
        subsectionIds.add(a.sourceId);
      } else if (a.reason === 'quiz_pass') {
        quizIds.add(a.sourceId);
      } else if (a.reason === 'coding_exercise') {
        exerciseIds.add(a.sourceId);
      }
    }

    const [subsections, quizzes, exercises] = await Promise.all([
      subsectionIds.size
        ? this.prisma.subsection.findMany({
            where: { id: { in: [...subsectionIds] } },
            select: {
              id: true,
              title: true,
              chapter: { select: { title: true, module: { select: { title: true } } } },
            },
          })
        : [],
      quizIds.size
        ? this.prisma.quiz.findMany({
            where: { id: { in: [...quizIds] } },
            select: { id: true, title: true, subsection: { select: { title: true } } },
          })
        : [],
      exerciseIds.size
        ? this.prisma.codingExercise.findMany({
            where: { id: { in: [...exerciseIds] } },
            select: { id: true, title: true },
          })
        : [],
    ]);

    const subsectionMap = new Map(subsections.map((s) => [s.id, s]));
    const quizMap = new Map(quizzes.map((q) => [q.id, q]));
    const exerciseMap = new Map(exercises.map((e) => [e.id, e]));

    return activities.map((a) => {
      let title = this.defaultActivityTitle(a.reason);
      let context: string | null = null;

      if (a.sourceId) {
        if (a.reason === 'lesson_complete' || a.reason === 'subsection_complete') {
          const sub = subsectionMap.get(a.sourceId);
          if (sub) {
            title = `Completed: ${sub.title}`;
            context = sub.chapter.module.title;
          }
        } else if (a.reason === 'quiz_pass') {
          const quiz = quizMap.get(a.sourceId);
          if (quiz) {
            title = `Quiz passed: ${quiz.title || quiz.subsection.title}`;
            context = quiz.subsection.title;
          }
        } else if (a.reason === 'coding_exercise') {
          const exercise = exerciseMap.get(a.sourceId);
          if (exercise) {
            title = `Exercise completed: ${exercise.title}`;
          }
        }
      }

      return {
        id: a.id,
        reason: a.reason,
        amount: a.amount,
        createdAt: a.createdAt,
        title,
        context,
      };
    });
  }

  /** Week 1 always unlocked; later weeks unlock after passing the previous week's quiz. */
  private async getUnlockedModuleIds(userId: string, trackIds: string[]): Promise<Set<string>> {
    const unlocked = new Set<string>();
    if (!trackIds.length) return unlocked;

    const modules = await this.prisma.module.findMany({
      where: { trackId: { in: trackIds } },
      orderBy: [{ trackId: 'asc' }, { order: 'asc' }],
      include: {
        chapters: {
          where: { title: 'Weekly Assessment' },
          include: {
            subsections: {
              where: { contentType: 'QUIZ' },
              include: { quiz: { select: { id: true } } },
            },
          },
        },
      },
    });

    const byTrack = new Map<string, typeof modules>();
    for (const mod of modules) {
      const list = byTrack.get(mod.trackId) ?? [];
      list.push(mod);
      byTrack.set(mod.trackId, list);
    }

    for (const trackId of trackIds) {
      const trackModules = byTrack.get(trackId) ?? [];
      for (let i = 0; i < trackModules.length; i++) {
        unlocked.add(trackModules[i].id);
        if (i === 0) continue;
        const prevQuizId = trackModules[i - 1].chapters.flatMap((c) => c.subsections)[0]?.quiz?.id;
        if (!prevQuizId) continue;
        const passed = await this.prisma.quizAttempt.findFirst({
          where: { userId, quizId: prevQuizId, passed: true },
        });
        if (!passed) break;
      }
    }

    return unlocked;
  }

  private defaultActivityTitle(reason: string): string {
    const labels: Record<string, string> = {
      lesson_complete: 'Lesson completed',
      subsection_complete: 'Section completed',
      quiz_pass: 'Quiz passed',
      coding_exercise: 'Coding exercise completed',
      streak_bonus: 'Streak bonus',
      assignment: 'Assignment submitted',
    };
    return labels[reason] ?? reason.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
