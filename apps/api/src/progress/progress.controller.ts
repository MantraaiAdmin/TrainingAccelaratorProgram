import { Controller, Post, Param, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/guards/roles.guard';

@ApiTags('Progress')
@Controller('progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Post('complete/:subsectionId')
  @ApiOperation({ summary: 'Mark subsection as complete' })
  markComplete(@Param('subsectionId') subsectionId: string, @Request() req: { user: { id: string } }) {
    return this.progressService.markComplete(req.user.id, subsectionId);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get student dashboard data' })
  getDashboard(@Request() req: { user: { id: string } }) {
    return this.progressService.getDashboard(req.user.id);
  }
}
