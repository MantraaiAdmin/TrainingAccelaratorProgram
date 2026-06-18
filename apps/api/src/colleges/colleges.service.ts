import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CollegesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.college.findMany({
      where: { isActive: true },
      include: { departments: true, _count: { select: { users: true } } },
    });
  }

  async create(data: { name: string; code: string; address?: string; city?: string; state?: string }) {
    return this.prisma.college.create({ data });
  }

  async createDepartment(collegeId: string, data: { name: string; code: string }) {
    return this.prisma.department.create({ data: { ...data, collegeId } });
  }
}
