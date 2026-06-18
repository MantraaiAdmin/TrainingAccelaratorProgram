import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  async checkEligibility(userId: string, trackId: string) {
    const track = await this.prisma.track.findUnique({
      where: { id: trackId },
      include: {
        modules: { include: { chapters: { include: { subsections: true } } } },
        assignments: true,
        miniProjects: true,
        capstoneProjects: true,
        interviewModules: true,
      },
    });
    if (!track) throw new BadRequestException('Track not found');

    const allSubsectionIds = track.modules.flatMap((m) =>
      m.chapters.flatMap((c) => c.subsections.map((s) => s.id)),
    );

    const completed = await this.prisma.progressRecord.count({
      where: { userId, subsectionId: { in: allSubsectionIds }, isCompleted: true },
    });

    const requirements = {
      lessonsComplete: completed >= allSubsectionIds.length * 0.9,
      assignmentsSubmitted: true,
      miniProjectsComplete: true,
      capstoneComplete: true,
      interviewPrepComplete: true,
    };

    const eligible = Object.values(requirements).every(Boolean);
    return { eligible, requirements, progress: { completed, total: allSubsectionIds.length } };
  }

  async generate(userId: string, trackId: string, override = false) {
    const eligibility = await this.checkEligibility(userId, trackId);
    if (!eligibility.eligible && !override) {
      throw new BadRequestException('Certificate requirements not met', { cause: eligibility.requirements });
    }

    const existing = await this.prisma.certificate.findFirst({ where: { userId, trackId } });
    if (existing) return existing;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const track = await this.prisma.track.findUnique({ where: { id: trackId } });
    if (!user || !track) throw new BadRequestException('Invalid user or track');

    const certificateId = `CNG-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;
    const qrData = JSON.stringify({ certificateId, studentName: `${user.firstName} ${user.lastName}`, track: track.name });
    const qrCodeData = await QRCode.toDataURL(qrData);

    return this.prisma.certificate.create({
      data: {
        certificateId,
        userId,
        trackId,
        studentName: `${user.firstName} ${user.lastName}`,
        trackName: track.name,
        qrCodeData,
        isOverride: override,
      },
    });
  }

  async verify(certificateId: string) {
    return this.prisma.certificate.findUnique({
      where: { certificateId },
      include: { user: { select: { firstName: true, lastName: true } }, track: { select: { name: true } } },
    });
  }

  async getUserCertificates(userId: string) {
    return this.prisma.certificate.findMany({ where: { userId }, include: { track: { select: { slug: true, name: true } } } });
  }
}
