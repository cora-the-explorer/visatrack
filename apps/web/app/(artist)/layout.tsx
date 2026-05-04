import type { ReactNode } from 'react';
import { ToastProvider } from '@visa-track/ui';
import { ArtistSidebar } from '@/components/layout/artist-sidebar';

export const metadata = { title: 'Artist Portal' };

export default function ArtistLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-white text-slate-900">
        <ArtistSidebar />
        <main className="flex flex-1 flex-col pt-14 pb-16 md:pt-0 md:pb-0">{children}</main>
      </div>
    </ToastProvider>
  );
}
