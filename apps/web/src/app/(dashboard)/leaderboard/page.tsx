'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Crown } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  level: number;
}

export default function LeaderboardPage() {
  const { data: entries, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => api.getLeaderboard() as Promise<LeaderboardEntry[]>,
  });

  const rankIcons = [Crown, Medal, Medal];
  const rankColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <Trophy className="w-12 h-12 mx-auto text-yellow-500 mb-3" />
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground mt-1">Top performers in Constel AI NextGen</p>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(10)].map((_, i) => <div key={i} className="h-16 bg-secondary rounded-xl" />)}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>XP Rankings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {entries?.map((entry, i) => {
              const RankIcon = i < 3 ? rankIcons[i] : null;
              return (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                    i < 3 ? 'bg-secondary/50' : 'hover:bg-secondary/30'
                  }`}
                >
                  <div className={`w-8 text-center font-bold ${i < 3 ? rankColors[i] : 'text-muted-foreground'}`}>
                    {RankIcon ? <RankIcon className="w-6 h-6 mx-auto" /> : `#${entry.rank}`}
                  </div>
                  <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-bold">
                    {entry.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{entry.name}</p>
                    <p className="text-sm text-muted-foreground">Level {entry.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-500">{entry.xp.toLocaleString()} XP</p>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
