'use client';

import { useState, useRef, useEffect } from 'react';
import { useAIStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Send, Bot, Sparkles, Copy, Check, PanelRightClose } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { BRAND } from '@/lib/branding';

interface AIChatPanelProps {
  onClose?: () => void;
  className?: string;
  compact?: boolean;
}

export function AIChatPanel({ onClose, className, compact }: AIChatPanelProps) {
  const { messages, chatId, context, addMessage, setChatId } = useAIStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const lessonTopic = (context.subsectionTitle as string | undefined)?.trim();
  const moduleLabel = (context.moduleTitle as string | undefined)?.trim();
  const scopeHint = lessonTopic
    ? `Questions about: ${lessonTopic}`
    : moduleLabel
      ? `Questions about: ${moduleLabel}`
      : 'Open a lesson to ask topic-specific questions';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      const result = await api.aiChat(userMessage, chatId || undefined, context);
      if (result.chatId && !chatId) setChatId(result.chatId);
      addMessage('assistant', result.content);
    } catch (err) {
      const msg = (err as Error).message || 'Unknown error';
      let hint = msg;
      if (msg.includes('Cannot reach the API')) {
        hint = msg;
      } else if (msg.includes('401') || msg.includes('403')) {
        hint =
          'Please verify QWEN_API_KEY in .env and set QWEN_BASE_URL to https://dashscope-intl.aliyuncs.com/compatible-mode/v1 (Singapore region).';
      } else if (msg.includes('Unauthorized')) {
        hint = 'Your session expired. Please log in again.';
      }
      addMessage('assistant', `Sorry, I couldn't connect to Qwen. ${hint}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className={cn('flex flex-col h-full bg-background/95 border-l border-border', className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">{BRAND.aiAssistantName}</h3>
            <p className="text-xs text-muted-foreground truncate" title={scopeHint}>{scopeHint}</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} title="Hide assistant">
            <PanelRightClose className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scroll-area">
        {messages.length === 0 && (
          <div className="text-center py-8 space-y-4 px-3">
            <div className="relative inline-flex">
              <Sparkles className="w-10 h-10 mx-auto text-purple-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium gradient-text">{BRAND.tagline}</p>
              <p className="text-xs text-muted-foreground">{BRAND.aiTagline}</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {lessonTopic
                ? `Ask about "${lessonTopic}" — concepts, examples, or exercise hints for this lesson only.`
                : BRAND.aiEmptyStateHint}
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full gradient-bg flex-shrink-0 flex items-center justify-center mt-1">
                <Bot className="w-3 h-3 text-white" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[90%] rounded-xl px-3 py-2 text-sm',
                msg.role === 'user'
                  ? 'gradient-bg text-white'
                  : 'bg-secondary/50 prose prose-sm dark:prose-invert max-w-none',
              )}
            >
              {msg.role === 'assistant' ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className: codeClass, children, ...props }) {
                      const match = /language-(\w+)/.exec(codeClass || '');
                      const codeStr = String(children).replace(/\n$/, '');
                      if (match) {
                        return (
                          <div className="relative group">
                            <button
                              onClick={() => copyCode(codeStr, i)}
                              className="absolute top-2 right-2 p-1 rounded bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {copied === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                            <pre className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                              <code className={codeClass} {...props}>{children}</code>
                            </pre>
                          </div>
                        );
                      }
                      return <code className="bg-gray-800 px-1 rounded" {...props}>{children}</code>;
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center">
              <Bot className="w-3 h-3 text-white animate-pulse" />
            </div>
            <div className="bg-secondary/50 rounded-xl px-3 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={cn('p-4 border-t border-border shrink-0', compact && 'p-3')}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={
              lessonTopic
                ? `Ask about ${lessonTopic}…`
                : 'Open a lesson first…'
            }
            className="flex-1 bg-secondary/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-0"
          />
          <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()} className="shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
