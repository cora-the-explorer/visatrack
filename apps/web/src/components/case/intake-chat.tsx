'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import type { VisaType } from '@visa-track/api-types';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  FileText,
  Gavel,
  Globe2,
  Loader2,
  Newspaper,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import { cn } from '@visa-track/ui';

type ApplicantType = 'individual' | 'group';

interface ChatFormState {
  applicantType: ApplicantType;

  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  artistName: string;
  instagram: string;
  field: string;
  bio: string;
  visaType: string;
  startDate: string;
  petitioner: string;

  groupName: string;
  groupGenre: string;
  groupFormationDate: string;
  groupMemberCount: number;
  groupContactFirstName: string;
  groupContactLastName: string;
  groupContactEmail: string;
  groupContactPhone: string;
  groupInstagram: string;
  groupWebsite: string;
  groupBio: string;

  evidence: string[];
}

const INITIAL_FORM: ChatFormState = {
  applicantType: 'individual',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  artistName: '',
  instagram: '',
  field: '',
  bio: '',
  visaType: '',
  startDate: '',
  petitioner: '',
  groupName: '',
  groupGenre: '',
  groupFormationDate: '',
  groupMemberCount: 4,
  groupContactFirstName: '',
  groupContactLastName: '',
  groupContactEmail: '',
  groupContactPhone: '',
  groupInstagram: '',
  groupWebsite: '',
  groupBio: '',
  evidence: [],
};

interface Question {
  id: string;
  field: string;
  prompt: string | ((form: ChatFormState) => string);
  type: 'choice' | 'text' | 'email' | 'date';
  options?: string[];
  optional?: boolean;
  aiEval?: boolean;
  onlyFor: ApplicantType | null;
  apply: (form: ChatFormState, value: string) => ChatFormState;
}

function splitName(value: string): [string, string] {
  const trimmed = value.trim();
  const idx = trimmed.indexOf(' ');
  if (idx === -1) return [trimmed, ''];
  return [trimmed.slice(0, idx), trimmed.slice(idx + 1).trim()];
}

function extractVisaCode(option: string): string {
  const match = option.match(/(O-1[AB]|P-1B|P-3)/);
  return match?.[1] ?? option;
}

const QUESTIONS: Question[] = [
  {
    id: 'applicantType',
    field: 'applicantType',
    onlyFor: null,
    prompt: "Let's get started! Is this petition for an individual artist or a group / ensemble?",
    type: 'choice',
    options: ['Individual artist', 'Group / ensemble'],
    apply: (form, value) => ({
      ...form,
      applicantType: value.toLowerCase().startsWith('group') ? 'group' : 'individual',
    }),
  },

  {
    id: 'name',
    field: 'fullName',
    onlyFor: 'individual',
    prompt: "What's the client's full name?",
    type: 'text',
    apply: (form, value) => {
      const [first, last] = splitName(value);
      return { ...form, firstName: first, lastName: last };
    },
  },
  {
    id: 'email',
    field: 'email',
    onlyFor: 'individual',
    prompt: "What's their email address?",
    type: 'email',
    apply: (form, value) => ({ ...form, email: value.trim() }),
  },
  {
    id: 'field',
    field: 'field',
    onlyFor: 'individual',
    prompt: 'What artistic field do they work in?',
    type: 'choice',
    options: ['Music / DJ', 'Visual Arts', 'Film / TV', 'Architecture', 'Sports', 'Other'],
    apply: (form, value) => ({ ...form, field: value }),
  },
  {
    id: 'visaType-ind',
    field: 'visaType',
    onlyFor: 'individual',
    prompt: 'Which visa type are you targeting?',
    type: 'choice',
    options: [
      'O-1B – Artist / Performer',
      'P-1B – Entertainer',
      'O-1A – Science / Business',
    ],
    apply: (form, value) => ({ ...form, visaType: extractVisaCode(value) }),
  },
  {
    id: 'bio',
    field: 'bio',
    onlyFor: 'individual',
    aiEval: true,
    prompt: (form) =>
      `Tell me about ${form.firstName || 'the client'}'s career — highlights, awards, press coverage, notable venues, chart positions, or achievements that would support a ${form.visaType || 'O-1B'} petition.`,
    type: 'text',
    apply: (form, value) => ({ ...form, bio: value.trim() }),
  },
  {
    id: 'petitioner',
    field: 'petitioner',
    onlyFor: 'individual',
    prompt: "What's the name of the petitioning company?",
    type: 'text',
    apply: (form, value) => ({ ...form, petitioner: value.trim() }),
  },
  {
    id: 'instagram',
    field: 'instagram',
    onlyFor: 'individual',
    prompt: 'Instagram handle? (optional — used for automated evidence gathering)',
    type: 'text',
    optional: true,
    apply: (form, value) => ({ ...form, instagram: value.trim().replace(/^@/, '') }),
  },
  {
    id: 'startDate',
    field: 'startDate',
    onlyFor: 'individual',
    prompt: 'Target US start date? (optional)',
    type: 'date',
    optional: true,
    apply: (form, value) => ({ ...form, startDate: value }),
  },

  {
    id: 'groupName',
    field: 'groupName',
    onlyFor: 'group',
    prompt: "What's the group or act name?",
    type: 'text',
    apply: (form, value) => ({ ...form, groupName: value.trim() }),
  },
  {
    id: 'groupGenre',
    field: 'groupGenre',
    onlyFor: 'group',
    prompt: 'What genre?',
    type: 'choice',
    options: ['Music / DJ', 'Dance', 'Performance Art', 'Cultural / Folk', 'Other'],
    apply: (form, value) => ({ ...form, groupGenre: value }),
  },
  {
    id: 'groupContact',
    field: 'groupContactName',
    onlyFor: 'group',
    prompt: "What's the primary contact's full name?",
    type: 'text',
    apply: (form, value) => {
      const [first, last] = splitName(value);
      return { ...form, groupContactFirstName: first, groupContactLastName: last };
    },
  },
  {
    id: 'groupEmail',
    field: 'groupContactEmail',
    onlyFor: 'group',
    prompt: 'Primary contact email?',
    type: 'email',
    apply: (form, value) => ({ ...form, groupContactEmail: value.trim() }),
  },
  {
    id: 'visaType-grp',
    field: 'visaType',
    onlyFor: 'group',
    prompt: 'Which visa type for the group?',
    type: 'choice',
    options: [
      'P-1B – Internationally Recognized Group',
      'P-3 – Culturally Unique Program',
    ],
    apply: (form, value) => ({ ...form, visaType: extractVisaCode(value) }),
  },
  {
    id: 'groupBio',
    field: 'groupBio',
    onlyFor: 'group',
    aiEval: true,
    prompt: (form) =>
      `Tell me about ${form.groupName || 'the group'}'s career — highlights, awards, press coverage, international performances, or achievements that support a ${form.visaType || 'P-1B'} petition.`,
    type: 'text',
    apply: (form, value) => ({ ...form, groupBio: value.trim() }),
  },
  {
    id: 'groupPetitioner',
    field: 'petitioner',
    onlyFor: 'group',
    prompt: "What's the name of the petitioning company?",
    type: 'text',
    apply: (form, value) => ({ ...form, petitioner: value.trim() }),
  },
  {
    id: 'groupInstagram',
    field: 'groupInstagram',
    onlyFor: 'group',
    prompt: 'Group Instagram handle? (optional)',
    type: 'text',
    optional: true,
    apply: (form, value) => ({ ...form, groupInstagram: value.trim().replace(/^@/, '') }),
  },
  {
    id: 'groupFormation',
    field: 'groupFormationDate',
    onlyFor: 'group',
    prompt: 'Group formation date? (optional — used to verify 1-year tenure)',
    type: 'date',
    optional: true,
    apply: (form, value) => ({ ...form, groupFormationDate: value }),
  },
];

interface EvidenceItem {
  id: string;
  label: string;
  icon: typeof Award;
}

const INDIVIDUAL_EVIDENCE: EvidenceItem[] = [
  { id: 'awards', label: 'Awards / recognition', icon: Award },
  { id: 'press', label: 'Press coverage / articles', icon: Newspaper },
  { id: 'contracts', label: 'Performance contracts', icon: FileText },
  { id: 'reviews', label: 'Critical reviews', icon: Star },
  { id: 'salary', label: 'High salary evidence', icon: TrendingUp },
  { id: 'judging', label: 'Judging / panel experience', icon: Gavel },
];

const GROUP_EVIDENCE: EvidenceItem[] = [
  { id: 'intl_recognition', label: 'International recognition', icon: Award },
  { id: 'group_press', label: 'Critical reviews / press', icon: Newspaper },
  { id: 'group_contracts', label: 'Performance contracts', icon: FileText },
  { id: 'group_tenure', label: 'Sustained group relationship', icon: Users },
  { id: 'group_compensation', label: 'High compensation', icon: TrendingUp },
  { id: 'group_itinerary', label: 'Itinerary of US performances', icon: Globe2 },
];

const INDIVIDUAL_DEFAULT_EVIDENCE = ['awards', 'press', 'contracts', 'reviews'];
const GROUP_DEFAULT_EVIDENCE = [
  'intl_recognition',
  'group_press',
  'group_contracts',
  'group_tenure',
  'group_compensation',
  'group_itinerary',
];

type Phase = 'chat' | 'evidence' | 'scan';

interface ChatMsg {
  id: string;
  role: 'bot' | 'user' | 'hint';
  text: string;
}

let msgIdCounter = 0;
const newMsgId = () => `m_${Date.now()}_${msgIdCounter++}`;

function buildContextMap(form: ChatFormState): Record<string, string> {
  const out: Record<string, string> = {};
  if (form.firstName) out.firstName = form.firstName;
  if (form.lastName) out.lastName = form.lastName;
  if (form.email) out.email = form.email;
  if (form.field) out.field = form.field;
  if (form.visaType) out.visaType = form.visaType;
  if (form.groupName) out.groupName = form.groupName;
  if (form.groupGenre) out.groupGenre = form.groupGenre;
  return out;
}

function resolvePrompt(q: Question, form: ChatFormState): string {
  return typeof q.prompt === 'function' ? q.prompt(form) : q.prompt;
}

const SUPPORTED_VISA_TYPES: VisaType[] = ['O-1B', 'P-1B', 'O-2', 'P-1S'];

function normalizeVisaType(visa: string, isGroup: boolean): VisaType {
  const code = visa as VisaType;
  if (SUPPORTED_VISA_TYPES.includes(code)) return code;
  return isGroup ? 'P-1B' : 'O-1B';
}

export function IntakeChatWizard() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const createCase = trpc.cases.create.useMutation({
    onSuccess: () => utils.cases.list.invalidate(),
  });

  const [form, setForm] = useState<ChatFormState>(INITIAL_FORM);
  const [phase, setPhase] = useState<Phase>('chat');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [waitingForRetry, setWaitingForRetry] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasIntroduced = useRef(false);

  const filteredQuestions = useMemo(() => {
    if (questionIdx === 0 && !form.applicantType) {
      return QUESTIONS.filter((q) => q.onlyFor === null);
    }
    return QUESTIONS.filter(
      (q) => q.onlyFor === null || q.onlyFor === form.applicantType,
    );
  }, [form.applicantType, questionIdx]);

  const currentQuestion = filteredQuestions[questionIdx];

  useEffect(() => {
    if (hasIntroduced.current) return;
    hasIntroduced.current = true;
    const first = QUESTIONS[0];
    if (!first) return;
    setMessages([
      {
        id: newMsgId(),
        role: 'bot',
        text: "Hi! I'm Visa Track AI. I'll help you set up this case in a few minutes — just answer as we go.",
      },
      { id: newMsgId(), role: 'bot', text: resolvePrompt(first, INITIAL_FORM) },
    ]);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isTyping, phase]);

  useEffect(() => {
    if (phase === 'chat' && currentQuestion?.type !== 'choice') {
      inputRef.current?.focus();
    }
  }, [phase, questionIdx, currentQuestion]);

  const advanceQuestion = (nextForm: ChatFormState) => {
    const remainingQuestions = QUESTIONS.filter(
      (q) => q.onlyFor === null || q.onlyFor === nextForm.applicantType,
    );
    const nextIdx = questionIdx + 1;
    if (nextIdx >= remainingQuestions.length) {
      const isGroup = nextForm.applicantType === 'group';
      const defaults = isGroup ? GROUP_DEFAULT_EVIDENCE : INDIVIDUAL_DEFAULT_EVIDENCE;
      setForm((prev) => ({ ...prev, evidence: defaults }));
      setPhase('evidence');
      setMessages((prev) => [
        ...prev,
        {
          id: newMsgId(),
          role: 'bot',
          text: `Great — I've pre-selected the evidence categories typical for a ${nextForm.visaType || (isGroup ? 'P-1B' : 'O-1B')} petition. Adjust below if needed, then we'll run the AI evidence scan.`,
        },
      ]);
      return;
    }

    const next = remainingQuestions[nextIdx];
    if (!next) return;
    setQuestionIdx(nextIdx);
    setMessages((prev) => [
      ...prev,
      { id: newMsgId(), role: 'bot', text: resolvePrompt(next, nextForm) },
    ]);
  };

  const submitAnswer = async (rawValue: string, displayValue?: string) => {
    if (!currentQuestion) return;
    const trimmed = rawValue.trim();
    if (!trimmed && !currentQuestion.optional) return;

    const userText = displayValue ?? (trimmed || '(skipped)');
    setMessages((prev) => [...prev, { id: newMsgId(), role: 'user', text: userText }]);
    setInputValue('');

    const nextForm = currentQuestion.apply(form, trimmed);
    setForm(nextForm);

    if (currentQuestion.aiEval && trimmed) {
      setIsTyping(true);
      try {
        const res = await fetch('/api/intake-hint', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            field: currentQuestion.field,
            question: resolvePrompt(currentQuestion, form),
            response: trimmed,
            context: buildContextMap(nextForm),
          }),
        });
        const data = (await res.json()) as { sufficient: boolean; hint?: string };
        setIsTyping(false);

        if (!data.sufficient && data.hint) {
          setMessages((prev) => [
            ...prev,
            { id: newMsgId(), role: 'hint', text: `Tip: ${data.hint}` },
          ]);
          setWaitingForRetry(true);
          return;
        }
      } catch {
        setIsTyping(false);
      }
    }

    setWaitingForRetry(false);
    advanceQuestion(nextForm);
  };

  const onTextSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isTyping) return;
    void submitAnswer(inputValue);
  };

  const onChoice = (option: string) => {
    if (isTyping) return;
    void submitAnswer(option, option);
  };

  const onSkip = () => {
    if (isTyping || !currentQuestion?.optional) return;
    void submitAnswer('', '(skipped)');
  };

  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isTyping) return;
      void submitAnswer(inputValue);
    }
  };

  const toggleEvidence = (id: string) => {
    setForm((prev) => ({
      ...prev,
      evidence: prev.evidence.includes(id)
        ? prev.evidence.filter((e) => e !== id)
        : [...prev.evidence, id],
    }));
  };

  const startScan = () => {
    setPhase('scan');
  };

  const onScanComplete = async () => {
    const isGroup = form.applicantType === 'group';
    const displayName = isGroup
      ? form.groupName || 'New Group'
      : `${form.firstName} ${form.lastName}`.trim() || 'New Client';
    try {
      const created = await createCase.mutateAsync({
        title: displayName,
        visaType: normalizeVisaType(form.visaType, isGroup),
      });
      router.push(`/cases/${created.id}`);
    } catch {
      router.push('/pipeline');
    }
  };

  const isGroup = form.applicantType === 'group';
  const evidenceItems = isGroup ? GROUP_EVIDENCE : INDIVIDUAL_EVIDENCE;

  if (phase === 'scan') {
    return (
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-3xl p-8">
          <ScanStep form={form} onComplete={onScanComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">New case intake</h2>
              <p className="text-sm text-slate-500">
                Conversational setup with AI-assisted detail review.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {messages.map((m) => (
              <MessageBubble key={m.id} msg={m} />
            ))}
            {isTyping && <TypingIndicator />}

            {phase === 'evidence' && (
              <EvidenceCard
                items={evidenceItems}
                selected={form.evidence}
                onToggle={toggleEvidence}
                onContinue={startScan}
              />
            )}
          </div>
        </div>
      </div>

      {phase === 'chat' && currentQuestion && (
        <div className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-3xl px-6 py-4">
            {currentQuestion.type === 'choice' && currentQuestion.options ? (
              <div className="flex flex-wrap gap-2">
                {currentQuestion.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    disabled={isTyping}
                    onClick={() => onChoice(opt)}
                    className="rounded-full border border-indigo-300 bg-white px-4 py-2 text-sm font-medium text-indigo-600 transition hover:border-indigo-500 hover:bg-indigo-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <form onSubmit={onTextSubmit} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type={
                    currentQuestion.type === 'email'
                      ? 'email'
                      : currentQuestion.type === 'date'
                        ? 'date'
                        : 'text'
                  }
                  className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={onInputKey}
                  placeholder={
                    waitingForRetry
                      ? 'Add a few specific examples…'
                      : currentQuestion.optional
                        ? 'Type your answer or skip'
                        : 'Type your answer…'
                  }
                  disabled={isTyping}
                />
                {currentQuestion.optional && (
                  <button
                    type="button"
                    onClick={onSkip}
                    disabled={isTyping}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                  >
                    Skip
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isTyping || (!inputValue.trim() && !currentQuestion.optional)}
                  className="rounded-full bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMsg }) {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-indigo-500 px-4 py-2.5 text-sm text-white shadow-sm">
          {msg.text}
        </div>
      </div>
    );
  }
  if (msg.role === 'hint') {
    return (
      <div className="flex justify-start gap-2">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="max-w-[75%] rounded-2xl rounded-bl-sm border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 shadow-sm">
          {msg.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start gap-2">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="max-w-[75%] rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm">
        {msg.text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start gap-2">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function EvidenceCard({
  items,
  selected,
  onToggle,
  onContinue,
}: {
  items: EvidenceItem[];
  selected: string[];
  onToggle: (id: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="ml-9 mt-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <FileText className="h-4 w-4 text-indigo-500" />
        <h3 className="text-sm font-semibold text-slate-800">Evidence checklist</h3>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;
          const checked = selected.includes(item.id);
          return (
            <label
              key={item.id}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition',
                checked
                  ? 'border-indigo-500 bg-indigo-50/60'
                  : 'border-slate-200 bg-white hover:border-slate-300',
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(item.id)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-300"
              />
              <Icon className={cn('h-4 w-4', checked ? 'text-indigo-500' : 'text-slate-400')} />
              <span
                className={cn(
                  'text-sm font-medium',
                  checked ? 'text-slate-800' : 'text-slate-700',
                )}
              >
                {item.label}
              </span>
            </label>
          );
        })}
      </div>
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          className="flex items-center gap-2 rounded-md bg-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
        >
          <Sparkles className="h-4 w-4" />
          Continue to AI Scan
        </button>
      </div>
    </div>
  );
}

interface ScanFormState {
  applicantType: ApplicantType;
  instagram: string;
  groupInstagram: string;
  groupName: string;
  groupMemberCount: number;
  visaType: string;
}

interface ScanStepData {
  pending: string;
  done: string;
  warning?: boolean;
}

function buildIndividualScanSteps(form: ScanFormState): ScanStepData[] {
  const handle = form.instagram || 'client';
  return [
    {
      pending: `Connecting to Instagram @${handle}…`,
      done: 'Found 847 posts, 23 venue tags, 12.4K followers',
    },
    {
      pending: 'Scanning performance history…',
      done: 'Identified 34 venue appearances across 8 states',
    },
    { pending: 'Searching for promotional materials…', done: '14 flyers and posters located' },
    {
      pending: 'Running press scan…',
      done: '8 press mentions found (Resident Advisor, DJ Mag, Billboard)',
    },
    { pending: 'Analyzing contract history…', done: '6 booking contracts identified' },
    {
      pending: 'Packaging evidence into exhibits…',
      done: 'Exhibit A–F compiled (47 documents total)',
    },
  ];
}

function buildGroupScanSteps(form: ScanFormState): ScanStepData[] {
  const handle =
    form.groupInstagram || form.groupName.replace(/\s+/g, '').toLowerCase() || 'group';
  const total = form.groupMemberCount || 4;
  const qualifying = Math.round(total * 0.84);
  const percent = Math.round((qualifying / total) * 100);
  const meets75 = percent >= 75;

  const tenureDone = meets75
    ? `${qualifying} of ${total} members meet 1-year requirement (${percent}%) ✓ Meets 75% threshold`
    : `Warning: Only ${percent}% of members meet tenure requirement. Attorney review recommended.`;

  return [
    {
      pending: `Scanning @${handle} Instagram…`,
      done: 'Found 2,847 posts · 84.3K followers · 47 tagged venues',
    },
    { pending: 'Verifying group member tenure…', done: tenureDone, warning: !meets75 },
    {
      pending: 'Scanning performance history…',
      done: 'Identified 67 group bookings across 14 countries',
    },
    {
      pending: 'Searching for promotional materials…',
      done: '23 tour flyers, 8 festival posters located',
    },
    {
      pending: 'Running press scan…',
      done: '14 press mentions found (Resident Advisor, Billboard, Rolling Stone)',
    },
    {
      pending: 'Analyzing booking contracts…',
      done: '11 group contracts verified, avg fee $42,500',
    },
    {
      pending: 'Checking international recognition…',
      done: 'Festival headlining confirmed: 3 international festivals',
    },
    {
      pending: 'Packaging P-1B evidence into exhibits…',
      done: 'Exhibit A–G compiled (63 documents total)',
    },
  ];
}

function ScanStep({
  form,
  onComplete,
}: {
  form: ChatFormState;
  onComplete: () => void;
}) {
  const isGroup = form.applicantType === 'group';
  const scanForm: ScanFormState = {
    applicantType: form.applicantType,
    instagram: form.instagram,
    groupInstagram: form.groupInstagram,
    groupName: form.groupName,
    groupMemberCount: form.groupMemberCount,
    visaType: form.visaType,
  };

  const steps = useMemo(
    () => (isGroup ? buildGroupScanSteps(scanForm) : buildIndividualScanSteps(scanForm)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isGroup],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [done, setDone] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timersRef.current = [];
    steps.forEach((_, i) => {
      const t = setTimeout(() => setActiveIndex(i + 1), 800 * (i + 1));
      timersRef.current.push(t);
    });
    const finish = setTimeout(() => setDone(true), 800 * (steps.length + 1));
    timersRef.current.push(finish);
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [steps]);

  const total = steps.length;
  const progressPct = Math.round((Math.min(activeIndex, total) / total) * 100);

  const summary = isGroup
    ? '63 documents organized into Exhibits A–G. AI P-1B petition draft ready for attorney review.'
    : '47 documents organized into Exhibits A–F. AI petition draft ready for attorney review.';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">AI evidence gathering</h2>
          <p className="text-sm text-slate-500">
            Visa Track AI is collecting and packaging evidence in real time.
          </p>
        </div>
      </div>

      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <ol className="space-y-3">
        {steps.map((s, i) => {
          const status: 'pending' | 'in_progress' | 'done' =
            i < activeIndex ? 'done' : i === activeIndex ? 'in_progress' : 'pending';
          return <ScanRow key={i} step={s} status={status} />;
        })}
      </ol>

      {done && (
        <div className="mt-6 flex flex-col items-center gap-4 rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <div className="text-base font-semibold text-green-800">
              Evidence gathered. Generating petition draft…
            </div>
            <p className="mt-1 text-sm text-green-700">{summary}</p>
          </div>
          <button
            type="button"
            onClick={onComplete}
            className="mt-2 flex items-center gap-2 rounded-md bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
          >
            View AI Draft
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function ScanRow({
  step,
  status,
}: {
  step: ScanStepData;
  status: 'pending' | 'in_progress' | 'done';
}) {
  const isWarningDone = status === 'done' && step.warning;
  return (
    <li
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3.5 transition',
        status === 'pending' && 'border-slate-200 bg-slate-50/60 opacity-60',
        status === 'in_progress' && 'border-indigo-200 bg-indigo-50/60',
        status === 'done' && !step.warning && 'border-green-200 bg-green-50/40',
        isWarningDone && 'border-amber-300 bg-amber-50/60',
      )}
    >
      <div className="mt-0.5 h-5 w-5 shrink-0">
        {status === 'done' && !step.warning && (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        )}
        {isWarningDone && <AlertTriangle className="h-5 w-5 text-amber-500" />}
        {status === 'in_progress' && (
          <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
        )}
        {status === 'pending' && (
          <div className="h-5 w-5 rounded-full border-2 border-slate-200" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'text-sm font-medium',
            status === 'done' && !step.warning && 'text-slate-700',
            isWarningDone && 'text-amber-800',
            status === 'in_progress' && 'text-indigo-700',
            status === 'pending' && 'text-slate-500',
          )}
        >
          {status === 'done' ? step.done : step.pending}
        </div>
      </div>
    </li>
  );
}
