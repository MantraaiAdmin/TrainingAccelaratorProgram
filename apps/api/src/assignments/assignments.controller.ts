import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../auth/guards/roles.guard';

@ApiTags('Assignments')
@Controller('assignments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssignmentsController {
  constructor(private service: AssignmentsService) {}

  @Get('track/:trackId')
  getByTrack(@Param('trackId') trackId: string, @Request() req: { user: { id: string } }) {
    return this.service.getByTrack(trackId, req.user.id);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string, @Body() body: { content?: string; code?: string; fileUrl?: string }, @Request() req: { user: { id: string } }) {
    return this.service.submit(req.user.id, id, body);
  }
}
