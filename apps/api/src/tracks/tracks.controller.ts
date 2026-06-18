import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TracksService } from './tracks.service';
import { JwtAuthGuard } from '../auth/guards/roles.guard';

@ApiTags('Tracks')
@Controller('tracks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TracksController {
  constructor(private tracksService: TracksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tracks' })
  findAll(@Request() req: { user: { id: string; role: string } }) {
    return this.tracksService.findAll(req.user.id, req.user.role as never);
  }

  @Get('subsection/:id')
  @ApiOperation({ summary: 'Get subsection content' })
  getSubsection(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.tracksService.getSubsection(id, req.user.id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get track by slug with full content' })
  findBySlug(@Param('slug') slug: string, @Request() req: { user: { id: string; role: string } }) {
    return this.tracksService.findBySlug(slug, req.user.id, req.user.role as never);
  }
}
