import type { ReactNode } from 'react';
import { Bell, ChevronRight, ListFilter } from 'lucide-react';

interface TopbarProps {
  title: string;
  user?: { name: string; initials: string };
  actions?: ReactNode;
}

export function Topbar({
  title,
  user = { name: 'Marcus Thorne', initials: 'MT' },
  actions,
}: TopbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-2 text-[0.85rem] font-medium">
        <span className="text-slate-500">SpinVisa</span>
        <ChevronRight className="h-3 w-3 stroke-[2.5] text-slate-400" />
        <b className="font-semibold text-slate-900">{title}</b>
      </div>
      <div className="flex items-center gap-5">
        {actions ?? (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-[0.85rem] font-medium text-slate-700 transition-all duration-150 ease-in-out hover:bg-slate-50"
          >
            <ListFilter className="h-3.5 w-3.5" />
            Filter & Sort
          </button>
        )}
        <button
          type="button"
          aria-label="Notifications"
          className="relative cursor-pointer text-slate-500 transition-all duration-150 ease-in-out hover:text-slate-900"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>
        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-5 text-[0.85rem] font-medium">
          <span>{user.name}</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-600">
            {user.initials}
          </span>
        </div>
      </div>
    </header>
  );
}
