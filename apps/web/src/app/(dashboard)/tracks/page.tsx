'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { getDifficultyColor, getDifficultyLabel } from '@/lib/utils';

interface Track {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  difficulty: string;
  category: string;
  estimatedWeeks: number;
  progressPercent?: number;
  _count?: { modules: number };
}

export default function TracksPage() {
  const { data: tracks, isLoading } = useQuery({
    queryKey: ['tracks'],
    queryFn: () => api.getTracks() as Promise<Track[]>,
  });

  const progression = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(3)].map((_, i) => <div key={i} className="h-64 bg-secondary rounded-xl" />)}
      </div>
    );
  }

  if (!tracks?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Tracks</h1>
          <p className="text-muted-foreground mt-1">Tracks assigned to you by your admin appear here.</p>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium">No tracks assigned yet</h3>
            <p className="text-muted-foreground mt-1 text-sm">Contact your admin to get enrolled in a learning track.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Tracks</h1>
        <p className="text-muted-foreground mt-1">
          Your assigned learning paths. Continue where you left off.
        </p>
      </div>

      {progression.map((level) => {
        const levelTracks = tracks.filter((t) => t.difficulty === level);
        if (!levelTracks.length) return null;

        return (
          <div key={level} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(level)}`}>
                {getDifficultyLabel(level)}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {levelTracks.map((track, i) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="overflow-hidden transition-all hover:shadow-lg hover:border-purple-500/30">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs ${getDifficultyColor(track.difficulty)}`}>
                          {getDifficultyLabel(track.difficulty)}
                        </span>
                      </div>
                      <CardTitle className="mt-3">{track.name}</CardTitle>
                      <CardDescription>{track.tagline}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> {track.estimatedWeeks} weeks
                        </span>
                        <span>{track._count?.modules || 0} modules</span>
                      </div>
                      {track.progressPercent !== undefined && (
                        <ProgressBar value={track.progressPercent} showLabel />
                      )}
                      <Link href={`/learn/${track.slug}`}>
                        <Button className="w-full">
                          Continue Learning <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
