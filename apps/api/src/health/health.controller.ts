import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
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
