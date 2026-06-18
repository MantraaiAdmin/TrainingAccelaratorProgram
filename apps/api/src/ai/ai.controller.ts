import { Controller, Post, Body, Get, Param, UseGuards, Request, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Response } from 'express';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/roles.guard';

class ChatDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  chatId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;
}

class MockInterviewDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ enum: ['technical', 'hr', 'coding'] })
  @IsString()
  type: 'technical' | 'hr' | 'coding';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

@ApiTags('AI Assistant')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Chat with AI learning assistant' })
  chat(@Body() dto: ChatDto, @Request() req: { user: { id: string } }) {
    return this.aiService.chat(req.user.id, dto.message, dto.chatId, dto.context);
  }

  @Post('chat/stream')
  @ApiOperation({ summary: 'Stream AI chat response' })
  async streamChat(
    @Body() dto: ChatDto,
    @Request() req: { user: { id: string } },
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      for await (const chunk of this.aiService.streamChat(req.user.id, dto.message, dto.chatId, dto.context)) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        if (chunk.done) break;
      }
    } catch (err) {
      res.write(`data: ${JSON.stringify({ error: (err as Error).message, done: true })}\n\n`);
    }
    res.end();
  }

  @Post('mock-interview')
  @ApiOperation({ summary: 'AI mock interview' })
  mockInterview(@Body() dto: MockInterviewDto, @Request() req: { user: { id: string } }) {
    return this.aiService.mockInterview(req.user.id, dto.type, dto.message, dto.sessionId);
  }

  @Post('hint/:exerciseId')
  @ApiOperation({ summary: 'Get AI hint for coding exercise' })
  getHint(
    @Param('exerciseId') exerciseId: string,
    @Body() body: { code?: string; error?: string },
    @Request() req: { user: { id: string } },
  ) {
    return this.aiService.getHint(exerciseId, body.code, body.error, req.user.id);
  }

  @Get('chats')
  @ApiOperation({ summary: 'Get chat history' })
  getChats(@Request() req: { user: { id: string } }) {
    return this.aiService.getChats(req.user.id);
  }
}
