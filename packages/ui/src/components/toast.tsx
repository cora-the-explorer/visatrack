'use client';

import * as React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '../lib/cn';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  show: (toast: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);
  const idRef = React.useRef(0);

  const dismiss = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = React.useCallback(
    (toast: Omit<ToastMessage, 'id'>) => {
      idRef.current += 1;
      const id = idRef.current;
      const next: ToastMessage = { id, duration: 4500, variant: 'success', ...toast };
      setToasts((prev) => [...prev, next]);
      if (next.duration && next.duration > 0) {
        setTimeout(() => dismiss(id), next.duration);
      }
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-full max-w-sm flex-col gap-3">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const variant = toast.variant ?? 'success';
  const Icon = variant === 'error' ? AlertCircle : CheckCircle2;
  const accent =
    variant === 'success'
      ? 'border-l-green-500 text-green-600'
      : variant === 'error'
        ? 'border-l-red-500 text-red-600'
        : 'border-l-indigo-500 text-indigo-600';

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-lg border border-slate-200 border-l-4 bg-white p-4 shadow-lg',
        'animate-in slide-in-from-right-5 fade-in duration-300',
        accent,
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-800">{toast.title}</div>
        {toast.description ? (
          <div className="mt-0.5 text-xs text-slate-600">{toast.description}</div>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-slate-400 transition hover:text-slate-700"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
