import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { JwtAuthGuard } from '../auth/guards/roles.guard';

@ApiTags('Quizzes')
@Controller('quizzes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QuizzesController {
  constructor(private quizzesService: QuizzesService) {}

  @Get(':quizId/meta')
  @ApiOperation({ summary: 'Get quiz metadata and retry status' })
  getMeta(@Param('quizId') quizId: string, @Request() req: { user: { id: string } }) {
    return this.quizzesService.getQuizMeta(req.user.id, quizId);
  }

  @Post(':quizId/submit')
  @ApiOperation({ summary: 'Submit quiz answers' })
  submit(
    @Param('quizId') quizId: string,
    @Body() body: { answers?: Record<string, string> },
    @Request() req: { user: { id: string } },
  ) {
    return this.quizzesService.submitQuiz(req.user.id, quizId, body?.answers ?? {});
  }

  @Get(':quizId/attempts')
  @ApiOperation({ summary: 'Get quiz attempt history' })
  getAttempts(@Param('quizId') quizId: string, @Request() req: { user: { id: string } }) {
    return this.quizzesService.getAttempts(req.user.id, quizId);
  }
}
