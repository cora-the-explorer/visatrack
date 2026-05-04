import * as React from 'react';
import { cn } from '../lib/cn';

export type TimelineStatus = 'completed' | 'current' | 'pending';

export interface TimelineItemProps {
  date: string;
  title: string;
  status?: TimelineStatus;
  isLast?: boolean;
}

export function TimelineItem({ date, title, status = 'pending', isLast }: TimelineItemProps) {
  const completed = status === 'completed';
  const current = status === 'current';
  return (
    <div
      className={cn(
        'relative pb-8 pl-6',
        !isLast && 'border-l-2',
        completed ? 'border-indigo-500' : current ? 'border-indigo-300' : 'border-slate-200',
        isLast && 'border-l-2 border-transparent',
      )}
    >
      <span
        className={cn(
          'absolute -left-[7px] top-0 h-3 w-3 rounded-full border-2 border-white',
          completed ? 'bg-indigo-500' : current ? 'bg-indigo-400' : 'bg-slate-300',
        )}
      />
      <div className="text-[0.7rem] text-slate-500">{date}</div>
      <div
        className={cn(
          'mt-0.5 text-sm font-semibold',
          status === 'pending' ? 'text-slate-500' : 'text-slate-800',
        )}
      >
        {title}
      </div>
    </div>
  );
}
