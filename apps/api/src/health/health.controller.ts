import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('Health')
@Controller('health')
@SkipThrottle()
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'API health check' })
  check() {
    return {
      status: 'ok',
      service: 'mantra-learn-api',
      timestamp: new Date().toISOString(),
    };
  }
}
