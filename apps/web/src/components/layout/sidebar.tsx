'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Inbox, LayoutGrid, Settings } from 'lucide-react';
import { cn } from '@visa-track/ui';

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
  count?: number;
  urgent?: boolean;
};

const NAV: readonly NavItem[] = [
  { href: '/pipeline', label: 'Pipeline', icon: LayoutGrid, count: 24 },
  { href: '/inbox', label: 'Inbox', icon: Inbox, count: 4, urgent: true },
  { href: '/cases', label: 'Cases', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/cases') return pathname.startsWith('/cases');
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex h-screen w-[220px] flex-col bg-[#0a0f1e] px-3 py-5 text-slate-400">
      <Link
        href="/pipeline"
        className="mb-8 flex items-center gap-2 px-3 text-[0.95rem] font-bold tracking-tight text-white"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-gradient-to-br from-indigo-500 to-violet-500 text-[14px] font-black leading-none text-white">
          S
        </span>
        Visa Track
      </Link>

      <nav className="flex-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'mb-1 flex items-center justify-between rounded-full px-3 py-2 text-[0.85rem] font-medium transition-all duration-150 ease-in-out',
                active
                  ? 'bg-indigo-500 text-white'
                  : 'hover:bg-indigo-500/15 hover:text-white',
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              {item.count !== undefined && (
                <span
                  className={cn(
                    'rounded-[10px] px-1.5 py-px text-[0.7rem] font-medium leading-tight',
                    item.urgent ? 'bg-red-500 text-white' : 'bg-white/10 text-white/80',
                  )}
                >
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/settings/team"
        className={cn(
          'flex items-center gap-2.5 rounded-full px-3 py-2 text-[0.85rem] font-medium opacity-50 transition-all duration-150 ease-in-out hover:bg-indigo-500/15 hover:text-white hover:opacity-100',
          isActive('/settings') && 'bg-indigo-500 text-white opacity-100',
        )}
      >
        <Settings className="h-4 w-4" />
        Settings
      </Link>
    </aside>
  );
}
