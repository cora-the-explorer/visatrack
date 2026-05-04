'use client';

import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  from: 'artist' | 'attorney';
  text: string;
  at: string;
}

const SEED: Message[] = [
  {
    id: 'm1',
    from: 'attorney',
    text: 'Welcome! I\'m looking forward to working on your O-1B petition. Please upload your most recent CV when you have a chance.',
    at: '2 days ago',
  },
  {
    id: 'm2',
    from: 'artist',
    text: 'Just uploaded it. Let me know if you need anything else.',
    at: '1 day ago',
  },
  {
    id: 'm3',
    from: 'attorney',
    text: 'Got it — looks great. We\'ll start drafting your petition this week.',
    at: '4 hours ago',
  },
];

export function ArtistMessages() {
  const [messages, setMessages] = useState<Message[]>(SEED);
  const [draft, setDraft] = useState('');

  const send = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: `m_${Date.now()}`, from: 'artist', text: trimmed, at: 'just now' },
    ]);
    setDraft('');
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b border-slate-100 px-8 py-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Messages</h1>
        <p className="mt-1 text-base text-slate-600">Direct line to your attorney.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={m.from === 'artist' ? 'flex justify-end' : 'flex justify-start'}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                  m.from === 'artist'
                    ? 'rounded-br-sm bg-indigo-500 text-white'
                    : 'rounded-bl-sm border border-slate-100 bg-white text-slate-800'
                }`}
              >
                <p className="text-base leading-relaxed">{m.text}</p>
                <p
                  className={`mt-1 text-xs ${
                    m.from === 'artist' ? 'text-indigo-100' : 'text-slate-400'
                  }`}
                >
                  {m.at}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={send} className="border-t border-slate-100 bg-white px-8 py-5">
        <div className="mx-auto flex max-w-3xl items-end gap-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(e as unknown as FormEvent);
              }
            }}
            rows={2}
            placeholder="Write a message…"
            className="flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-50"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
