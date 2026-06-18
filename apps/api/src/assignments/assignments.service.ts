import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  async getByTrack(trackId: string, userId: string) {
    return this.prisma.assignment.findMany({
      where: { trackId },
      include: {
        submissions: { where: { userId }, take: 1, orderBy: { submittedAt: 'desc' } },
      },
    });
  }

  async submit(userId: string, assignmentId: string, data: { content?: string; code?: string; fileUrl?: string }) {
    return this.prisma.assignmentSubmission.create({
      data: { userId, assignmentId, ...data, status: 'SUBMITTED' },
    });
  }
}
