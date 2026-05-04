import type { ReactNode } from 'react';
import { ToastProvider } from '@spinvisa/ui';
import { Sidebar } from '@/components/layout/sidebar';

export default function FirmLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="fixed inset-x-0 top-0 z-50 h-[2px] bg-gradient-to-r from-indigo-500 to-violet-500" />
      <div className="flex h-screen overflow-hidden bg-slate-50 pt-[2px] text-slate-800">
        <Sidebar />
        <main className="flex h-screen flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </ToastProvider>
  );
}
