import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CollegesService } from './colleges.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards/roles.guard';

@ApiTags('Colleges')
@Controller('colleges')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CollegesController {
  constructor(private service: CollegesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  create(@Body() body: { name: string; code: string; address?: string; city?: string; state?: string }) {
    return this.service.create(body);
  }

  @Post(':collegeId/departments')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  createDepartment(@Param('collegeId') collegeId: string, @Body() body: { name: string; code: string }) {
    return this.service.createDepartment(collegeId, body);
  }
}
