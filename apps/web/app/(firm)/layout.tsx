import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { ToastProvider } from '@visa-track/ui';
import { getSession } from '@/lib/session';
import { store } from '@/lib/store';
import { FirmShell } from '@/components/marketplace/firm-shell';

export const metadata = { title: 'Firm Console · VisaTrack' };

export default async function FirmLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session || session.kind !== 'firm') redirect('/login?role=firm');
  const firm = await store.getFirm(session.firmId);
  if (!firm) redirect('/login?role=firm');
  return (
    <ToastProvider>
      <div className="vt-dark" style={{ minHeight: '100vh' }}>
        <FirmShell firmName={firm.displayName} email={firm.contactEmail}>
          {children}
        </FirmShell>
      </div>
    </ToastProvider>
  );
}
