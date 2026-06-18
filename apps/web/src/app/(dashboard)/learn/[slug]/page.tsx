'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useAIStore } from '@/lib/store';
import { AIChatPanel } from '@/components/ai/ai-chat-panel';
import { LessonMarkdown } from '@/components/lesson/lesson-markdown';
import { CodeEditor } from '@/components/editor/code-editor';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChevronRight, CheckCircle2, Circle, Code2, FileText, HelpCircle,
  FolderOpen, Award, MessageSquare, ChevronLeft, ArrowRight,
  PanelLeftClose, PanelLeftOpen, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Subsection {
  id: string;
  title: string;
  order: number;
  contentType: string;
  lesson?: { content: string };
  exercise?: {
    id: string;
    title: string;
    difficulty: string;
    problemStatement: string;
    hints: string[];
    sampleInput?: string;
    sampleOutput?: string;
    constraints?: string;
    starterCode: string;
    testCases: unknown;
  };
  quiz?: {
    id: string;
    title: string;
    passingScore?: number;
    timeLimit?: number;
    questions: Array<{ id: string; type: string; question: string; options?: string[]; code?: string; points: number }>;
  };
}

interface TrackData {
  id: string;
  name: string;
  slug: string;
  progressPercent: number;
  completedCount: number;
  totalSubsections: number;
  progress: Record<string, boolean>;
  modules: Array<{
    id: string;
    title: string;
    order: number;
    chapters: Array<{
      id: string;
      title: string;
      order: number;
      subsections: Subsection[];
    }>;
  }>;
  miniProjects: unknown[];
  capstoneProjects: unknown[];
  interviewModules: unknown[];
}

function buildLessonAIContext(track: TrackData, sub: Subsection) {
  const mod = track.modules.find((m) =>
    m.chapters.some((c) => c.subsections.some((s) => s.id === sub.id)),
  );
  const ch = mod?.chapters.find((c) => c.subsections.some((s) => s.id === sub.id));

  return {
    trackId: track.id,
    trackName: track.name,
    trackSlug: track.slug,
    moduleId: mod?.id,
    moduleTitle: mod?.title,
    moduleOrder: mod?.order,
    chapterId: ch?.id,
    chapterTitle: ch?.title,
    subsectionId: sub.id,
    subsectionTitle: sub.title,
    contentType: sub.contentType,
    exerciseId: sub.exercise?.id,
  };
}

export default function LearnPage() {
  const params = useParams();
  const slug = params.slug as string;
  const queryClient = useQueryClient();
  const [activeSubsection, setActiveSubsection] = useState<Subsection | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [curriculumOpen, setCurriculumOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(true);
  const { setContext, clearMessages } = useAIStore();
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const lastSubsectionIdRef = useRef<string | null>(null);

  const scrollContentToTop = useCallback(() => {
    contentScrollRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const isQuiz = activeSubsection?.contentType === 'QUIZ';

  useEffect(() => {
    scrollContentToTop();
  }, [activeSubsection?.id, scrollContentToTop]);

  useEffect(() => {
    if (!loadingDetail && activeSubsection?.id) {
      scrollContentToTop();
    }
  }, [loadingDetail, activeSubsection?.id, scrollContentToTop]);

  useEffect(() => {
    if (activeSubsection?.contentType === 'QUIZ') {
      setAiOpen(false);
    }
  }, [activeSubsection?.id, activeSubsection?.contentType]);

  useEffect(() => {
    return () => {
      setContext({});
      clearMessages();
    };
  }, [setContext, clearMessages]);

  const { data: track, isLoading } = useQuery({
    queryKey: ['track', slug],
    queryFn: () => api.getTrack(slug) as Promise<TrackData>,
  });

  const flatSubsections = useMemo(() => {
    if (!track) return [];
    return track.modules.flatMap((m) => m.chapters.flatMap((c) => c.subsections));
  }, [track]);

  const currentIndex = useMemo(
    () => flatSubsections.findIndex((s) => s.id === activeSubsection?.id),
    [flatSubsections, activeSubsection],
  );

  const completeMutation = useMutation({
    mutationFn: (subsectionId: string) => api.markComplete(subsectionId),
    onSuccess: () => {
      toast.success('Lesson completed! +XP');
      queryClient.invalidateQueries({ queryKey: ['track', slug] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const applyAIContext = useCallback((sub: Subsection) => {
    if (!track || sub.contentType === 'QUIZ') return;

    if (lastSubsectionIdRef.current && lastSubsectionIdRef.current !== sub.id) {
      clearMessages();
    }
    lastSubsectionIdRef.current = sub.id;
    setContext(buildLessonAIContext(track, sub));
  }, [track, setContext, clearMessages]);

  const selectSubsection = useCallback(async (sub: Subsection) => {
    setQuizAnswers({});
    applyAIContext(sub);
    const mod = track?.modules.find((m) =>
      m.chapters.some((c) => c.subsections.some((s) => s.id === sub.id)),
    );
    if (mod) {
      setExpandedModules((prev) => new Set([...prev, mod.id]));
    }

    setActiveSubsection(sub);
    setLoadingDetail(true);
    try {
      const full = (await api.getSubsection(sub.id)) as Subsection;
      setActiveSubsection(full);
      applyAIContext(full);
    } catch {
      toast.error('Failed to load content');
      setActiveSubsection(sub);
    } finally {
      setLoadingDetail(false);
    }
  }, [track, applyAIContext]);

  // Auto-select first subsection on load
  useEffect(() => {
    if (track && flatSubsections.length > 0 && !activeSubsection) {
      selectSubsection(flatSubsections[0]);
      setExpandedModules(new Set([track.modules[0]?.id].filter(Boolean)));
    }
  }, [track, flatSubsections, activeSubsection, selectSubsection]);

  const goToPrevious = () => {
    if (currentIndex > 0) selectSubsection(flatSubsections[currentIndex - 1]);
  };

  const goToNext = () => {
    if (currentIndex < flatSubsections.length - 1) {
      selectSubsection(flatSubsections[currentIndex + 1]);
    }
  };

  const handleMarkCompleteAndNext = async () => {
    if (!activeSubsection) return;
    await completeMutation.mutateAsync(activeSubsection.id);
    if (currentIndex < flatSubsections.length - 1) {
      selectSubsection(flatSubsections[currentIndex + 1]);
    }
  };

  if (isLoading) {
    return <div className="flex-1 animate-pulse bg-secondary/30 m-4 rounded-xl" />;
  }

  if (!track) return <div className="p-8">Track not found</div>;

  const contentIcon = (type: string) => {
    switch (type) {
      case 'CODING_EXERCISE': return Code2;
      case 'QUIZ': return HelpCircle;
      default: return FileText;
    }
  };

  const isCompleted = activeSubsection ? track.progress[activeSubsection.id] : false;

  return (
    <div className="flex flex-1 min-h-0 h-full overflow-hidden">
      {/* Curriculum sidebar */}
      <AnimatePresence initial={false}>
        {curriculumOpen ? (
          <motion.aside
            key="curriculum-open"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 288, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 border-r border-border bg-secondary/20 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Curriculum</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurriculumOpen(false)} title="Hide curriculum">
                <PanelLeftClose className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0 scroll-area">
              <div className="mb-4">
                <h2 className="font-bold text-base leading-tight">{track.name}</h2>
                <ProgressBar value={track.progressPercent} showLabel className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {track.completedCount ?? 0} / {track.totalSubsections ?? flatSubsections.length} completed
                </p>
              </div>

              {track.modules.map((mod) => (
                <div key={mod.id}>
                  <button
                    onClick={() => setExpandedModules((prev) => {
                      const next = new Set(prev);
                      next.has(mod.id) ? next.delete(mod.id) : next.add(mod.id);
                      return next;
                    })}
                    className="flex items-center justify-between w-full p-2 text-sm font-medium hover:bg-secondary/50 rounded-lg"
                  >
                    <span className="text-left line-clamp-2">Module {mod.order}: {mod.title}</span>
                    <ChevronRight className={cn('w-4 h-4 shrink-0 transition-transform', expandedModules.has(mod.id) && 'rotate-90')} />
                  </button>
                  {expandedModules.has(mod.id) && mod.chapters.map((ch) => (
                    <div key={ch.id} className="ml-1 mt-1">
                      <p className="text-xs text-muted-foreground px-2 py-1">{ch.title}</p>
                      {ch.subsections.map((sub) => {
                        const Icon = contentIcon(sub.contentType);
                        const completed = track.progress[sub.id];
                        return (
                          <button
                            key={sub.id}
                            onClick={() => selectSubsection(sub)}
                            className={cn(
                              'flex items-center gap-2 w-full p-2 text-sm rounded-lg transition-colors',
                              activeSubsection?.id === sub.id ? 'bg-purple-500/15 text-purple-400' : 'hover:bg-secondary/40',
                            )}
                          >
                            {completed ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                            )}
                            <Icon className="w-3 h-3 shrink-0" />
                            <span className="truncate text-left">{sub.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}

              <div className="pt-4 border-t border-border space-y-1">
                <p className="text-xs font-medium text-muted-foreground px-2">Track Milestones</p>
                {[
                  { icon: FolderOpen, label: 'Mini Projects', count: track.miniProjects?.length },
                  { icon: Award, label: 'Capstone Project', count: track.capstoneProjects?.length },
                  { icon: MessageSquare, label: 'Interview Prep', count: track.interviewModules?.length },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label} ({item.count || 0})</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>
        ) : (
          <motion.div
            key="curriculum-closed"
            initial={{ width: 0 }}
            animate={{ width: 44 }}
            exit={{ width: 0 }}
            className="shrink-0 border-r border-border bg-secondary/10 flex flex-col items-center py-3 gap-2"
          >
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setCurriculumOpen(true)} title="Show curriculum">
              <PanelLeftOpen className="w-4 h-4" />
            </Button>
            <div className="flex-1 flex items-center">
              <span className="text-[10px] text-muted-foreground [writing-mode:vertical-rl] rotate-180 tracking-wide">
                Curriculum
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content — maximized */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-background">
        <div ref={contentScrollRef} className="flex-1 overflow-y-auto min-h-0 scroll-area">
          <div className="max-w-5xl mx-auto w-full px-6 lg:px-10 py-6 lg:py-8">
            {!activeSubsection ? (
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center space-y-4">
                  <FileText className="w-16 h-16 mx-auto text-purple-500/50" />
                  <h3 className="text-xl font-medium">Select a lesson to begin</h3>
                  <p className="text-muted-foreground">Choose from the curriculum panel</p>
                </div>
              </div>
            ) : (
              <motion.div
                key={activeSubsection.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap border-b border-border/60 pb-5">
                  <div className="min-w-0">
                    <p className="text-sm text-purple-400/90 font-medium">
                      Lesson {currentIndex + 1} of {flatSubsections.length}
                    </p>
                    <h1 className="text-xl lg:text-2xl font-bold mt-1 leading-tight">{activeSubsection.title}</h1>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {activeSubsection.contentType === 'LESSON' && !isCompleted && (
                      <Button onClick={() => completeMutation.mutate(activeSubsection.id)} disabled={completeMutation.isPending}>
                        Mark Complete
                      </Button>
                    )}
                    {isCompleted && (
                      <span className="text-sm text-green-500 flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500/10">
                        <CheckCircle2 className="w-4 h-4" /> Completed
                      </span>
                    )}
                  </div>
                </div>

                {loadingDetail && (
                  <div className="flex items-center justify-center py-20 text-muted-foreground">
                    Loading content...
                  </div>
                )}

                {!loadingDetail && activeSubsection.lesson && (
                  <Card className="border-border/60 shadow-sm">
                    <CardContent className="pt-6 pb-6 px-5 lg:px-8">
                      <LessonMarkdown content={activeSubsection.lesson.content} />
                    </CardContent>
                  </Card>
                )}

                {!loadingDetail && activeSubsection.exercise && (
                  <div className="space-y-4">
                    <Card className="border-border/60">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 flex-wrap text-xl">
                          <Code2 className="w-5 h-5" />
                          {activeSubsection.exercise.title}
                          <span className="text-xs px-2 py-0.5 rounded bg-secondary capitalize">{activeSubsection.exercise.difficulty}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 px-6 lg:px-8">
                        <div className="text-[0.9375rem] leading-relaxed">
                          <LessonMarkdown content={activeSubsection.exercise.problemStatement} />
                        </div>
                        {activeSubsection.exercise.sampleInput && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-secondary/50 rounded-lg p-4">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Sample Input</p>
                              <pre className="text-sm font-mono">{activeSubsection.exercise.sampleInput}</pre>
                            </div>
                            <div className="bg-secondary/50 rounded-lg p-4">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Sample Output</p>
                              <pre className="text-sm font-mono">{activeSubsection.exercise.sampleOutput}</pre>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <CodeEditor
                      initialCode={activeSubsection.exercise.starterCode}
                      onRun={(code) => api.runCode(code)}
                      onSubmit={(code) => api.submitCode(activeSubsection.exercise!.id, code)}
                      onHint={(code) =>
                        api.getAiHint(activeSubsection.exercise!.id, code) as Promise<{ content?: string }>
                      }
                    />
                  </div>
                )}

                {!loadingDetail && activeSubsection.quiz && (
                  <>
                    <p className="mb-4 text-sm text-muted-foreground rounded-lg border border-border bg-secondary/20 px-4 py-3">
                      Weekly assessment — AI Assistant is disabled during quizzes. Answer independently; 80% required to pass.
                    </p>
                    <QuizComponent
                      quiz={activeSubsection.quiz}
                      answers={quizAnswers}
                      setAnswers={setQuizAnswers}
                      onComplete={() => completeMutation.mutate(activeSubsection.id)}
                    />
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {activeSubsection && (
          <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur-sm px-6 lg:px-10 py-3">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
              <Button variant="outline" onClick={goToPrevious} disabled={currentIndex <= 0} className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground hidden md:block truncate max-w-[40%] text-center">
                {activeSubsection.title}
              </span>
              <div className="flex items-center gap-2">
                {activeSubsection.contentType === 'LESSON' && !isCompleted && (
                  <Button
                    variant="secondary"
                    onClick={handleMarkCompleteAndNext}
                    disabled={completeMutation.isPending}
                    className="gap-2 hidden sm:flex"
                  >
                    Complete & Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
                <Button onClick={goToNext} disabled={currentIndex >= flatSubsections.length - 1} className="gap-2">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI assistant sidebar — disabled during quizzes */}
      {!isQuiz && (
      <AnimatePresence initial={false}>
        {aiOpen ? (
          <motion.aside
            key="ai-open"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 overflow-hidden hidden md:block"
          >
            <AIChatPanel onClose={() => setAiOpen(false)} className="h-full w-[380px]" />
          </motion.aside>
        ) : (
          <motion.div
            key="ai-closed"
            initial={{ width: 0 }}
            animate={{ width: 44 }}
            exit={{ width: 0 }}
            className="shrink-0 border-l border-border bg-secondary/10 flex flex-col items-center py-3 gap-2 hidden md:flex"
          >
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setAiOpen(true)} title="Show AI assistant">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </Button>
            <div className="flex-1 flex items-center">
              <span className="text-[10px] text-muted-foreground [writing-mode:vertical-rl] rotate-180 tracking-wide">
                AI Assistant
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      )}

      {/* Mobile AI FAB — hidden during quizzes */}
      {!isQuiz && !aiOpen && (
        <button
          type="button"
          onClick={() => setAiOpen(true)}
          className="md:hidden fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full gradient-bg shadow-lg flex items-center justify-center text-white"
          title="Open AI assistant"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      )}
      {!isQuiz && aiOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setAiOpen(false)}>
          <div className="absolute inset-y-0 right-0 w-[min(100%,380px)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <AIChatPanel onClose={() => setAiOpen(false)} className="h-full" />
          </div>
        </div>
      )}
    </div>
  );
}

function QuizComponent({
  quiz,
  answers,
  setAnswers,
  onComplete,
}: {
  quiz: {
    id: string;
    title: string;
    passingScore?: number;
    timeLimit?: number;
    questions?: Array<{ id: string; type: string; question: string; options?: string[]; code?: string; points: number }>;
  };
  answers: Record<string, string>;
  setAnswers: (a: Record<string, string>) => void;
  onComplete: () => void;
}) {
  const [result, setResult] = useState<{ passed: boolean; percentage: number; results: Record<string, boolean>; retriesRemaining?: number } | null>(null);
  const [page, setPage] = useState(0);
  const questions = quiz.questions ?? [];
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(questions.length / PAGE_SIZE) || 1;
  const pageQuestions = questions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const passScore = quiz.passingScore ?? 80;

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No quiz questions loaded. Refresh the page or contact your admin.
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error(`Answer all ${questions.length} questions before submitting (${Object.keys(answers).length}/${questions.length} done)`);
      return;
    }
    try {
      const res = await api.submitQuiz(quiz.id, answers) as {
        passed: boolean;
        percentage: number;
        results: Record<string, boolean>;
        retriesRemaining?: number;
      };
      setResult(res);
      if (res.passed) {
        toast.success(`Assessment passed! Score: ${Math.round(res.percentage)}%`);
        onComplete();
      } else {
        toast.error(`Score: ${Math.round(res.percentage)}% — need ${passScore}% to pass. ${res.retriesRemaining ?? 0} retries left.`);
      }
    } catch (e) {
      toast.error((e as Error).message || 'Failed to submit quiz');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{quiz.title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {questions.length} questions · Pass: {passScore}%
          {quiz.timeLimit ? ` · Time limit: ${Math.round(quiz.timeLimit / 60)} min` : ''}
          {' · '}Answered: {Object.keys(answers).length}/{questions.length}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {result && (
          <div className={cn(
            'p-4 rounded-lg border text-sm',
            result.passed ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-red-500/50 bg-red-500/10 text-red-400',
          )}>
            {result.passed ? 'Passed' : 'Not passed'} — {Math.round(result.percentage)}%
            {!result.passed && result.retriesRemaining !== undefined && (
              <span> · {result.retriesRemaining} retries remaining</span>
            )}
          </div>
        )}

        {pageQuestions.map((q, i) => {
          const globalIndex = page * PAGE_SIZE + i;
          return (
            <div key={q.id} className="space-y-3 p-4 rounded-lg bg-secondary/30">
              <p className="font-medium">Q{globalIndex + 1}. {q.question}</p>
              {q.code && (
                <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-sm overflow-x-auto">{q.code}</pre>
              )}
              {q.options && (
                <div className="space-y-2">
                  {q.options.map((opt) => (
                    <label
                      key={opt}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                        answers[q.id] === opt ? 'border-purple-500 bg-purple-500/10' : 'border-border hover:bg-secondary/50',
                        result && (result.results[q.id] ? answers[q.id] === opt && 'border-green-500' : answers[q.id] === opt && 'border-red-500'),
                      )}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => setAnswers({ ...answers, [q.id]: opt })}
                        disabled={!!result?.passed}
                        className="accent-purple-500"
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Button variant="outline" size="sm" disabled={page <= 0} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>

        {!result?.passed && (
          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={Object.keys(answers).length < questions.length}
          >
            Submit Assessment ({Object.keys(answers).length}/{questions.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
