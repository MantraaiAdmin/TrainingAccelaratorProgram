import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CommissionConfig } from './commission.util';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards/roles.guard';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('analytics')
  getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Get('finance')
  getFinance() {
    return this.adminService.getFinanceDashboard();
  }

  @Get('ai-usage')
  getAiUsage(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('collegeId') collegeId?: string,
    @Query('year') year?: string,
    @Query('days') days?: string,
  ) {
    return this.adminService.getAiUsageMonitor(parseInt(page || '1', 10), parseInt(pageSize || '20', 10), {
      search,
      collegeId,
      year: year ? parseInt(year, 10) : undefined,
      days: days ? parseInt(days, 10) : 30,
    });
  }

  @Get('students')
  getStudents(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('collegeId') collegeId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('year') year?: string,
    @Query('trackId') trackId?: string,
    @Query('status') status?: 'active' | 'inactive' | 'all',
  ) {
    return this.adminService.getStudents(parseInt(page || '1'), parseInt(pageSize || '20'), {
      search,
      sortBy,
      sortOrder,
      collegeId,
      departmentId,
      year: year ? parseInt(year, 10) : undefined,
      trackId,
      status: status || 'all',
    });
  }

  @Post('students')
  createStudent(@Body() body: {
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
    return this.adminService.createStudent(body);
  }

  @Post('students/bulk-upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  bulkUpload(@UploadedFile() file: Express.Multer.File) {
    return this.adminService.bulkUploadStudents(file.buffer);
  }

  @Post('students/:userId/assign-track')
  assignTrack(@Param('userId') userId: string, @Body() body: { trackId: string }, @Request() req: { user: { id: string } }) {
    return this.adminService.assignTrack(userId, body.trackId, req.user.id);
  }

  @Post('students/bulk-assign-track')
  bulkAssign(@Body() body: { userIds: string[]; trackId: string }, @Request() req: { user: { id: string } }) {
    return this.adminService.bulkAssignTrack(body.userIds, body.trackId, req.user.id);
  }

  @Put('students/:userId/deactivate')
  deactivate(@Param('userId') userId: string) {
    return this.adminService.deactivateStudent(userId);
  }

  @Get('users')
  getAdminUsers(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('status') status?: 'active' | 'inactive' | 'all',
    @Query('role') role?: 'ADMIN' | 'SUPER_ADMIN' | 'all',
  ) {
    return this.adminService.getAdminUsers(parseInt(page || '1'), parseInt(pageSize || '20'), {
      search,
      sortBy,
      sortOrder,
      status: status || 'all',
      role: role || 'all',
    });
  }

  @Post('users')
  createAdminUser(
    @Body() body: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: 'ADMIN' | 'SUPER_ADMIN';
    },
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.adminService.createAdminUser(body, req.user);
  }

  @Delete('users/:userId')
  deleteAdminUser(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.adminService.deleteAdminUser(userId, req.user);
  }

  @Put('students/:userId/commission-tier')
  updateCommissionTier(
    @Param('userId') userId: string,
    @Body() body: { commissionTier: 'AUTO' | 'STANDARD' | 'PREMIUM' },
  ) {
    return this.adminService.updateStudentCommissionTier(userId, body.commissionTier);
  }

  @Put('students/:userId/unassign-track')
  unassignTrack(@Param('userId') userId: string, @Body() body: { trackId: string }) {
    return this.adminService.unassignTrack(userId, body.trackId);
  }

  @Get('tracks')
  getTracks() {
    return this.adminService.getTracks();
  }

  @Post('tracks')
  createTrack(@Body() body: {
    name: string;
    slug: string;
    tagline?: string;
    description?: string;
    priceInr?: number;
    difficulty?: string;
    category?: string;
    estimatedWeeks?: number;
  }) {
    return this.adminService.createTrack(body);
  }

  @Put('tracks/:id')
  updateTrack(@Param('id') id: string, @Body() body: {
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
    return this.adminService.updateTrack(id, body);
  }

  @Delete('tracks/:id')
  deleteTrack(@Param('id') id: string) {
    return this.adminService.deleteTrack(id);
  }

  @Get('commissions')
  getCommissions() {
    return this.adminService.getCollegeCommissions();
  }

  @Put('commissions/defaults')
  updateDefaultCommission(@Body() body: CommissionConfig) {
    return this.adminService.updateDefaultCommission(body);
  }

  @Put('commissions/college/:collegeId')
  updateCollegeCommission(@Param('collegeId') collegeId: string, @Body() body: CommissionConfig) {
    return this.adminService.updateCollegeCommission(collegeId, body);
  }

  @Get('submissions')
  getSubmissions(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('collegeId') collegeId?: string,
    @Query('year') year?: string,
    @Query('trackId') trackId?: string,
    @Query('status') status?: 'pending' | 'approved' | 'rejected' | 'all',
    @Query('type') type?: 'lab' | 'assignment' | 'all',
  ) {
    return this.adminService.getSubmissions(parseInt(page || '1', 10), parseInt(pageSize || '20', 10), {
      search,
      sortBy,
      sortOrder,
      collegeId,
      year: year ? parseInt(year, 10) : undefined,
      trackId,
      status: status || 'pending',
      type: type || 'all',
    });
  }

  @Get('submissions/:type/:id')
  getSubmissionDetail(@Param('type') type: 'lab' | 'assignment', @Param('id') id: string) {
    return this.adminService.getSubmissionDetail(type, id);
  }

  @Put('submissions/:type/:id/review')
  reviewSubmission(
    @Param('type') type: 'lab' | 'assignment',
    @Param('id') id: string,
    @Body() body: { action: 'approve' | 'reject'; feedback?: string; score?: number },
    @Request() req: { user: { id: string } },
  ) {
    return this.adminService.reviewSubmission(type, id, req.user.id, body);
  }
}
