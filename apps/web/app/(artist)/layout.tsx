import type { ReactNode } from 'react';
import { ToastProvider } from '@visa-track/ui';
import { ArtistSidebar } from '@/components/layout/artist-sidebar';

export const metadata = { title: 'Artist Portal' };

export default function ArtistLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-white text-slate-900">
        <ArtistSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </ToastProvider>
  );
}
