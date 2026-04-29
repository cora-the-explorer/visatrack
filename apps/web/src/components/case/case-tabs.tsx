'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@spinvisa/ui';

const TABS = [
  { slug: '', label: 'Overview' },
  { slug: 'evidence', label: 'Evidence' },
  { slug: 'documents', label: 'Documents' },
  { slug: 'forms', label: 'Forms' },
  { slug: 'rfe', label: 'RFE' },
  { slug: 'timeline', label: 'Timeline' },
] as const;

export function CaseTabs({ caseId }: { caseId: string }) {
  const pathname = usePathname();
  const base = `/cases/${caseId}`;

  return (
    <div className="flex gap-1 border-b px-6">
      {TABS.map((tab) => {
        const href = tab.slug ? `${base}/${tab.slug}` : base;
        const active = tab.slug ? pathname?.startsWith(href) : pathname === base;
        return (
          <Link
            key={tab.slug || 'overview'}
            href={href}
            className={cn(
              'border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
