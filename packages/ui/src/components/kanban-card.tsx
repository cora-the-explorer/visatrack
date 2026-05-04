import * as React from 'react';
import { Badge } from './badge';
import { cn } from '../lib/cn';

export interface KanbanCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  visa: string;
  attorney: string;
  days: number;
  score: number;
  dragging?: boolean;
}

const STRIP_COLOR: Record<string, string> = {
  'O-1B': 'bg-indigo-500',
  'P-1B': 'bg-violet-500',
  'O-1A': 'bg-blue-500',
  'P-1': 'bg-emerald-500',
};

const BADGE_VARIANT: Record<string, 'visa' | 'ai' | 'success' | 'default'> = {
  'O-1B': 'visa',
  'P-1B': 'ai',
  'O-1A': 'default',
  'P-1': 'success',
};

function attorneyInitials(attorney: string) {
  const parts = attorney.replace(/\./g, '').split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export const KanbanCard = React.forwardRef<HTMLDivElement, KanbanCardProps>(
  ({ name, visa, attorney, days, score, dragging, className, ...props }, ref) => {
    const stripColor = STRIP_COLOR[visa] ?? 'bg-indigo-500';
    const badgeVariant = BADGE_VARIANT[visa] ?? 'visa';
    const progress = Math.min((days / 30) * 100, 100);
    const overdue = progress > 80;

    return (
      <div
        ref={ref}
        className={cn(
          'relative mb-3 cursor-grab overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-150 ease-in-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:cursor-grabbing',
          dragging && 'opacity-50',
          className,
        )}
        {...props}
      >
        <span className={cn('absolute inset-y-0 left-0 w-[3px]', stripColor)} aria-hidden />
        <div className="mb-3 pl-2 text-[0.875rem] font-semibold leading-snug text-slate-900">
          {name}
        </div>
        <Badge variant={badgeVariant}>{visa}</Badge>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[0.7rem] font-medium text-slate-500">{days}d in stage</span>
          <span
            className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-[10px] font-semibold text-slate-700"
            title={`${attorney} · AI ${score}%`}
          >
            {attorneyInitials(attorney)}
          </span>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn('h-full transition-all', overdue ? 'bg-red-500' : 'bg-indigo-500')}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  },
);
KanbanCard.displayName = 'KanbanCard';
