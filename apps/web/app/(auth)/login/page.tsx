'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const signIn = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setSubmitting(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('spinvisa_authed', '1');
    }
    setTimeout(() => router.push('/pipeline'), 280);
  };

  return (
    <div
      className="relative grid min-h-screen place-items-center overflow-hidden bg-[#0f172a] p-6 text-slate-100"
      style={{
        backgroundImage:
          'linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0f172a]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2.5 text-3xl font-bold text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-lg font-black text-white shadow-lg shadow-indigo-500/30">
              S
            </span>
            SpinVisa
          </div>
          <p className="text-sm text-slate-400">
            AI-powered immigration for extraordinary talent
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur">
          <h1 className="text-xl font-semibold text-white">Sign in</h1>
          <p className="mt-1 text-sm text-slate-400">
            Welcome back. Sign in to continue to your firm dashboard.
          </p>

          <form onSubmit={signIn} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@firm.com"
                className="block w-full rounded-md border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-md border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-md bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-600 disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs uppercase tracking-wider text-slate-500">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            onClick={() => signIn()}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-60"
          >
            <GoogleIcon />
            Sign in with Google
          </button>

          <p className="mt-6 text-center text-xs text-slate-500">Secured by WorkOS</p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.5-5.5c-2 1.4-4.6 2.3-7.5 2.3-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.5 5.5c-.5.4 7-5.1 7-15.2 0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
