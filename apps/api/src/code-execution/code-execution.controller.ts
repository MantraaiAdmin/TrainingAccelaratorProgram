import { Controller, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CodeExecutionService } from './code-execution.service';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { JwtAuthGuard } from '../auth/guards/roles.guard';

class RunCodeDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty({ required: false })
  @IsString()
  input?: string;
}

class SubmitCodeDto {
  @ApiProperty()
  @IsString()
  code: string;
}

@ApiTags('Code Execution')
@Controller('code')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CodeExecutionController {
  constructor(
    private codeService: CodeExecutionService,
    private prisma: PrismaService,
    private gamification: GamificationService,
  ) {}

  @Post('run')
  @ApiOperation({ summary: 'Run Python code' })
  runCode(@Body() dto: RunCodeDto) {
    return this.codeService.runCode(dto.code, dto.input);
  }

  @Post('submit/:exerciseId')
  @ApiOperation({ summary: 'Submit coding exercise solution' })
  async submit(
    @Param('exerciseId') exerciseId: string,
    @Body() dto: SubmitCodeDto,
    @Request() req: { user: { id: string } },
  ) {
    const exercise = await this.prisma.codingExercise.findUnique({
      where: { id: exerciseId },
    });
    if (!exercise) throw new Error('Exercise not found');

    const testCases = exercise.testCases as Array<{ input: string; expectedOutput: string; isHidden?: boolean }>;
    const result = await this.codeService.submitSolution(dto.code, testCases);

    await this.prisma.exerciseSubmission.create({
      data: {
        userId: req.user.id,
        exerciseId,
        code: dto.code,
        passedTests: result.passed || 0,
        totalTests: result.total || 0,
        executionMs: result.executionTimeMs,
        status: result.success ? 'APPROVED' : 'SUBMITTED',
      },
    });

    if (result.success) {
      await this.gamification.awardXP(req.user.id, exercise.xpReward, 'coding_exercise', exerciseId);
      await this.prisma.progressRecord.upsert({
        where: { userId_subsectionId: { userId: req.user.id, subsectionId: exercise.subsectionId } },
        create: { userId: req.user.id, subsectionId: exercise.subsectionId, isCompleted: true, completedAt: new Date() },
        update: { isCompleted: true, completedAt: new Date() },
      });
    }

    return result;
  }
}
