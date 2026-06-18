'use client';

import * as Progress from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, className, showLabel = false }: ProgressBarProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(value)}%</span>
        </div>
      )}
      <Progress.Root
        className="relative h-2 w-full overflow-hidden rounded-full bg-secondary"
        value={value}
      >
        <Progress.Indicator
          className="h-full gradient-bg transition-all duration-500 ease-out rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </Progress.Root>
    </div>
  );
}
