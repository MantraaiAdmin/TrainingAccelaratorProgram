import { Injectable, ConflictException, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';
import {
  CommissionConfig,
  DEFAULT_COMMISSION,
  COMMISSION_SETTING_KEY,
  validateCommissionConfig,
  splitRevenue,
  collegeToConfig,
  normalizeCommissionConfig,
  configToCollegeData,
  withDerivedCompany,
} from './commission.util';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAnalytics() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalStudents,
      activeStudents,
      enrolledStudents,
      publishedTracks,
      completions,
      activeEnrollments,
      quizAttempts,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
      this.prisma.user.count({
        where: { role: 'STUDENT', isActive: true, lastLoginAt: { gte: sevenDaysAgo } },
      }),
      this.prisma.user.count({
        where: {
          role: 'STUDENT',
          isActive: true,
          trackAssignments: { some: { isActive: true } },
        },
      }),
      this.prisma.track.count({ where: { isPublished: true } }),
      this.prisma.progressRecord.count({ where: { isCompleted: true } }),
      this.prisma.trackAssignment.count({
        where: { isActive: true, user: { role: 'STUDENT', isActive: true } },
      }),
      this.prisma.quizAttempt.findMany({ select: { percentage: true, passed: true } }),
    ]);

    const avgQuizScore = quizAttempts.length
      ? quizAttempts.reduce((a, q) => a + q.percentage, 0) / quizAttempts.length
      : 0;

    const enrollmentRevenue = await this.calculateEnrollmentRevenue();

    return {
      totalStudents,
      activeStudents,
      enrolledStudents,
      totalTracks: publishedTracks,
      totalEnrollments: activeEnrollments,
      totalCompletions: completions,
      enrollmentRevenue: enrollmentRevenue.totalRevenue,
      collegeCommission: enrollmentRevenue.collegeCommission,
      salesCommission: enrollmentRevenue.salesCommission,
      mentorCommission: enrollmentRevenue.mentorCommission,
      companyProfit: enrollmentRevenue.companyProfit,
      avgQuizScore: Math.round(avgQuizScore),
      quizPassRate: quizAttempts.length
        ? Math.round((quizAttempts.filter((q) => q.passed).length / quizAttempts.length) * 100)
        : 0,
    };
  }

  async getDefaultCommission(): Promise<CommissionConfig> {
    const setting = await this.prisma.platformSetting.findUnique({
      where: { key: COMMISSION_SETTING_KEY },
    });
    if (setting?.value) return normalizeCommissionConfig(setting.value);
    return { ...DEFAULT_COMMISSION };
  }

  async updateDefaultCommission(config: CommissionConfig) {
    const normalized = withDerivedCompany(normalizeCommissionConfig(config));
    const error = validateCommissionConfig(normalized);
    if (error) throw new BadRequestException(error);
    await this.prisma.platformSetting.upsert({
      where: { key: COMMISSION_SETTING_KEY },
      create: { key: COMMISSION_SETTING_KEY, value: normalized as object },
      update: { value: normalized as object },
    });
    return normalized;
  }

  private collegeCommissionSelect = {
    id: true,
    name: true,
    code: true,
    commissionMode: true,
    collegeCommissionPct: true,
    salesCommissionPct: true,
    mentorCommissionPct: true,
    companyProfitPct: true,
    courseFeeThreshold: true,
    standardFlatTotalInr: true,
    premiumFlatTotalInr: true,
    collegeFlatInr: true,
    salesFlatInr: true,
    mentorFlatInr: true,
    companyFlatInr: true,
    collegeFlatPremiumInr: true,
    salesFlatPremiumInr: true,
    mentorFlatPremiumInr: true,
    companyFlatPremiumInr: true,
  } as const;

  async getCollegeCommissions() {
    const [colleges, defaults] = await Promise.all([
      this.prisma.college.findMany({
        where: { isActive: true },
        select: {
          ...this.collegeCommissionSelect,
          _count: { select: { users: true } },
        },
        orderBy: { name: 'asc' },
      }),
      this.getDefaultCommission(),
    ]);
    return { defaults, colleges };
  }

  async updateCollegeCommission(collegeId: string, config: CommissionConfig) {
    const normalized = withDerivedCompany(normalizeCommissionConfig(config));
    const error = validateCommissionConfig(normalized);
    if (error) throw new BadRequestException(error);
    return this.prisma.college.update({
      where: { id: collegeId },
      data: configToCollegeData(normalized),
      select: this.collegeCommissionSelect,
    });
  }

  private async getActiveEnrollments() {
    return this.prisma.trackAssignment.findMany({
      where: { isActive: true, user: { role: 'STUDENT', isActive: true } },
      include: {
        track: { select: { name: true, slug: true, priceInr: true } },
        user: {
          select: {
            commissionTier: true,
            college: {
              select: {
                id: true,
                name: true,
                commissionMode: true,
                collegeCommissionPct: true,
                salesCommissionPct: true,
                mentorCommissionPct: true,
                companyProfitPct: true,
                courseFeeThreshold: true,
                standardFlatTotalInr: true,
                premiumFlatTotalInr: true,
                collegeFlatInr: true,
                salesFlatInr: true,
                mentorFlatInr: true,
                companyFlatInr: true,
                collegeFlatPremiumInr: true,
                salesFlatPremiumInr: true,
                mentorFlatPremiumInr: true,
                companyFlatPremiumInr: true,
              },
            },
            department: { select: { name: true } },
          },
        },
      },
    });
  }

  private async calculateEnrollmentRevenue() {
    const [enrollments, defaultConfig] = await Promise.all([
      this.getActiveEnrollments(),
      this.getDefaultCommission(),
    ]);

    let totalRevenue = 0;
    let collegeCommission = 0;
    let salesCommission = 0;
    let mentorCommission = 0;
    let companyProfit = 0;

    const collegeWise: Record<string, number> = {};
    const collegeCommissionWise: Record<string, number> = {};
    const companyNetWise: Record<string, number> = {};
    const trackWise: Record<string, number> = {};
    const departmentWise: Record<string, number> = {};

    for (const e of enrollments) {
      const amount = e.track.priceInr;
      const config = e.user.college ? collegeToConfig(e.user.college) : defaultConfig;
      const parts = splitRevenue(amount, config, e.user.commissionTier);

      totalRevenue += amount;
      collegeCommission += parts.college;
      salesCommission += parts.sales;
      mentorCommission += parts.mentor;
      companyProfit += parts.company;

      const collegeKey = e.user.college?.name || 'Direct / Unassigned';
      collegeWise[collegeKey] = (collegeWise[collegeKey] || 0) + amount;
      collegeCommissionWise[collegeKey] = (collegeCommissionWise[collegeKey] || 0) + parts.college;
      companyNetWise[collegeKey] = (companyNetWise[collegeKey] || 0) + parts.company;

      trackWise[e.track.name] = (trackWise[e.track.name] || 0) + amount;

      const deptKey = e.user.department?.name || 'Unassigned';
      departmentWise[deptKey] = (departmentWise[deptKey] || 0) + amount;
    }

    return {
      totalRevenue,
      collegeCommission,
      salesCommission,
      mentorCommission,
      companyProfit,
      estimatedProfit: companyProfit,
      totalEnrollments: enrollments.length,
      collegeWise,
      collegeCommissionWise,
      companyNetWise,
      trackWise,
      departmentWise,
    };
  }

  async createStudent(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    collegeId?: string;
    departmentId?: string;
    collegeName?: string;
    departmentName?: string;
    year?: number;
    commissionTier?: 'AUTO' | 'STANDARD' | 'PREMIUM';
  }) {
    const {
      password,
      commissionTier,
      collegeName,
      departmentName,
      collegeId,
      departmentId,
      ...rest
    } = data;

    let resolvedCollegeId = collegeId;
    let resolvedDepartmentId = departmentId;

    if (collegeName?.trim()) {
      const college = await this.resolveCollegeByName(collegeName);
      resolvedCollegeId = college?.id;
    }
    if (departmentName?.trim()) {
      if (!resolvedCollegeId) {
        throw new BadRequestException('College is required when department is provided');
      }
      const department = await this.resolveDepartmentByName(resolvedCollegeId, departmentName);
      resolvedDepartmentId = department?.id;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    return this.prisma.user.create({
      data: {
        ...rest,
        collegeId: resolvedCollegeId,
        departmentId: resolvedDepartmentId,
        passwordHash,
        role: 'STUDENT',
        commissionTier: commissionTier ?? 'AUTO',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        year: true,
        commissionTier: true,
        college: { select: { name: true } },
        department: { select: { name: true, code: true } },
      },
    });
  }

  private nameToCode(name: string, maxLen = 8): string {
    const base = name.replace(/[^a-zA-Z0-9]+/g, '').toUpperCase().slice(0, maxLen);
    return base || 'X';
  }

  private async resolveCollegeByName(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return null;

    const existing = await this.prisma.college.findFirst({
      where: { name: { equals: trimmed, mode: 'insensitive' } },
    });
    if (existing) return existing;

    let code = this.nameToCode(trimmed);
    let suffix = 0;
    while (await this.prisma.college.findUnique({ where: { code } })) {
      suffix += 1;
      code = `${this.nameToCode(trimmed, 6)}${suffix}`;
    }
    return this.prisma.college.create({ data: { name: trimmed, code } });
  }

  private async resolveDepartmentByName(collegeId: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) return null;

    const existing = await this.prisma.department.findFirst({
      where: { collegeId, name: { equals: trimmed, mode: 'insensitive' } },
    });
    if (existing) return existing;

    let code = this.nameToCode(trimmed);
    let suffix = 0;
    while (
      await this.prisma.department.findUnique({
        where: { collegeId_code: { collegeId, code } },
      })
    ) {
      suffix += 1;
      code = `${this.nameToCode(trimmed, 6)}${suffix}`;
    }
    return this.prisma.department.create({ data: { name: trimmed, code, collegeId } });
  }

  async updateStudentCommissionTier(userId: string, commissionTier: 'AUTO' | 'STANDARD' | 'PREMIUM') {
    return this.prisma.user.update({
      where: { id: userId },
      data: { commissionTier },
      select: {
        id: true,
        commissionTier: true,
      },
    });
  }

  async bulkUploadStudents(buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);
    const created = [];

    for (const row of rows) {
      const email = row.email || row.Email;
      const password = row.password || row.Password || 'Demo@123';
      if (!email) continue;

      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing) continue;

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName: row.firstName || row.FirstName || row.name?.split(' ')[0] || 'Student',
          lastName: row.lastName || row.LastName || row.name?.split(' ').slice(1).join(' ') || '',
          role: 'STUDENT',
          year: parseInt(row.year || row.Year || '2', 10),
          collegeId: row.collegeId || undefined,
          departmentId: row.departmentId || undefined,
          commissionTier: (['STANDARD', 'PREMIUM', 'AUTO'].includes(row.commissionTier || row.CommissionTier || '')
            ? (row.commissionTier || row.CommissionTier)
            : 'AUTO') as 'AUTO' | 'STANDARD' | 'PREMIUM',
        },
      });
      created.push(user);
    }
    return { created: created.length, users: created };
  }

  async assignTrack(userId: string, trackId: string, assignedBy?: string) {
    return this.prisma.trackAssignment.upsert({
      where: { userId_trackId: { userId, trackId } },
      create: { userId, trackId, assignedBy, isActive: true },
      update: { isActive: true, assignedBy },
    });
  }

  async bulkAssignTrack(userIds: string[], trackId: string, assignedBy?: string) {
    const results = await Promise.all(
      userIds.map((userId) => this.assignTrack(userId, trackId, assignedBy)),
    );
    return { assigned: results.length };
  }

  async getStudents(
    page = 1,
    pageSize = 20,
    options: {
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      collegeId?: string;
      departmentId?: string;
      year?: number;
      trackId?: string;
      status?: 'active' | 'inactive' | 'all';
    } = {},
  ) {
    const { search, sortBy, sortOrder = 'desc', collegeId, departmentId, year, trackId, status } = options;

    const where: Record<string, unknown> = { role: 'STUDENT' };

    if (status === 'active') where.isActive = true;
    else if (status === 'inactive') where.isActive = false;

    if (collegeId) where.collegeId = collegeId;
    if (departmentId) where.departmentId = departmentId;
    if (year) where.year = year;

    if (trackId) {
      where.trackAssignments = { some: { trackId, isActive: true } };
    }

    if (search?.trim()) {
      where.OR = [
        { firstName: { contains: search.trim(), mode: 'insensitive' } },
        { lastName: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const order = sortOrder === 'asc' ? 'asc' : 'desc';
    let orderBy: Record<string, unknown> | Record<string, unknown>[] = { createdAt: 'desc' };
    switch (sortBy) {
      case 'name':
        orderBy = [{ firstName: order }, { lastName: order }];
        break;
      case 'email':
        orderBy = { email: order };
        break;
      case 'year':
        orderBy = { year: order };
        break;
      case 'department':
        orderBy = { department: { name: order } };
        break;
      case 'college':
        orderBy = { college: { name: order } };
        break;
      case 'createdAt':
        orderBy = { createdAt: order };
        break;
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          year: true,
          commissionTier: true,
          createdAt: true,
          college: { select: { id: true, name: true } },
          department: { select: { id: true, name: true, code: true } },
          trackAssignments: {
            include: { track: { select: { id: true, name: true, slug: true, priceInr: true } } },
          },
        },
        orderBy: orderBy as never,
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) || 1 };
  }

  async deactivateStudent(userId: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { isActive: false } });
  }

  async getAdminUsers(
    page = 1,
    pageSize = 20,
    options: {
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      status?: 'active' | 'inactive' | 'all';
      role?: 'ADMIN' | 'SUPER_ADMIN' | 'all';
    } = {},
  ) {
    const { search, sortBy, sortOrder = 'desc', status, role } = options;

    const where: Record<string, unknown> = {
      role: role && role !== 'all' ? role : { in: ['ADMIN', 'SUPER_ADMIN'] },
    };

    if (status === 'active') where.isActive = true;
    else if (status === 'inactive') where.isActive = false;

    if (search?.trim()) {
      where.OR = [
        { firstName: { contains: search.trim(), mode: 'insensitive' } },
        { lastName: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const order = sortOrder === 'asc' ? 'asc' : 'desc';
    let orderBy: Record<string, unknown> | Record<string, unknown>[] = { createdAt: 'desc' };
    switch (sortBy) {
      case 'name':
        orderBy = [{ firstName: order }, { lastName: order }];
        break;
      case 'email':
        orderBy = { email: order };
        break;
      case 'role':
        orderBy = { role: order };
        break;
      case 'createdAt':
        orderBy = { createdAt: order };
        break;
      case 'lastLoginAt':
        orderBy = { lastLoginAt: order };
        break;
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: orderBy as never,
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) || 1 };
  }

  async createAdminUser(
    data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: 'ADMIN' | 'SUPER_ADMIN';
    },
    requester: { id: string; role: string },
  ) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already registered');

    if (data.role === 'SUPER_ADMIN' && requester.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only super admins can create super admin users');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    return this.prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash,
        role: data.role,
        isActive: true,
        isVerified: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async deleteAdminUser(userId: string, requester: { id: string; role: string }) {
    if (userId === requester.id) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      throw new NotFoundException('Admin user not found');
    }

    if (user.role === 'SUPER_ADMIN' && requester.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only super admins can delete super admin users');
    }

    if (user.role === 'SUPER_ADMIN') {
      const otherSuperAdmins = await this.prisma.user.count({
        where: { role: 'SUPER_ADMIN', isActive: true, id: { not: userId } },
      });
      if (otherSuperAdmins === 0) {
        throw new BadRequestException('Cannot delete the last active super admin');
      }
    }

    await this.prisma.auditLog.updateMany({ where: { userId }, data: { userId: null } });
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    await this.prisma.user.delete({ where: { id: userId } });
    return { deleted: true, id: userId };
  }

  async unassignTrack(userId: string, trackId: string) {
    return this.prisma.trackAssignment.updateMany({
      where: { userId, trackId },
      data: { isActive: false },
    });
  }

  async getTracks() {
    return this.prisma.track.findMany({
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
      include: {
        _count: { select: { trackAssignments: true, modules: true } },
      },
    });
  }

  async createTrack(data: {
    name: string;
    slug: string;
    tagline?: string;
    description?: string;
    priceInr?: number;
    difficulty?: string;
    category?: string;
    estimatedWeeks?: number;
  }) {
    const existing = await this.prisma.track.findUnique({ where: { slug: data.slug } });
    if (existing) throw new ConflictException('Track slug already exists');

    const maxOrder = await this.prisma.track.aggregate({ _max: { order: true } });
    return this.prisma.track.create({
      data: {
        name: data.name,
        slug: data.slug,
        tagline: data.tagline,
        description: data.description,
        priceInr: data.priceInr ?? 4999,
        difficulty: (data.difficulty as never) || 'BEGINNER',
        category: (data.category as never) || 'FOUNDATION',
        estimatedWeeks: data.estimatedWeeks ?? 6,
        isPlaceholder: true,
        isPublished: false,
        order: (maxOrder._max.order ?? 0) + 1,
      },
    });
  }

  async updateTrack(id: string, data: {
    name?: string;
    tagline?: string;
    description?: string;
    priceInr?: number;
    isPublished?: boolean;
    isPlaceholder?: boolean;
    difficulty?: string;
    category?: string;
    estimatedWeeks?: number;
  }) {
    const { difficulty, category, ...rest } = data;
    return this.prisma.track.update({
      where: { id },
      data: {
        ...rest,
        ...(difficulty ? { difficulty: difficulty as never } : {}),
        ...(category ? { category: category as never } : {}),
      },
    });
  }

  async deleteTrack(id: string) {
    const assignments = await this.prisma.trackAssignment.count({ where: { trackId: id, isActive: true } });
    if (assignments > 0) {
      return this.prisma.track.update({
        where: { id },
        data: { isPublished: false },
      });
    }
    return this.prisma.track.delete({ where: { id } });
  }

  async getFinanceDashboard() {
    const revenue = await this.calculateEnrollmentRevenue();

    return {
      totalRevenue: revenue.totalRevenue,
      collegeCommission: revenue.collegeCommission,
      salesCommission: revenue.salesCommission,
      mentorCommission: revenue.mentorCommission,
      companyProfit: revenue.companyProfit,
      estimatedProfit: revenue.companyProfit,
      pendingPayments: 0,
      totalEnrollments: revenue.totalEnrollments,
      collegeWise: revenue.collegeWise,
      collegeCommissionWise: revenue.collegeCommissionWise,
      companyNetWise: revenue.companyNetWise,
      trackWise: revenue.trackWise,
      departmentWise: revenue.departmentWise,
    };
  }

  async getAiUsageMonitor(
    page = 1,
    pageSize = 20,
    options: {
      search?: string;
      collegeId?: string;
      year?: number;
      days?: number;
    } = {},
  ) {
    const days = options.days ?? 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const studentWhere: Record<string, unknown> = { role: 'STUDENT' };
    if (options.collegeId) studentWhere.collegeId = options.collegeId;
    if (options.year) studentWhere.year = options.year;
    if (options.search?.trim()) {
      studentWhere.OR = [
        { firstName: { contains: options.search.trim(), mode: 'insensitive' } },
        { lastName: { contains: options.search.trim(), mode: 'insensitive' } },
        { email: { contains: options.search.trim(), mode: 'insensitive' } },
      ];
    }

    const students = await this.prisma.user.findMany({
      where: studentWhere,
      select: { id: true },
    });
    const studentIds = students.map((s) => s.id);

    const logWhere = {
      userId: { in: studentIds.length ? studentIds : ['__none__'] },
      createdAt: { gte: since },
    };

    const [
      aggregate,
      todayAggregate,
      activeUsers,
      usageByType,
      dailyRaw,
      totalStudentCount,
    ] = await Promise.all([
      this.prisma.aIUsageLog.aggregate({
        where: logWhere,
        _sum: { totalTokens: true, estimatedCostInr: true, promptTokens: true, completionTokens: true },
        _count: { id: true },
      }),
      this.prisma.aIUsageLog.aggregate({
        where: { ...logWhere, createdAt: { gte: todayStart } },
        _sum: { totalTokens: true, estimatedCostInr: true },
        _count: { id: true },
      }),
      this.prisma.aIUsageLog.groupBy({
        by: ['userId'],
        where: logWhere,
      }),
      this.prisma.aIUsageLog.groupBy({
        by: ['usageType'],
        where: logWhere,
        _sum: { totalTokens: true },
        _count: { id: true },
      }),
      this.prisma.aIUsageLog.findMany({
        where: logWhere,
        select: { createdAt: true, totalTokens: true, estimatedCostInr: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.user.count({ where: studentWhere }),
    ]);

    const dailyMap = new Map<string, { tokens: number; cost: number; calls: number }>();
    for (const row of dailyRaw) {
      const key = row.createdAt.toISOString().slice(0, 10);
      const cur = dailyMap.get(key) ?? { tokens: 0, cost: 0, calls: 0 };
      cur.tokens += row.totalTokens;
      cur.cost += row.estimatedCostInr;
      cur.calls += 1;
      dailyMap.set(key, cur);
    }
    const dailyUsage = Array.from(dailyMap.entries()).map(([date, v]) => ({
      date,
      tokens: v.tokens,
      costInr: Math.round(v.cost * 10000) / 10000,
      calls: v.calls,
    }));

    const perStudentAgg = await this.prisma.aIUsageLog.groupBy({
      by: ['userId'],
      where: logWhere,
      _sum: { totalTokens: true, estimatedCostInr: true, promptTokens: true, completionTokens: true },
      _count: { id: true },
      _max: { createdAt: true },
      orderBy: { _sum: { totalTokens: 'desc' } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const pageUserIds = perStudentAgg.map((r) => r.userId);
    const userDetails = await this.prisma.user.findMany({
      where: { id: { in: pageUserIds } },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        year: true,
        college: { select: { name: true } },
        department: { select: { name: true } },
      },
    });
    const userMap = new Map(userDetails.map((u) => [u.id, u]));

    const typeBreakdownByUser = pageUserIds.length
      ? await this.prisma.aIUsageLog.groupBy({
          by: ['userId', 'usageType'],
          where: { userId: { in: pageUserIds }, createdAt: { gte: since } },
          _count: { id: true },
          _sum: { totalTokens: true },
        })
      : [];

    const studentsUsage = perStudentAgg.map((row) => {
      const user = userMap.get(row.userId);
      const types = typeBreakdownByUser
        .filter((t) => t.userId === row.userId)
        .map((t) => ({
          type: t.usageType,
          calls: t._count.id,
          tokens: t._sum.totalTokens ?? 0,
        }));
      return {
        userId: row.userId,
        name: user ? `${user.firstName} ${user.lastName}`.trim() : 'Unknown',
        email: user?.email ?? '',
        year: user?.year,
        college: user?.college?.name ?? '—',
        department: user?.department?.name ?? '—',
        totalCalls: row._count.id,
        promptTokens: row._sum.promptTokens ?? 0,
        completionTokens: row._sum.completionTokens ?? 0,
        totalTokens: row._sum.totalTokens ?? 0,
        estimatedCostInr: Math.round((row._sum.estimatedCostInr ?? 0) * 10000) / 10000,
        lastUsedAt: row._max.createdAt,
        usageByType: types,
      };
    });

    const totalStudentsWithUsage = await this.prisma.aIUsageLog.groupBy({
      by: ['userId'],
      where: logWhere,
    });

    return {
      summary: {
        periodDays: days,
        totalCalls: aggregate._count.id,
        totalTokens: aggregate._sum.totalTokens ?? 0,
        promptTokens: aggregate._sum.promptTokens ?? 0,
        completionTokens: aggregate._sum.completionTokens ?? 0,
        estimatedCostInr: Math.round((aggregate._sum.estimatedCostInr ?? 0) * 100) / 100,
        todayCalls: todayAggregate._count.id,
        todayTokens: todayAggregate._sum.totalTokens ?? 0,
        todayCostInr: Math.round((todayAggregate._sum.estimatedCostInr ?? 0) * 100) / 100,
        activeStudentsWithUsage: activeUsers.length,
        totalStudents: totalStudentCount,
        provider: 'qwen',
      },
      usageByType: usageByType.map((u) => ({
        type: u.usageType,
        calls: u._count.id,
        tokens: u._sum.totalTokens ?? 0,
      })),
      dailyUsage,
      students: studentsUsage,
      pagination: {
        page,
        pageSize,
        total: totalStudentsWithUsage.length,
        totalPages: Math.ceil(totalStudentsWithUsage.length / pageSize) || 1,
      },
    };
  }
}
