import { Controller, Get, Post, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards/roles.guard';

@ApiTags('Certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private service: CertificatesService) {}

  @Get('verify/:certificateId')
  verify(@Param('certificateId') certificateId: string) {
    return this.service.verify(certificateId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  myCertificates(@Request() req: { user: { id: string } }) {
    return this.service.getUserCertificates(req.user.id);
  }

  @Get('eligibility/:trackId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  eligibility(@Param('trackId') trackId: string, @Request() req: { user: { id: string } }) {
    return this.service.checkEligibility(req.user.id, trackId);
  }

  @Post('generate/:trackId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  generate(@Param('trackId') trackId: string, @Request() req: { user: { id: string } }) {
    return this.service.generate(req.user.id, trackId);
  }

  @Post('override/:trackId/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  override(@Param('trackId') trackId: string, @Param('userId') userId: string) {
    return this.service.generate(userId, trackId, true);
  }
}
