'use client';

import { useRef, useState, useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useThemeStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Play, Send, Maximize2, Minimize2, Lightbulb, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  initialCode?: string;
  onRun?: (code: string) => Promise<unknown>;
  onSubmit?: (code: string) => Promise<unknown>;
  onHint?: (code: string) => Promise<{ content?: string } | void>;
  readOnly?: boolean;
  language?: string;
  className?: string;
}

export function CodeEditor({
  initialCode = '',
  onRun,
  onSubmit,
  onHint,
  readOnly = false,
  language = 'python',
  className,
}: CodeEditorProps) {
  const { theme } = useThemeStore();
  const editorRef = useRef<unknown>(null);
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [testResults, setTestResults] = useState<Array<{ passed: boolean; input: string }> | null>(null);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleRun = useCallback(async () => {
    if (!onRun) return;
    setIsRunning(true);
    setOutput('');
    setError('');
    setTestResults(null);
    try {
      const result = (await onRun(code)) as { success?: boolean; output?: string; error?: string };
      if (result.success) {
        setOutput(result.output || '');
      } else {
        setError(result.error || 'Execution failed');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsRunning(false);
    }
  }, [code, onRun]);

  const handleSubmit = useCallback(async () => {
    if (!onSubmit) return;
    setIsSubmitting(true);
    setOutput('');
    setError('');
    try {
      const result = (await onSubmit(code)) as {
        success?: boolean;
        passed?: number;
        total?: number;
        testResults?: Array<{ passed: boolean; input: string }>;
        error?: string;
      };
      if (result.testResults) setTestResults(result.testResults);
      const pendingReview = (result as { pendingReview?: boolean }).pendingReview;
      const message = (result as { message?: string }).message;
      if (pendingReview) {
        setOutput(message || '📤 Submitted for admin review.');
      } else if (result.success) {
        setOutput(`✅ All ${result.total} tests passed!`);
      } else {
        setError(`❌ ${result.passed}/${result.total} tests passed`);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }, [code, onSubmit]);

  const handleHint = useCallback(async () => {
    if (!onHint) return;
    try {
      const result = await onHint(code);
      if (result && typeof result === 'object' && 'content' in result && result.content) {
        setOutput(`💡 Hint: ${result.content}`);
        setError('');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, [code, onHint]);

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-border overflow-hidden bg-[#1e1e1e]',
        isFullscreen && 'fixed inset-4 z-50',
        className,
      )}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-2 text-xs text-gray-400 font-mono">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          {onHint && (
            <Button variant="ghost" size="sm" onClick={handleHint} className="text-yellow-400 hover:text-yellow-300">
              <Lightbulb className="w-4 h-4" />
              AI Hint
            </Button>
          )}
          {onRun && (
            <Button variant="ghost" size="sm" onClick={handleRun} disabled={isRunning} className="text-green-400">
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run
            </Button>
          )}
          {onSubmit && (
            <Button variant="ghost" size="sm" onClick={handleSubmit} disabled={isSubmitting} className="text-blue-400">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-gray-400"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(v) => setCode(v || '')}
          onMount={handleEditorMount}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            readOnly,
            tabSize: 4,
            wordWrap: 'on',
            padding: { top: 16 },
          }}
        />
      </div>

      {(output || error || testResults) && (
        <div className="border-t border-border bg-[#1a1a1a] max-h-[200px] overflow-auto">
          <div className="px-4 py-2 text-xs text-gray-500 border-b border-border">Console Output</div>
          <div className="p-4 font-mono text-sm">
            {output && <pre className="text-green-400 whitespace-pre-wrap">{output}</pre>}
            {error && <pre className="text-red-400 whitespace-pre-wrap">{error}</pre>}
            {testResults && (
              <div className="space-y-1 mt-2">
                {testResults.map((t, i) => (
                  <div key={i} className={t.passed ? 'text-green-400' : 'text-red-400'}>
                    Test {i + 1}: {t.passed ? '✅ Passed' : '❌ Failed'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
