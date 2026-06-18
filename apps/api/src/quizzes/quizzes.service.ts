import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';

const DEFAULT_QUIZ_SETTINGS = {
  passingScore: 80,
  maxRetries: 3,
  cooldownMinutes: 60,
};

@Injectable()
export class QuizzesService {
  constructor(
    private prisma: PrismaService,
    private gamification: GamificationService,
  ) {}

  private async getQuizSettings() {
    const setting = await this.prisma.platformSetting.findUnique({ where: { key: 'quiz.defaults' } });
    if (setting?.value && typeof setting.value === 'object') {
      return { ...DEFAULT_QUIZ_SETTINGS, ...(setting.value as object) };
    }
    return DEFAULT_QUIZ_SETTINGS;
  }

  async getQuizMeta(userId: string, quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { _count: { select: { questions: true } } },
    });
    if (!quiz) throw new BadRequestException('Quiz not found');

    const settings = await this.getQuizSettings();
    const attempts = await this.prisma.quizAttempt.findMany({
      where: { userId, quizId },
      orderBy: { completedAt: 'desc' },
    });
    const passed = attempts.some((a) => a.passed);
    const passThreshold = quiz.passingScore ?? settings.passingScore;

    return {
      id: quiz.id,
      title: quiz.title,
      timeLimit: quiz.timeLimit,
      passingScore: passThreshold,
      questionCount: quiz._count.questions,
      attemptsUsed: attempts.length,
      maxRetries: settings.maxRetries,
      canRetry: !passed && attempts.length < settings.maxRetries,
      passed,
      lastAttempt: attempts[0] ?? null,
    };
  }

  async submitQuiz(userId: string, quizId: string, answers: Record<string, string>) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });
    if (!quiz) throw new BadRequestException('Quiz not found');

    const settings = await this.getQuizSettings();
    const priorAttempts = await this.prisma.quizAttempt.count({ where: { userId, quizId } });
    const alreadyPassed = await this.prisma.quizAttempt.findFirst({
      where: { userId, quizId, passed: true },
    });

    if (alreadyPassed) {
      throw new BadRequestException('You have already passed this assessment');
    }

    if (priorAttempts >= settings.maxRetries) {
      throw new ForbiddenException(`Maximum retry attempts (${settings.maxRetries}) reached`);
    }

    let score = 0;
    let totalPoints = 0;
    const results: Record<string, boolean> = {};

    for (const q of quiz.questions) {
      totalPoints += q.points;
      const userAnswer = answers[q.id];
      const correct = JSON.stringify(userAnswer) === JSON.stringify(q.correctAnswer);
      results[q.id] = correct;
      if (correct) score += q.points;
    }

    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const passThreshold = quiz.passingScore ?? settings.passingScore;
    const passed = percentage >= passThreshold;

    const attempt = await this.prisma.quizAttempt.create({
      data: { userId, quizId, score, totalPoints, percentage, passed, answers: results },
    });

    if (passed) {
      await this.gamification.awardXP(userId, quiz.xpReward, 'quiz_pass', quizId);
      await this.prisma.progressRecord.upsert({
        where: { userId_subsectionId: { userId, subsectionId: quiz.subsectionId } },
        create: { userId, subsectionId: quiz.subsectionId, isCompleted: true, completedAt: new Date() },
        update: { isCompleted: true, completedAt: new Date() },
      });
    }

    return {
      ...attempt,
      passingScore: passThreshold,
      retriesRemaining: Math.max(0, settings.maxRetries - priorAttempts - 1),
      results,
      explanations: quiz.questions.map((q) => ({ id: q.id, explanation: q.explanation })),
    };
  }

  async getAttempts(userId: string, quizId: string) {
    return this.prisma.quizAttempt.findMany({
      where: { userId, quizId },
      orderBy: { completedAt: 'desc' },
    });
  }
}
