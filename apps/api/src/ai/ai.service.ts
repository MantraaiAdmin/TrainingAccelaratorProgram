import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProviderFactory,
  QwenProvider,
  OpenAIProvider,
  buildLearningAssistantPrompt,
  buildMockInterviewPrompt,
  getLearningScopeRefusal,
  AIMessage,
} from '@constel/ai-sdk';
import { AIProvider } from '@constel/types';
import type { AIContext } from '@constel/types';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AiUsageService, estimateTokenCount } from './ai-usage.service';

@Injectable()
export class AiService {
  private factory: AIProviderFactory;
  private primaryProvider: AIProvider;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private aiUsage: AiUsageService,
  ) {
    this.factory = new AIProviderFactory();
    this.primaryProvider = (config.get('AI_PROVIDER') as AIProvider) || AIProvider.QWEN;

    const qwenKey = config.get('QWEN_API_KEY');
    if (qwenKey) {
      this.factory.register(
        new QwenProvider({
          apiKey: qwenKey,
          model: config.get('QWEN_MODEL', 'qwen-turbo'),
          baseUrl: config.get('QWEN_BASE_URL'),
        }),
      );
    }

    const openaiKey = config.get('OPENAI_API_KEY');
    if (openaiKey) {
      this.factory.register(
        new OpenAIProvider({ apiKey: openaiKey, model: 'gpt-4o-mini' }),
      );
    }
  }

  async chat(
    userId: string,
    message: string,
    chatId?: string,
    context?: Record<string, unknown>,
  ) {
    const ctx = context as AIContext | undefined;
    const refusal = getLearningScopeRefusal(message, ctx);
    if (refusal) {
      if (chatId) {
        const chat = await this.prisma.aIChat.findUnique({ where: { id: chatId } });
        if (chat && chat.userId === userId) {
          const history = chat.messages as unknown as AIMessage[];
          const updatedMessages = [
            ...history,
            { role: 'user' as const, content: message },
            { role: 'assistant' as const, content: refusal },
          ];
          await this.prisma.aIChat.update({
            where: { id: chatId },
            data: { messages: updatedMessages as unknown as Prisma.InputJsonValue, updatedAt: new Date() },
          });
        }
      }
      await this.aiUsage.log({
        userId,
        usageType: 'SCOPE_REFUSAL',
        model: 'scope-guard',
        promptTokens: estimateTokenCount(message),
        completionTokens: estimateTokenCount(refusal),
        context,
      });
      return {
        chatId,
        content: refusal,
        provider: this.primaryProvider,
        model: 'scope-guard',
      };
    }

    const systemPrompt = buildLearningAssistantPrompt(ctx);
    let messages: AIMessage[] = [{ role: 'system', content: systemPrompt }];

    if (chatId) {
      const chat = await this.prisma.aIChat.findUnique({ where: { id: chatId } });
      if (chat && chat.userId === userId) {
        const history = chat.messages as unknown as AIMessage[];
        messages = [{ role: 'system', content: systemPrompt }, ...history.slice(-10)];
      }
    }

    messages.push({ role: 'user', content: message });

    const result = await this.factory.completeWithFallback(this.primaryProvider, {
      messages,
      temperature: 0.35,
      maxTokens: 2048,
    });

    await this.aiUsage.logFromCompletion(
      userId,
      'CHAT',
      result,
      messages.map((m) => m.content).join('\n'),
      result.content,
      context,
    );

    const updatedMessages = [...messages.slice(1), { role: 'assistant' as const, content: result.content }];

    if (chatId) {
      await this.prisma.aIChat.update({
        where: { id: chatId },
        data: { messages: updatedMessages as unknown as Prisma.InputJsonValue, updatedAt: new Date() },
      });
    } else {
      const chat = await this.prisma.aIChat.create({
        data: {
          userId,
          title: message.slice(0, 50),
          context: (context || {}) as Prisma.InputJsonValue,
          messages: updatedMessages as unknown as Prisma.InputJsonValue,
        },
      });
      return { chatId: chat.id, ...result };
    }

    return { chatId, ...result };
  }

  async *streamChat(
    userId: string,
    message: string,
    chatId?: string,
    context?: Record<string, unknown>,
  ) {
    const ctx = context as AIContext | undefined;
    const refusal = getLearningScopeRefusal(message, ctx);
    if (refusal) {
      yield { content: refusal, done: true };
      await this.aiUsage.log({
        userId,
        usageType: 'SCOPE_REFUSAL',
        model: 'scope-guard',
        promptTokens: estimateTokenCount(message),
        completionTokens: estimateTokenCount(refusal),
        context,
      });
      return;
    }

    const systemPrompt = buildLearningAssistantPrompt(ctx);
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ];

    const provider = this.factory.get(this.primaryProvider);
    let fullContent = '';

    for await (const chunk of provider.stream({ messages, temperature: 0.35 })) {
      fullContent += chunk.content;
      yield chunk;
    }

    await this.aiUsage.log({
      userId,
      usageType: 'STREAM',
      provider: this.primaryProvider,
      model: this.config.get('QWEN_MODEL', 'qwen-turbo'),
      promptTokens: estimateTokenCount(messages.map((m) => m.content).join('\n')),
      completionTokens: estimateTokenCount(fullContent),
      context,
    });

    if (chatId) {
      const chat = await this.prisma.aIChat.findUnique({ where: { id: chatId } });
      if (chat) {
        const history = chat.messages as unknown as AIMessage[];
        await this.prisma.aIChat.update({
          where: { id: chatId },
          data: {
            messages: [
              ...history,
              { role: 'user', content: message },
              { role: 'assistant', content: fullContent },
            ] as unknown as Prisma.InputJsonValue,
          },
        });
      }
    } else {
      await this.prisma.aIChat.create({
        data: {
          userId,
          title: message.slice(0, 50),
          context: (context || {}) as Prisma.InputJsonValue,
          messages: [
            { role: 'user', content: message },
            { role: 'assistant', content: fullContent },
          ] as unknown as Prisma.InputJsonValue,
        },
      });
    }
  }

  async mockInterview(userId: string, type: 'technical' | 'hr' | 'coding', message: string, sessionId?: string) {
    const systemPrompt = buildMockInterviewPrompt(type);
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ];

    const result = await this.factory.completeWithFallback(this.primaryProvider, { messages });

    await this.aiUsage.logFromCompletion(
      userId,
      'MOCK_INTERVIEW',
      result,
      messages.map((m) => m.content).join('\n'),
      result.content,
    );

    if (sessionId) {
      const session = await this.prisma.mockInterview.findUnique({ where: { id: sessionId } });
      if (session) {
        const history = session.messages as unknown as AIMessage[];
        await this.prisma.mockInterview.update({
          where: { id: sessionId },
          data: {
            messages: [
              ...history,
              { role: 'user', content: message },
              { role: 'assistant', content: result.content },
            ] as unknown as Prisma.InputJsonValue,
          },
        });
      }
    } else {
      const session = await this.prisma.mockInterview.create({
        data: {
          userId,
          type,
          messages: [
            { role: 'user', content: message },
            { role: 'assistant', content: result.content },
          ],
        },
      });
      return { sessionId: session.id, content: result.content };
    }

    return { sessionId, content: result.content };
  }

  async getHint(exerciseId: string, studentCode?: string, error?: string, userId?: string) {
    const exercise = await this.prisma.codingExercise.findUnique({ where: { id: exerciseId } });
    if (!exercise) throw new Error('Exercise not found');

    const hintIndex = Math.min(exercise.hints.length - 1, Math.floor(exercise.hints.length / 2));
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'Provide a helpful hint for this coding exercise. Do NOT give the full solution.',
      },
      {
        role: 'user',
        content: `Problem: ${exercise.problemStatement}\nStudent code: ${studentCode || 'Not started'}\nError: ${error || 'None'}\nAvailable hints: ${exercise.hints.join(', ')}`,
      },
    ];

    const result = await this.factory.completeWithFallback(this.primaryProvider, { messages, maxTokens: 512 });

    if (userId) {
      await this.aiUsage.logFromCompletion(
        userId,
        'HINT',
        result,
        messages.map((m) => m.content).join('\n'),
        result.content,
      );
    }

    return result;
  }

  async getChats(userId: string) {
    return this.prisma.aIChat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, updatedAt: true },
    });
  }
}
