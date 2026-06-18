import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async getMiniProjects(trackId: string, userId: string) {
    return this.prisma.miniProject.findMany({
      where: { trackId },
      include: { submissions: { where: { userId }, take: 1, orderBy: { submittedAt: 'desc' } } },
      orderBy: { order: 'asc' },
    });
  }

  async submitMiniProject(userId: string, projectId: string, data: { githubUrl?: string; deployUrl?: string; description?: string }) {
    return this.prisma.projectSubmission.create({
      data: { userId, projectId, ...data, status: 'SUBMITTED' },
    });
  }

  async getCapstone(trackId: string, userId: string) {
    return this.prisma.capstoneProject.findFirst({
      where: { trackId },
      include: { submissions: { where: { userId }, take: 1, orderBy: { submittedAt: 'desc' } } },
    });
  }

  async submitCapstone(userId: string, capstoneId: string, data: { githubUrl?: string; deployUrl?: string; presentationUrl?: string; milestoneProgress?: object }) {
    return this.prisma.capstoneSubmission.create({
      data: { userId, capstoneId, ...data, status: 'SUBMITTED' },
    });
  }
}
