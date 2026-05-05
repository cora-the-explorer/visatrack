import type { ReactNode } from 'react';

export const metadata = { title: 'VisaTrack — O-1B for artists, creators & DJs' };

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <div className="vt-dark">{children}</div>;
}
