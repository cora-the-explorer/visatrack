import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { ToastProvider } from '@visa-track/ui';
import { getSession } from '@/lib/session';
import { ArtistShell } from '@/components/marketplace/artist-shell';

export const metadata = { title: 'Artist Portal · VisaTrack' };

export default async function ArtistLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session || session.kind !== 'artist') redirect('/login?role=artist');
  return (
    <ToastProvider>
      <div className="vt-dark" style={{ minHeight: '100vh' }}>
        <ArtistShell email={session.email}>{children}</ArtistShell>
      </div>
    </ToastProvider>
  );
}
