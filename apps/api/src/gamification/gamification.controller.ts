import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/guards/roles.guard';

@ApiTags('Gamification')
@Controller('gamification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GamificationController {
  constructor(private gamification: GamificationService) {}

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get XP leaderboard' })
  getLeaderboard() {
    return this.gamification.getLeaderboard();
  }

  @Get('achievements')
  @ApiOperation({ summary: 'Get user achievements' })
  getAchievements(@Request() req: { user: { id: string } }) {
    return this.gamification.getUserAchievements(req.user.id);
  }
}
