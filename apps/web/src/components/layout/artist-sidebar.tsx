'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, FileText, Home, MessageSquare } from 'lucide-react';
import { cn } from '@spinvisa/ui';

const NAV = [
  { href: '/portal/dashboard', label: 'My Case', icon: Home },
  { href: '/portal/documents', label: 'Documents', icon: FileText },
  { href: '/portal/messages', label: 'Messages', icon: MessageSquare },
  { href: '/portal/timeline', label: 'Timeline', icon: Calendar },
] as const;

export function ArtistSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <aside className="flex w-64 flex-col border-r border-slate-100 bg-white px-5 py-8">
      <Link href="/portal/dashboard" className="mb-10 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-black text-white">
          S
        </span>
        <span className="text-base font-semibold tracking-tight text-slate-900">SpinVisa</span>
      </Link>

      <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        My Portal
      </div>

      <nav className="space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-100 pt-6">
        <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
          <p className="text-xs font-medium text-indigo-900">
            Need help? Your attorney typically replies within one business day.
          </p>
        </div>
      </div>
    </aside>
  );
}
