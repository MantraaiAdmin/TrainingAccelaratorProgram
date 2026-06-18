import { Injectable } from '@nestjs/common';
import { AIProvider } from '@constel/types';
import type { AIContext } from '@constel/types';
import { PrismaService } from '../prisma/prisma.service';

export type AIUsageType = 'CHAT' | 'STREAM' | 'HINT' | 'MOCK_INTERVIEW' | 'SCOPE_REFUSAL';

/** Approximate Qwen turbo pricing (INR per 1K tokens) */
const QWEN_INPUT_INR_PER_1K = 0.004;
const QWEN_OUTPUT_INR_PER_1K = 0.012;

export function estimateTokenCount(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

export function estimateCostInr(promptTokens: number, completionTokens: number): number {
  return (
    (promptTokens / 1000) * QWEN_INPUT_INR_PER_1K +
    (completionTokens / 1000) * QWEN_OUTPUT_INR_PER_1K
  );
}

function buildLessonContext(context?: Record<string, unknown>): string | undefined {
  if (!context) return undefined;
  const ctx = context as AIContext;
  const parts = [ctx.trackName, ctx.moduleTitle, ctx.subsectionTitle].filter(Boolean);
  return parts.length ? parts.join(' · ') : undefined;
}

@Injectable()
export class AiUsageService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    userId: string;
    usageType: AIUsageType;
    provider?: string;
    model?: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    context?: Record<string, unknown>;
    success?: boolean;
  }) {
    const promptTokens = params.promptTokens ?? 0;
    const completionTokens = params.completionTokens ?? 0;
    const totalTokens = params.totalTokens ?? promptTokens + completionTokens;

    await this.prisma.aIUsageLog.create({
      data: {
        userId: params.userId,
        usageType: params.usageType,
        provider: params.provider ?? AIProvider.QWEN,
        model: params.model,
        promptTokens,
        completionTokens,
        totalTokens,
        estimatedCostInr: estimateCostInr(promptTokens, completionTokens),
        lessonContext: buildLessonContext(params.context),
        success: params.success ?? true,
      },
    });
  }

  async logFromCompletion(
    userId: string,
    usageType: AIUsageType,
    result: {
      provider: AIProvider;
      model: string;
      tokensUsed?: number;
      promptTokens?: number;
      completionTokens?: number;
    },
    inputText: string,
    outputText: string,
    context?: Record<string, unknown>,
  ) {
    let promptTokens = result.promptTokens ?? 0;
    let completionTokens = result.completionTokens ?? 0;

    if (!promptTokens && !completionTokens && result.tokensUsed) {
      completionTokens = Math.round(result.tokensUsed * 0.4);
      promptTokens = result.tokensUsed - completionTokens;
    } else if (!result.tokensUsed && !promptTokens && !completionTokens) {
      promptTokens = estimateTokenCount(inputText);
      completionTokens = estimateTokenCount(outputText);
    }

    await this.log({
      userId,
      usageType,
      provider: result.provider,
      model: result.model,
      promptTokens,
      completionTokens,
      context,
    });
  }
}
