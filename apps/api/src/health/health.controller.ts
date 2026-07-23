import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'API health check' })
  check() {
    return {
      status: 'ok',
      service: 'mantra-learn-api',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('db')
  @ApiOperation({ summary: 'Database connectivity check' })
  async checkDb() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const userColumns = await this.prisma.$queryRaw<Array<{ column_name: string }>>`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'User'
        ORDER BY column_name
      `;
      const hasCommissionTier = userColumns.some((c) => c.column_name === 'commissionTier');
      return {
        status: 'ok',
        database: 'connected',
        userColumnCount: userColumns.length,
        hasCommissionTier,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Database check failed';
      return {
        status: 'error',
        database: 'disconnected',
        message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
