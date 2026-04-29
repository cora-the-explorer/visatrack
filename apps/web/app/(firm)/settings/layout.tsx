import type { ReactNode } from 'react';
import Link from 'next/link';
import { Topbar } from '@/components/layout/topbar';

const TABS = [
  { href: '/settings/team', label: 'Team' },
  { href: '/settings/billing', label: 'Billing' },
  { href: '/settings/integrations', label: 'Integrations' },
  { href: '/settings/branding', label: 'Branding' },
] as const;

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <Topbar title="Settings" />
      <div className="flex gap-1 border-b px-6">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
