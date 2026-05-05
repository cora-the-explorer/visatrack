'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import './theme.css';

const NAV = [
  { href: '/marketplace', label: 'Inbox' },
  { href: '/marketplace/claimed', label: 'Claimed' },
  { href: '/cases', label: 'My cases' },
  { href: '/settings', label: 'Settings' },
] as const;

export function FirmShell({
  firmName,
  email,
  children,
}: {
  firmName: string;
  email: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/marketplace' ? pathname === '/marketplace' : pathname?.startsWith(href);

  return (
    <>
      <header className="vt-top">
        <Link href={'/marketplace' as never} className="vt-brand">
          <span className="vt-seal">V</span>
          <span>
            VisaTrack<span className="vt-dotai">.AI</span>
          </span>
        </Link>
        <nav className="vt-steps" style={{ gap: 22 }}>
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href as never}
              className={isActive(n.href) ? 'active' : ''}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>
              {firmName}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{email}</div>
          </div>
          <Link href={'/api/auth/logout' as never} className="vt-btn" style={{ padding: '8px 14px', fontSize: 10 }}>
            Sign out
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
