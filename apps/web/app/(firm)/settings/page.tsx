import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { store } from '@/lib/store';
import { FirmSettingsForm } from '@/components/marketplace/firm-settings-form';

export const metadata = { title: 'Firm settings · VisaTrack' };

export default async function FirmSettingsPage() {
  const session = await getSession();
  if (!session || session.kind !== 'firm') redirect('/login?role=firm');
  const firm = await store.getFirm(session.firmId);
  if (!firm) redirect('/login?role=firm');

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 28px 96px' }}>
      <div className="vt-filebar">
        <span className="vt-pill">Settings</span>
        <span>Profile shown to artists on bid cards</span>
      </div>
      <h1 className="serif" style={{ fontWeight: 500, fontSize: 'clamp(32px, 4.5vw, 48px)', margin: '0 0 32px' }}>
        Firm profile
      </h1>
      <FirmSettingsForm firm={firm} />
    </div>
  );
}
