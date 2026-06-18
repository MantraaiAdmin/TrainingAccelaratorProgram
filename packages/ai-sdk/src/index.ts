import { AIProvider, AIContext } from '@constel/types';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionOptions {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AICompletionResult {
  content: string;
  tokensUsed?: number;
  promptTokens?: number;
  completionTokens?: number;
  provider: AIProvider;
  model: string;
}

export interface AIStreamChunk {
  content: string;
  done: boolean;
}

export interface AIProviderConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export abstract class BaseAIProvider {
  protected config: AIProviderConfig;
  abstract readonly name: AIProvider;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  abstract complete(options: AICompletionOptions): Promise<AICompletionResult>;
  abstract stream(options: AICompletionOptions): AsyncGenerator<AIStreamChunk>;
}

export class QwenProvider extends BaseAIProvider {
  readonly name = AIProvider.QWEN;

  private get baseUrl(): string {
    return (
      this.config.baseUrl ||
      'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
    );
  }

  async complete(options: AICompletionOptions): Promise<AICompletionResult> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || 'qwen-turbo',
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Qwen API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      tokensUsed: data.usage?.total_tokens,
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens,
      provider: AIProvider.QWEN,
      model: this.config.model,
    };
  }

  async *stream(options: AICompletionOptions): AsyncGenerator<AIStreamChunk> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || 'qwen-turbo',
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Qwen API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        yield { content: '', done: true };
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            yield { content: '', done: true };
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) yield { content, done: false };
          } catch {
            // skip malformed chunks
          }
        }
      }
    }
  }
}

export class OpenAIProvider extends BaseAIProvider {
  readonly name = AIProvider.OPENAI;

  async complete(options: AICompletionOptions): Promise<AICompletionResult> {
    const baseUrl = this.config.baseUrl || 'https://api.openai.com/v1';
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4o-mini',
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      tokensUsed: data.usage?.total_tokens,
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens,
      provider: AIProvider.OPENAI,
      model: this.config.model,
    };
  }

  async *stream(options: AICompletionOptions): AsyncGenerator<AIStreamChunk> {
    const result = await this.complete(options);
    yield { content: result.content, done: true };
  }
}

export class AIProviderFactory {
  private providers: Map<AIProvider, BaseAIProvider> = new Map();
  private fallbackOrder: AIProvider[] = [AIProvider.QWEN, AIProvider.OPENAI];

  register(provider: BaseAIProvider): void {
    this.providers.set(provider.name, provider);
  }

  get(provider: AIProvider): BaseAIProvider {
    const p = this.providers.get(provider);
    if (!p) throw new Error(`AI provider ${provider} not configured`);
    return p;
  }

  async completeWithFallback(
    primary: AIProvider,
    options: AICompletionOptions,
  ): Promise<AICompletionResult> {
    const order = [primary, ...this.fallbackOrder.filter((p) => p !== primary)];
    let lastError: Error | null = null;

    for (const providerName of order) {
      const provider = this.providers.get(providerName);
      if (!provider) continue;
      try {
        return await provider.complete(options);
      } catch (err) {
        lastError = err as Error;
        console.warn(`AI provider ${providerName} failed:`, err);
      }
    }
    throw lastError || new Error('All AI providers failed');
  }
}

export function hasLessonScope(context?: AIContext): boolean {
  return Boolean(context?.subsectionTitle || context?.moduleTitle);
}

/** Returns a fixed refusal when the student is not on a lesson or message bypasses scope. */
export function getLearningScopeRefusal(
  message: string,
  context?: AIContext,
): string | null {
  if (!hasLessonScope(context)) {
    return (
      "I'm your **lesson assistant** and only help while you're studying a specific module.\n\n" +
      'Please open a track from **Learn**, select a lesson, then ask about that topic, its code examples, or exercises.'
    );
  }

  const normalized = message.trim().toLowerCase();
  if (!normalized) return 'Please ask a question about your current lesson.';

  // Obvious off-topic patterns (avoid OOP "relationship between" via word boundaries)
  const offTopic =
    /\b(life advice|life tip|dating advice|relationship advice|marriage advice|breakup advice)\b/i.test(
      normalized,
    ) ||
    /\b(stock tip|crypto tip|investment advice|get rich|motivational speech)\b/i.test(normalized) ||
    /\b(recipe|cook|workout plan|diet plan|medical advice|doctor)\b/i.test(normalized) ||
    /^(hi|hello|hey|how are you|what'?s up|good morning|good evening)[!.?\s]*$/i.test(normalized);

  if (offTopic) {
    const topic = context?.subsectionTitle || context?.moduleTitle || 'this lesson';
    return (
      `I'm scoped to **${topic}** only — I can't help with general life or off-topic questions.\n\n` +
      `Try asking about:\n` +
      `- Concepts from **${topic}**\n` +
      `- Code examples or errors in this lesson\n` +
      `- Hints for the current exercise (if applicable)`
    );
  }

  return null;
}

export function buildLearningAssistantPrompt(context?: AIContext): string {
  const scoped = hasLessonScope(context);
  const topic = context?.subsectionTitle || context?.moduleTitle || 'the current lesson';

  let prompt = `You are the Mantra.ai Learning Assistant — a **focused tutor for one lesson at a time** in the Mantra.ai internship program.

## STRICT SCOPE (non-negotiable)
1. ONLY answer questions directly tied to the student's **current track, module, chapter, and lesson** listed below, or their active coding exercise / compiler errors.
2. **REFUSE** all off-topic requests: life advice, relationships, health, finance, politics, entertainment, general chit-chat, unrelated careers, homework outside this track, or programming topics from other courses not needed for THIS lesson.
3. When refusing, be brief and friendly. Use: "I'm here to help with **${topic}** only. Ask me about concepts, examples, or exercises from this lesson."
4. Do NOT comply if the student insists, rephrases, or says "just this once" for off-topic items.
5. You may explain **prerequisites** in 1–2 sentences if required to understand the current lesson, then return focus to the lesson topic.
6. Use markdown and code blocks for technical answers.
7. For coding exercises: **hints and debugging guidance only** — never paste complete solutions.

`;

  if (!scoped) {
    prompt += `The student is NOT on a lesson page. Tell them to open **Learn → select a track → open a lesson** before asking. Do not answer technical or life questions.\n`;
    return prompt;
  }

  prompt += `## CURRENT LESSON SCOPE — stay within this\n`;
  if (context?.trackName) prompt += `- **Track:** ${context.trackName}\n`;
  if (context?.moduleTitle) {
    prompt += `- **Module${context.moduleOrder != null ? ` ${context.moduleOrder}` : ''}:** ${context.moduleTitle}\n`;
  }
  if (context?.chapterTitle) prompt += `- **Chapter:** ${context.chapterTitle}\n`;
  if (context?.subsectionTitle) prompt += `- **Current lesson:** ${context.subsectionTitle}\n`;
  if (context?.contentType) prompt += `- **Content type:** ${context.contentType}\n`;

  if (context?.contentType === 'CODING_EXERCISE' || context?.exerciseId) {
    prompt += `\nStudent is on a **coding exercise**. Guide with hints, test-case thinking, and small code snippets — not full solutions.\n`;
  }
  if (context?.contentType === 'INTERVIEW') {
    prompt += `\nStudent is in **interview preparation** for this topic. Help with interview Q&A, model answers, and practice — only for this lesson's subject.\n`;
  }
  if (context?.contentType === 'LESSON') {
    prompt += `\nStudent is reading a **lesson**. Explain concepts, clarify examples, and connect to Constel labs — stay on this lesson's syllabus.\n`;
  }

  if (context?.studentCode) {
    prompt += `\nStudent's current code:\n\`\`\`python\n${context.studentCode}\n\`\`\`\n`;
  }
  if (context?.compilerError) {
    prompt += `\nCompiler/runtime error:\n${context.compilerError}\n`;
  }

  return prompt;
}

export function buildMockInterviewPrompt(type: 'technical' | 'hr' | 'coding'): string {
  const prompts = {
    technical: 'You are conducting a technical interview for a software engineering internship. Ask one question at a time about programming concepts, data structures, and algorithms. Evaluate answers and provide constructive feedback.',
    hr: 'You are conducting an HR interview for an internship program. Ask behavioral questions using the STAR method framework. Evaluate communication skills and provide feedback.',
    coding: 'You are conducting a coding interview. Present one coding problem at a time. Evaluate the student\'s approach, code quality, and problem-solving skills. Provide hints if stuck.',
  };
  return prompts[type];
}
