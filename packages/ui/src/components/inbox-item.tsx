import * as React from 'react';
import { Badge } from './badge';
import { cn } from '../lib/cn';

export type InboxUrgency = 'high' | 'medium' | 'low';

export interface InboxItemProps extends React.HTMLAttributes<HTMLDivElement> {
  client: string;
  visa: string;
  score: number;
  time: string;
  urgency: InboxUrgency;
  active?: boolean;
}

const URGENCY_BAR: Record<InboxUrgency, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-slate-200',
};

const BADGE_VARIANT: Record<string, 'visa' | 'ai' | 'success' | 'default'> = {
  'O-1B': 'visa',
  'P-1B': 'ai',
  'O-1A': 'default',
  'P-1': 'success',
};

function clientInitials(client: string) {
  const parts = client.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export const InboxItem = React.forwardRef<HTMLDivElement, InboxItemProps>(
  ({ client, visa, score, time, urgency, active, className, ...props }, ref) => {
    const badgeVariant = BADGE_VARIANT[visa] ?? 'visa';
    const dash = `${Math.max(0, Math.min(100, score))},100`;

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex cursor-pointer gap-4 border-b border-slate-200 py-5 pl-6 pr-5 transition-all duration-150 ease-in-out',
          active ? 'bg-slate-100' : 'hover:bg-slate-50',
          className,
        )}
        {...props}
      >
        <span className={cn('absolute inset-y-0 left-0 w-1', URGENCY_BAR[urgency])} aria-hidden />
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
          {clientInitials(client)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <Badge variant={badgeVariant}>{visa}</Badge>
            <div className="relative h-8 w-8 shrink-0" aria-label={`AI score ${score}%`}>
              <svg className="-rotate-90" width="32" height="32" viewBox="0 0 36 36">
                <path
                  className="fill-none stroke-slate-200"
                  strokeWidth="3"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="fill-none stroke-indigo-500"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={dash}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-700">
                {score}
              </div>
            </div>
          </div>
          <div className="truncate text-[0.875rem] font-semibold text-slate-900">{client}</div>
          <div className="mt-1 flex items-center justify-between text-[0.75rem] text-slate-500">
            <span>AI Draft available for review</span>
            <span>{time}</span>
          </div>
        </div>
      </div>
    );
  },
);
InboxItem.displayName = 'InboxItem';
