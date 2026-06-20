import { Controller, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CodeExecutionService } from './code-execution.service';
import { PrismaService } from '../prisma/prisma.service';
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
        status: 'SUBMITTED',
      },
    });

    return {
      ...result,
      pendingReview: true,
      message: result.success
        ? 'All tests passed. Submission sent to admin for review.'
        : 'Submission sent to admin for review.',
    };
  }
}
