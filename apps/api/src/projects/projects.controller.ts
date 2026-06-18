import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/roles.guard';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private service: ProjectsService) {}

  @Get('mini/:trackId')
  getMini(@Param('trackId') trackId: string, @Request() req: { user: { id: string } }) {
    return this.service.getMiniProjects(trackId, req.user.id);
  }

  @Post('mini/:id/submit')
  submitMini(@Param('id') id: string, @Body() body: { githubUrl?: string; deployUrl?: string; description?: string }, @Request() req: { user: { id: string } }) {
    return this.service.submitMiniProject(req.user.id, id, body);
  }

  @Get('capstone/:trackId')
  getCapstone(@Param('trackId') trackId: string, @Request() req: { user: { id: string } }) {
    return this.service.getCapstone(trackId, req.user.id);
  }

  @Post('capstone/:id/submit')
  submitCapstone(@Param('id') id: string, @Body() body: { githubUrl?: string; deployUrl?: string; presentationUrl?: string }, @Request() req: { user: { id: string } }) {
    return this.service.submitCapstone(req.user.id, id, body);
  }
}
