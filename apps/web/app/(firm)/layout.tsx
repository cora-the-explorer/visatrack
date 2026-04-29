import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { ActivityFeed } from '@/components/activity/activity-feed';

export default function FirmLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
      <ActivityFeed />
    </div>
  );
}
