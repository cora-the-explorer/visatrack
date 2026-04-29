'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  Calendar,
  FileText,
  Inbox,
  KanbanSquare,
  PenLine,
  Scale,
  Settings,
  Users,
  BarChart3,
} from 'lucide-react';
import { cn } from '@spinvisa/ui';

const NAV = [
  { href: '/pipeline', label: 'Pipeline', icon: KanbanSquare },
  { href: '/cases', label: 'Cases', icon: Briefcase },
  { href: '/inbox', label: 'Inbox', icon: Inbox },
  { href: '/drafts', label: 'Drafts', icon: PenLine },
  { href: '/forms', label: 'Forms', icon: FileText },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/lawyers', label: 'Lawyers', icon: Scale },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
] as const;

const FOOTER_NAV = [
  { href: '/settings/team', label: 'Settings', icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 flex-col border-r bg-card">
      <div className="px-5 py-5">
        <Link
          href="/pipeline"
          className="bg-gradient-to-r from-svw-pink to-svw-teal bg-clip-text text-xl font-bold tracking-tight text-transparent"
        >
          SpinVisa
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 px-2 py-2">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-0.5 border-t px-2 py-2">
        {FOOTER_NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="flex items-center gap-3 border-t px-4 py-3 text-xs text-muted-foreground">
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-svw-pink to-svw-teal" />
        <div className="leading-tight">
          <div className="font-medium text-foreground">Firm User</div>
          <div>Acme Immigration LLP</div>
        </div>
      </div>
    </aside>
  );
}
