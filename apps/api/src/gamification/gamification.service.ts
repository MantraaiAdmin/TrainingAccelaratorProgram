import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calculateLevel } from '@constel/config';

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  async awardXP(userId: string, amount: number, reason: string, sourceId?: string) {
    await this.prisma.xPHistory.create({
      data: { userId, amount, reason, sourceId },
    });

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: amount } },
    });

    const newLevel = calculateLevel(user.xp);
    if (newLevel > user.level) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { level: newLevel },
      });
    }

    return { xp: user.xp + amount, level: newLevel };
  }

  async getLeaderboard(limit = 20) {
    const users = await this.prisma.user.findMany({
      where: { role: 'STUDENT', isActive: true },
      orderBy: { xp: 'desc' },
      take: limit,
      select: { id: true, firstName: true, lastName: true, xp: true, level: true, avatarUrl: true },
    });

    return users.map((u, i) => ({
      rank: i + 1,
      userId: u.id,
      name: `${u.firstName} ${u.lastName}`,
      xp: u.xp,
      level: u.level,
      avatarUrl: u.avatarUrl,
    }));
  }

  async getUserAchievements(userId: string) {
    return this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { earnedAt: 'desc' },
    });
  }

  async syncAchievements(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const [achievements, earned, lessonCount, exerciseCount, perfectQuizzes, trackCompletions] =
      await Promise.all([
        this.prisma.achievement.findMany(),
        this.prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
        this.prisma.progressRecord.count({ where: { userId, isCompleted: true } }),
        this.prisma.exerciseSubmission.count({ where: { userId, status: 'APPROVED' } }),
        this.prisma.quizAttempt.count({ where: { userId, score: 100 } }),
        this.prisma.progressRecord.groupBy({
          by: ['trackId'],
          where: { userId, isCompleted: true, trackId: { not: null } },
          _count: { id: true },
        }),
      ]);

    const earnedIds = new Set(earned.map((e) => e.achievementId));

    for (const ach of achievements) {
      if (earnedIds.has(ach.id)) continue;

      let shouldAward = false;
      switch (ach.type) {
        case 'LESSON_COMPLETE':
          shouldAward = lessonCount >= 1;
          break;
        case 'QUIZ_MASTER':
          shouldAward = perfectQuizzes >= 1;
          break;
        case 'STREAK':
          shouldAward = user.streak >= 7;
          break;
        case 'TRACK_COMPLETE':
          shouldAward = trackCompletions.some((t) => t._count.id >= 10);
          break;
        case 'XP_MILESTONE':
          shouldAward = user.xp >= ach.xpRequired;
          break;
        case 'PROJECT_COMPLETE':
          shouldAward = exerciseCount >= 10;
          break;
        default:
          break;
      }

      if (shouldAward) {
        await this.prisma.userAchievement.create({
          data: { userId, achievementId: ach.id },
        });
      }
    }
  }

  async updateStreak(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const lastLogin = user.lastLoginAt;
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = user.streak;
    if (!lastLogin) {
      newStreak = 1;
    } else if (lastLogin.toDateString() === yesterday.toDateString()) {
      newStreak = user.streak + 1;
      await this.awardXP(userId, 5, 'streak_bonus');
    } else if (lastLogin.toDateString() !== now.toDateString()) {
      newStreak = 1;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { streak: newStreak, lastLoginAt: now },
    });

    return newStreak;
  }
}
