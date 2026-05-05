'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import './theme.css';

const NAV = [
  { href: '/portal', label: 'My Case' },
  { href: '/portal/firm', label: 'Firm' },
  { href: '/portal/dossier', label: 'Dossier' },
] as const;

export function ArtistShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/portal' ? pathname === '/portal' : pathname?.startsWith(href);

  return (
    <>
      <header className="vt-top">
        <Link href={'/portal' as never} className="vt-brand">
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
          <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            {email}
          </span>
          <Link href={'/api/auth/logout' as never} className="vt-btn" style={{ padding: '8px 14px', fontSize: 10 }}>
            Sign out
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
