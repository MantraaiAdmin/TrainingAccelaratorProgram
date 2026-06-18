import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class TracksService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string, role?: UserRole) {
    if (role === UserRole.STUDENT && userId) {
      const assignments = await this.prisma.trackAssignment.findMany({
        where: { userId, isActive: true, track: { isPublished: true } },
        include: {
          track: {
            include: { _count: { select: { modules: true } } },
          },
        },
        orderBy: { track: { order: 'asc' } },
      });

      return Promise.all(
        assignments.map(async ({ track }) => ({
          ...track,
          isAssigned: true,
          isLocked: false,
          progressPercent: await this.getTrackProgressPercent(userId, track.id),
        })),
      );
    }

    return this.prisma.track.findMany({
      where: { isPublished: true },
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
      include: {
        _count: { select: { modules: true } },
      },
    });
  }

  private async getTrackProgressPercent(userId: string, trackId: string): Promise<number> {
    const total = await this.prisma.subsection.count({
      where: { chapter: { module: { trackId } } },
    });
    if (!total) return 0;
    const completed = await this.prisma.progressRecord.count({
      where: { userId, trackId, isCompleted: true },
    });
    return Math.round((completed / total) * 100);
  }

  async findBySlug(slug: string, userId?: string, role?: UserRole) {
    const track = await this.prisma.track.findUnique({
      where: { slug },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            chapters: {
              orderBy: { order: 'asc' },
              include: {
                subsections: {
                  orderBy: { order: 'asc' },
                  include: {
                    lesson: true,
                    exercise: { select: { id: true, title: true, difficulty: true } },
                    quiz: { select: { id: true, title: true } },
                  },
                },
              },
            },
          },
        },
        miniProjects: { orderBy: { order: 'asc' } },
        capstoneProjects: true,
        interviewModules: true,
        assignments: true,
      },
    });

    if (!track) throw new NotFoundException('Track not found');

    if (role === UserRole.STUDENT && userId) {
      const assignment = await this.prisma.trackAssignment.findUnique({
        where: { userId_trackId: { userId, trackId: track.id } },
      });
      if (!assignment?.isActive) {
        throw new ForbiddenException('Track not assigned to you');
      }
    }

    let progress: Record<string, boolean> = {};
    const allSubsectionIds = track.modules.flatMap((m) =>
      m.chapters.flatMap((c) => c.subsections.map((s) => s.id)),
    );

    if (userId && allSubsectionIds.length > 0) {
      const records = await this.prisma.progressRecord.findMany({
        where: {
          userId,
          subsectionId: { in: allSubsectionIds },
          isCompleted: true,
        },
        select: { subsectionId: true },
      });
      progress = Object.fromEntries(
        records.filter((r) => r.subsectionId).map((r) => [r.subsectionId!, true]),
      );
    }

    const totalSubsections = allSubsectionIds.length;
    const completedCount = Object.keys(progress).length;
    const progressPercent = totalSubsections > 0 ? Math.round((completedCount / totalSubsections) * 100) : 0;

    return { ...track, progress, progressPercent, totalSubsections, completedCount };
  }

  async getSubsection(subsectionId: string, userId?: string) {
    const subsection = await this.prisma.subsection.findUnique({
      where: { id: subsectionId },
      include: {
        lesson: true,
        exercise: true,
        quiz: { include: { questions: { orderBy: { order: 'asc' } } } },
        chapter: {
          include: {
            module: { include: { track: true } },
          },
        },
      },
    });

    if (!subsection) throw new NotFoundException('Subsection not found');

    if (userId) {
      const trackId = subsection.chapter.module.track.id;
      const assignment = await this.prisma.trackAssignment.findUnique({
        where: { userId_trackId: { userId, trackId } },
      });
      if (!assignment?.isActive) throw new ForbiddenException('Access denied');
    }

    if (subsection.quiz?.questions) {
      subsection.quiz.questions = subsection.quiz.questions.map(({ correctAnswer: _c, explanation: _e, ...q }) => q) as typeof subsection.quiz.questions;
    }

    return subsection;
  }
}
