'use client';

import { useEffect, useRef, useId } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderId = useId().replace(/:/g, '');

  useEffect(() => {
    let cancelled = false;

    import('mermaid').then(({ default: mermaid }) => {
      if (cancelled || !containerRef.current) return;

      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'strict',
        fontFamily: 'inherit',
        flowchart: { htmlLabels: true, curve: 'basis' },
      });

      const id = `mmd-${renderId}-${Date.now()}`;
      mermaid
        .render(id, chart.trim())
        .then(({ svg }) => {
          if (!cancelled && containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        })
        .catch(() => {
          if (containerRef.current) {
            containerRef.current.innerHTML = `<pre class="text-xs p-3 overflow-x-auto">${chart}</pre>`;
          }
        });
    });

    return () => {
      cancelled = true;
    };
  }, [chart, renderId]);

  return (
    <div
      ref={containerRef}
      className="my-4 overflow-x-auto rounded-lg border border-border/60 bg-secondary/20 p-4 [&_svg]:mx-auto [&_svg]:max-w-full"
    />
  );
}

const lessonProse =
  'prose prose-sm dark:prose-invert max-w-none ' +
  'prose-headings:scroll-mt-20 prose-headings:font-semibold ' +
  'prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-h4:text-sm ' +
  'prose-p:text-[0.9375rem] prose-p:leading-relaxed prose-li:text-[0.9375rem] ' +
  'prose-code:text-[0.8125rem] prose-pre:text-[0.8125rem] ' +
  'prose-table:text-sm prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2';

type LessonMarkdownProps = {
  content: string;
  className?: string;
};

export function LessonMarkdown({ content, className }: LessonMarkdownProps) {
  return (
    <div className={cn(lessonProse, className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        table({ children }) {
          return (
            <div className="my-4 overflow-x-auto rounded-lg border border-border/60 not-prose">
              <table className="min-w-full text-sm divide-y divide-border">{children}</table>
            </div>
          );
        },
        thead({ children }) {
          return <thead className="bg-secondary/40">{children}</thead>;
        },
        th({ children }) {
          return (
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-foreground/90">
              {children}
            </th>
          );
        },
        td({ children }) {
          return <td className="px-3 py-2 text-sm text-foreground/85 align-top">{children}</td>;
        },
        tr({ children }) {
          return <tr className="border-b border-border/40 even:bg-secondary/10">{children}</tr>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-purple-500/50 bg-purple-500/5 py-2 px-4 rounded-r-lg not-italic text-[0.9375rem]">
              {children}
            </blockquote>
          );
        },
        code({ className: codeClass, children, ...props }) {
          const match = /language-(\w+)/.exec(codeClass || '');
          const lang = match?.[1];
          const codeStr = String(children).replace(/\n$/, '');

          if (lang === 'mermaid') {
            return <MermaidDiagram chart={codeStr} />;
          }

          if (lang) {
            return (
              <pre className="bg-gray-950 border border-border/50 rounded-lg p-3 overflow-x-auto text-[0.8125rem] leading-relaxed not-prose">
                <code className={codeClass} {...props}>
                  {children}
                </code>
              </pre>
            );
          }

          return (
            <code className="bg-secondary/60 px-1.5 py-0.5 rounded text-[0.8125rem]" {...props}>
              {children}
            </code>
          );
        },
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
