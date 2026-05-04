'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import type { VisaType as ApiVisaType } from '@spinvisa/api-types';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  Check,
  CheckCircle2,
  FileText,
  Gavel,
  Globe2,
  Info,
  Loader2,
  Newspaper,
  Plus,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@spinvisa/ui';

type ApplicantType = 'individual' | 'group';
type VisaType = 'O-1B' | 'P-1B' | 'O-1A' | 'P-3';

const INDIVIDUAL_FIELD_OPTIONS = [
  'Music / DJ',
  'Visual Arts',
  'Film / TV',
  'Architecture',
  'Sports',
  'Other',
] as const;

const GROUP_GENRE_OPTIONS = [
  'Music / DJ',
  'Dance',
  'Performance Art',
  'Cultural / Folk',
  'Other',
] as const;

type IndividualField = (typeof INDIVIDUAL_FIELD_OPTIONS)[number];
type GroupGenre = (typeof GROUP_GENRE_OPTIONS)[number];

interface VisaOption {
  value: VisaType;
  label: string;
  description: string;
  recommended?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

const INDIVIDUAL_VISA_OPTIONS: VisaOption[] = [
  { value: 'O-1B', label: 'O-1B', description: 'Artist / Performer' },
  { value: 'P-1B', label: 'P-1B', description: 'Entertainer' },
  { value: 'O-1A', label: 'O-1A', description: 'Science / Business' },
];

const GROUP_VISA_OPTIONS: VisaOption[] = [
  {
    value: 'P-1B',
    label: 'P-1B',
    description: 'Internationally Recognized Entertainment Group',
    recommended: true,
  },
  { value: 'P-3', label: 'P-3', description: 'Culturally Unique Program' },
  {
    value: 'O-1B',
    label: 'O-1B',
    description: 'Artist / Performer',
    disabled: true,
    disabledReason: 'O-1B is for individuals only. Each member must file separately.',
  },
];

interface EvidenceItem {
  id: string;
  label: string;
  icon: typeof Award;
}

const INDIVIDUAL_EVIDENCE_ITEMS: EvidenceItem[] = [
  { id: 'awards', label: 'Awards / recognition', icon: Award },
  { id: 'press', label: 'Press coverage / articles', icon: Newspaper },
  { id: 'contracts', label: 'Performance contracts', icon: FileText },
  { id: 'reviews', label: 'Critical reviews', icon: Star },
  { id: 'salary', label: 'High salary evidence', icon: TrendingUp },
  { id: 'judging', label: 'Judging / panel experience', icon: Gavel },
];

const GROUP_EVIDENCE_ITEMS: EvidenceItem[] = [
  { id: 'intl_recognition', label: 'International recognition (awards, charts, headlining)', icon: Award },
  { id: 'group_press', label: 'Critical reviews / press (group acclaim)', icon: Newspaper },
  { id: 'group_contracts', label: 'Performance contracts (group name on contract)', icon: FileText },
  { id: 'group_tenure', label: 'Sustained group relationship (tenure proof)', icon: Users },
  { id: 'group_compensation', label: 'High compensation (group booking fees)', icon: TrendingUp },
  { id: 'group_itinerary', label: 'Itinerary of US performances', icon: Globe2 },
  { id: 'support_personnel', label: 'Support personnel list (O-2 co-petition)', icon: User },
];

const INDIVIDUAL_DEFAULT_EVIDENCE: Record<VisaType, string[]> = {
  'O-1B': ['awards', 'press', 'contracts', 'reviews'],
  'P-1B': ['press', 'contracts', 'reviews'],
  'O-1A': ['awards', 'press', 'salary', 'judging'],
  'P-3': ['press', 'contracts', 'reviews'],
};

const GROUP_DEFAULT_EVIDENCE: Record<VisaType, string[]> = {
  'P-1B': [
    'intl_recognition',
    'group_press',
    'group_contracts',
    'group_tenure',
    'group_compensation',
    'group_itinerary',
  ],
  'P-3': ['group_press', 'group_contracts', 'group_tenure', 'group_itinerary'],
  'O-1B': [],
  'O-1A': [],
};

interface GroupMember {
  id: string;
  name: string;
  role: string;
  yearsWithGroup: number;
}

interface FormState {
  applicantType: ApplicantType;

  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  artistName: string;
  instagram: string;

  groupName: string;
  groupGenre: GroupGenre;
  groupFormationDate: string;
  groupMemberCount: number;
  groupContactFirstName: string;
  groupContactLastName: string;
  groupContactEmail: string;
  groupContactPhone: string;
  groupInstagram: string;
  groupWebsite: string;
  groupMembers: GroupMember[];

  visaType: VisaType;
  field: IndividualField;
  startDate: string;
  petitioner: string;

  tourStartDate: string;
  tourEndDate: string;
  plannedPerformances: number;

  evidence: string[];
}

const INITIAL_STATE: FormState = {
  applicantType: 'individual',

  firstName: 'New',
  lastName: 'Client',
  email: 'client@example.com',
  phone: '',
  country: '',
  artistName: '',
  instagram: '',

  groupName: '',
  groupGenre: 'Music / DJ',
  groupFormationDate: '',
  groupMemberCount: 4,
  groupContactFirstName: '',
  groupContactLastName: '',
  groupContactEmail: '',
  groupContactPhone: '',
  groupInstagram: '',
  groupWebsite: '',
  groupMembers: [],

  visaType: 'O-1B',
  field: 'Music / DJ',
  startDate: '',
  petitioner: '',

  tourStartDate: '',
  tourEndDate: '',
  plannedPerformances: 0,

  evidence: INDIVIDUAL_DEFAULT_EVIDENCE['O-1B'],
};

const STEPS = [
  { id: 1, title: 'Client Info' },
  { id: 2, title: 'Visa & Role' },
  { id: 3, title: 'Evidence' },
  { id: 4, title: 'AI Scan' },
] as const;

interface TenureStats {
  total: number;
  qualifying: number;
  percent: number;
  meets75: boolean;
}

function computeTenure(members: GroupMember[]): TenureStats {
  const total = members.length;
  const qualifying = members.filter((m) => m.yearsWithGroup >= 1).length;
  const percent = total === 0 ? 0 : Math.round((qualifying / total) * 100);
  return { total, qualifying, percent, meets75: total > 0 && percent >= 75 };
}

let memberIdCounter = 0;
const newMemberId = () => `m_${Date.now()}_${memberIdCounter++}`;

function toApiVisa(v: VisaType): ApiVisaType {
  if (v === 'O-1B' || v === 'P-1B') return v;
  return 'O-1B';
}

export function NewCaseWizard() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const createCase = trpc.cases.create.useMutation({
    onSuccess: () => utils.cases.list.invalidate(),
  });
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setApplicantType = (type: ApplicantType) => {
    setForm((prev) => {
      if (prev.applicantType === type) return prev;
      const nextVisa: VisaType = type === 'group' ? 'P-1B' : 'O-1B';
      const nextEvidence =
        type === 'group'
          ? GROUP_DEFAULT_EVIDENCE[nextVisa]
          : INDIVIDUAL_DEFAULT_EVIDENCE[nextVisa];
      return {
        ...prev,
        applicantType: type,
        visaType: nextVisa,
        evidence: nextEvidence,
      };
    });
  };

  const onVisaChange = (visa: VisaType) => {
    setForm((prev) => {
      const evidence =
        prev.applicantType === 'group'
          ? GROUP_DEFAULT_EVIDENCE[visa]
          : INDIVIDUAL_DEFAULT_EVIDENCE[visa];
      return { ...prev, visaType: visa, evidence };
    });
  };

  const toggleEvidence = (id: string) => {
    setForm((prev) => ({
      ...prev,
      evidence: prev.evidence.includes(id)
        ? prev.evidence.filter((e) => e !== id)
        : [...prev.evidence, id],
    }));
  };

  const addGroupMember = () => {
    setForm((prev) => ({
      ...prev,
      groupMembers: [
        ...prev.groupMembers,
        { id: newMemberId(), name: '', role: '', yearsWithGroup: 0 },
      ],
    }));
  };

  const updateGroupMember = (id: string, patch: Partial<Omit<GroupMember, 'id'>>) => {
    setForm((prev) => ({
      ...prev,
      groupMembers: prev.groupMembers.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  };

  const removeGroupMember = (id: string) => {
    setForm((prev) => ({
      ...prev,
      groupMembers: prev.groupMembers.filter((m) => m.id !== id),
    }));
  };

  const isGroup = form.applicantType === 'group';
  const canContinueStep1 = isGroup
    ? !!(form.groupName && form.groupContactFirstName && form.groupContactLastName && form.groupContactEmail)
    : !!(form.firstName && form.lastName && form.email);
  const canContinueStep2 = isGroup
    ? !!(form.visaType && form.petitioner)
    : !!(form.visaType && form.field && form.petitioner);

  return (
    <div className="h-full overflow-y-auto">
    <div className="mx-auto max-w-4xl p-8">
      <Stepper current={step} />

      <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        {step === 1 && (
          <StepClientInfo
            form={form}
            update={update}
            setApplicantType={setApplicantType}
            addGroupMember={addGroupMember}
            updateGroupMember={updateGroupMember}
            removeGroupMember={removeGroupMember}
          />
        )}
        {step === 2 && (
          <StepVisaRole form={form} update={update} onVisaChange={onVisaChange} />
        )}
        {step === 3 && <StepEvidence form={form} toggleEvidence={toggleEvidence} />}
        {step === 4 && (
          <StepEvidenceScan
            form={form}
            onComplete={async () => {
              const isGroup = form.applicantType === 'group';
              const name = isGroup
                ? form.groupName || 'New Group'
                : `${form.firstName} ${form.lastName}`.trim() || 'New Client';
              try {
                const created = await createCase.mutateAsync({
                  title: name,
                  visaType: toApiVisa(form.visaType),
                  targetFilingDate: form.startDate
                    ? new Date(form.startDate).toISOString()
                    : undefined,
                });
                router.push(`/cases/${created.id}`);
              } catch {
                router.push('/pipeline');
              }
            }}
          />
        )}

        {step !== 4 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-8 py-4">
            <button
              type="button"
              onClick={() =>
                step > 1 ? setStep((s) => (s - 1) as 1 | 2 | 3) : router.push('/pipeline')
              }
              className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as 2 | 3 | 4)}
              className="flex items-center gap-2 rounded-md bg-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {step === 3 ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Continue to AI Evidence Scan
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-3">
      {STEPS.map((s, i) => {
        const done = current > s.id;
        const active = current === s.id;
        return (
          <li key={s.id} className="flex flex-1 items-center gap-3">
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition',
                done
                  ? 'bg-indigo-500 text-white'
                  : active
                    ? 'bg-indigo-500 text-white ring-4 ring-indigo-100'
                    : 'bg-slate-200 text-slate-500',
              )}
            >
              {done ? <Check className="h-4 w-4" /> : s.id}
            </div>
            <span
              className={cn(
                'text-sm font-medium',
                active ? 'text-slate-800' : done ? 'text-slate-700' : 'text-slate-400',
              )}
            >
              {s.title}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-2 h-px flex-1 transition',
                  done ? 'bg-indigo-500' : 'bg-slate-200',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500"
      >
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100';

function ApplicantTypeToggle({
  value,
  onChange,
}: {
  value: ApplicantType;
  onChange: (type: ApplicantType) => void;
}) {
  const options: { value: ApplicantType; label: string; description: string; icon: typeof User }[] = [
    {
      value: 'individual',
      label: 'Individual Artist',
      description: 'Solo performer, one petition',
      icon: User,
    },
    {
      value: 'group',
      label: 'Group / Duo / Ensemble',
      description: 'Band, DJ duo, dance troupe',
      icon: Users,
    },
  ];
  return (
    <div className="mb-6">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        Applicant type
      </label>
      <div className="grid grid-cols-2 gap-3">
        {options.map((o) => {
          const active = value === o.value;
          const Icon = o.icon;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-4 text-left transition',
                active
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100'
                  : 'border-slate-200 bg-white hover:border-slate-300',
              )}
            >
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
                  active ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500',
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div
                  className={cn(
                    'text-sm font-semibold',
                    active ? 'text-indigo-700' : 'text-slate-800',
                  )}
                >
                  {o.label}
                </div>
                <div className="mt-0.5 text-xs text-slate-500">{o.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepClientInfo({
  form,
  update,
  setApplicantType,
  addGroupMember,
  updateGroupMember,
  removeGroupMember,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  setApplicantType: (type: ApplicantType) => void;
  addGroupMember: () => void;
  updateGroupMember: (id: string, patch: Partial<Omit<GroupMember, 'id'>>) => void;
  removeGroupMember: (id: string) => void;
}) {
  const isGroup = form.applicantType === 'group';

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
          {isGroup ? <Users className="h-5 w-5" /> : <User className="h-5 w-5" />}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            {isGroup ? 'Group information' : 'Client information'}
          </h2>
          <p className="text-sm text-slate-500">
            {isGroup
              ? 'Tell us about the group and its members.'
              : 'Who are we filing this petition for?'}
          </p>
        </div>
      </div>

      <ApplicantTypeToggle value={form.applicantType} onChange={setApplicantType} />

      {isGroup ? (
        <GroupClientFields
          form={form}
          update={update}
          addGroupMember={addGroupMember}
          updateGroupMember={updateGroupMember}
          removeGroupMember={removeGroupMember}
        />
      ) : (
        <IndividualClientFields form={form} update={update} />
      )}
    </div>
  );
}

function IndividualClientFields({
  form,
  update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-5">
      <Field label="First name" htmlFor="firstName" required>
        <input
          id="firstName"
          className={inputClass}
          value={form.firstName}
          onChange={(e) => update('firstName', e.target.value)}
          placeholder="Elena"
        />
      </Field>
      <Field label="Last name" htmlFor="lastName" required>
        <input
          id="lastName"
          className={inputClass}
          value={form.lastName}
          onChange={(e) => update('lastName', e.target.value)}
          placeholder="Rodriguez"
        />
      </Field>
      <Field label="Email" htmlFor="email" required>
        <input
          id="email"
          type="email"
          className={inputClass}
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="elena@example.com"
        />
      </Field>
      <Field label="Phone" htmlFor="phone">
        <input
          id="phone"
          className={inputClass}
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
          placeholder="+1 (555) 123-4567"
        />
      </Field>
      <Field label="Country of birth" htmlFor="country">
        <input
          id="country"
          className={inputClass}
          value={form.country}
          onChange={(e) => update('country', e.target.value)}
          placeholder="Spain"
        />
      </Field>
      <Field label="Artist / stage name" htmlFor="artistName">
        <input
          id="artistName"
          className={inputClass}
          value={form.artistName}
          onChange={(e) => update('artistName', e.target.value)}
          placeholder="ELENA R."
        />
      </Field>
      <div className="col-span-2">
        <Field label="Instagram handle" htmlFor="instagram">
          <div className="flex items-center rounded-md border border-slate-200 bg-white shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
            <span className="px-3 text-sm font-medium text-slate-400">@</span>
            <input
              id="instagram"
              className="flex-1 border-0 bg-transparent py-2 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              value={form.instagram}
              onChange={(e) => update('instagram', e.target.value.replace(/^@/, ''))}
              placeholder="elenarodriguez"
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            Used by SpinVisa AI to gather evidence automatically.
          </p>
        </Field>
      </div>
    </div>
  );
}

function GroupClientFields({
  form,
  update,
  addGroupMember,
  updateGroupMember,
  removeGroupMember,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  addGroupMember: () => void;
  updateGroupMember: (id: string, patch: Partial<Omit<GroupMember, 'id'>>) => void;
  removeGroupMember: (id: string) => void;
}) {
  const tenure = computeTenure(form.groupMembers);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-5">
        <Field label="Group / act name" htmlFor="groupName" required>
          <input
            id="groupName"
            className={inputClass}
            value={form.groupName}
            onChange={(e) => update('groupName', e.target.value)}
            placeholder="The Midnight Pulse"
          />
        </Field>
        <Field label="Genre" htmlFor="groupGenre" required>
          <select
            id="groupGenre"
            className={inputClass}
            value={form.groupGenre}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              update('groupGenre', e.target.value as GroupGenre)
            }
          >
            {GROUP_GENRE_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Group formation date" htmlFor="groupFormationDate">
          <input
            id="groupFormationDate"
            type="date"
            className={inputClass}
            value={form.groupFormationDate}
            onChange={(e) => update('groupFormationDate', e.target.value)}
          />
          <p className="mt-1.5 text-xs text-slate-500">
            Used to verify the 1-year tenure threshold.
          </p>
        </Field>
        <Field label="Number of members" htmlFor="groupMemberCount">
          <input
            id="groupMemberCount"
            type="number"
            min={2}
            max={50}
            className={inputClass}
            value={form.groupMemberCount}
            onChange={(e) => {
              const n = Number(e.target.value);
              const clamped = Number.isFinite(n) ? Math.max(2, Math.min(50, Math.trunc(n))) : 2;
              update('groupMemberCount', clamped);
            }}
          />
        </Field>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Primary contact
        </h3>
        <div className="grid grid-cols-2 gap-5">
          <Field label="First name" htmlFor="groupContactFirstName" required>
            <input
              id="groupContactFirstName"
              className={inputClass}
              value={form.groupContactFirstName}
              onChange={(e) => update('groupContactFirstName', e.target.value)}
              placeholder="Marco"
            />
          </Field>
          <Field label="Last name" htmlFor="groupContactLastName" required>
            <input
              id="groupContactLastName"
              className={inputClass}
              value={form.groupContactLastName}
              onChange={(e) => update('groupContactLastName', e.target.value)}
              placeholder="Silva"
            />
          </Field>
          <Field label="Email" htmlFor="groupContactEmail" required>
            <input
              id="groupContactEmail"
              type="email"
              className={inputClass}
              value={form.groupContactEmail}
              onChange={(e) => update('groupContactEmail', e.target.value)}
              placeholder="manager@midnightpulse.com"
            />
          </Field>
          <Field label="Phone" htmlFor="groupContactPhone">
            <input
              id="groupContactPhone"
              className={inputClass}
              value={form.groupContactPhone}
              onChange={(e) => update('groupContactPhone', e.target.value)}
              placeholder="+1 (555) 234-5678"
            />
          </Field>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Field label="Group Instagram handle" htmlFor="groupInstagram">
          <div className="flex items-center rounded-md border border-slate-200 bg-white shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
            <span className="px-3 text-sm font-medium text-slate-400">@</span>
            <input
              id="groupInstagram"
              className="flex-1 border-0 bg-transparent py-2 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              value={form.groupInstagram}
              onChange={(e) => update('groupInstagram', e.target.value.replace(/^@/, ''))}
              placeholder="midnightpulse"
            />
          </div>
        </Field>
        <Field label="Group website" htmlFor="groupWebsite">
          <input
            id="groupWebsite"
            type="url"
            className={inputClass}
            value={form.groupWebsite}
            onChange={(e) => update('groupWebsite', e.target.value)}
            placeholder="https://midnightpulse.com"
          />
        </Field>
      </div>

      <MemberRoster
        members={form.groupMembers}
        tenure={tenure}
        onAdd={addGroupMember}
        onUpdate={updateGroupMember}
        onRemove={removeGroupMember}
      />
    </div>
  );
}

function MemberRoster({
  members,
  tenure,
  onAdd,
  onUpdate,
  onRemove,
}: {
  members: GroupMember[];
  tenure: TenureStats;
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<Omit<GroupMember, 'id'>>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Member roster
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Add each member's tenure to verify the USCIS 75% / 1-year rule.
          </p>
        </div>
        {tenure.total > 0 && (
          <div
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-semibold',
              tenure.meets75
                ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
            )}
          >
            {tenure.qualifying} of {tenure.total} members meet 1-year requirement (
            {tenure.percent}%)
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <div className="grid grid-cols-[2fr_2fr_1.2fr_auto] items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <span>Member name</span>
          <span>Role</span>
          <span>Years with group</span>
          <span className="w-7" />
        </div>
        {members.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-slate-500">
            No members added yet. Click <span className="font-medium text-slate-700">Add Row</span> to start.
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {members.map((m) => {
              const meets = m.yearsWithGroup >= 1;
              return (
                <li
                  key={m.id}
                  className="grid grid-cols-[2fr_2fr_1.2fr_auto] items-center gap-3 px-4 py-2.5"
                >
                  <div>
                    <input
                      className={inputClass}
                      value={m.name}
                      onChange={(e) => onUpdate(m.id, { name: e.target.value })}
                      placeholder="Marco Silva"
                    />
                    {!meets && m.name && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">
                        <AlertTriangle className="h-3 w-3" />
                        Does not meet 75% rule
                      </span>
                    )}
                  </div>
                  <input
                    className={inputClass}
                    value={m.role}
                    onChange={(e) => onUpdate(m.id, { role: e.target.value })}
                    placeholder="Lead vocals"
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    className={inputClass}
                    value={m.yearsWithGroup}
                    onChange={(e) =>
                      onUpdate(m.id, {
                        yearsWithGroup: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => onRemove(m.id)}
                    className="flex h-8 w-7 items-center justify-center rounded text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                    aria-label="Remove member"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-2.5">
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
          >
            <Plus className="h-4 w-4" />
            Add Row
          </button>
        </div>
      </div>
    </div>
  );
}

function StepVisaRole({
  form,
  update,
  onVisaChange,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onVisaChange: (visa: VisaType) => void;
}) {
  const isGroup = form.applicantType === 'group';
  const visaOptions = isGroup ? GROUP_VISA_OPTIONS : INDIVIDUAL_VISA_OPTIONS;
  const [showP1bInfo, setShowP1bInfo] = useState(false);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
          <Briefcase className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Visa & role</h2>
          <p className="text-sm text-slate-500">
            {isGroup ? 'Pick the right group classification.' : 'Pick the right classification.'}
          </p>
        </div>
      </div>

      <Field label="Visa type" htmlFor="visa" required>
        <div id="visa" className="grid grid-cols-3 gap-3">
          {visaOptions.map((v) => (
            <VisaCard
              key={v.value}
              option={v}
              active={form.visaType === v.value}
              onSelect={() => !v.disabled && onVisaChange(v.value)}
              onInfo={isGroup && v.value === 'P-1B' ? () => setShowP1bInfo(true) : undefined}
            />
          ))}
        </div>
      </Field>

      {isGroup ? (
        <GroupVisaFields form={form} update={update} />
      ) : (
        <IndividualVisaFields form={form} update={update} />
      )}

      {showP1bInfo && <P1bInfoModal onClose={() => setShowP1bInfo(false)} />}
    </div>
  );
}

function VisaCard({
  option,
  active,
  onSelect,
  onInfo,
}: {
  option: VisaOption;
  active: boolean;
  onSelect: () => void;
  onInfo?: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        disabled={option.disabled}
        onClick={onSelect}
        title={option.disabled ? option.disabledReason : undefined}
        className={cn(
          'w-full rounded-lg border p-4 text-left transition',
          option.disabled && 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-60',
          !option.disabled && active
            ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100'
            : !option.disabled && 'border-slate-200 bg-white hover:border-slate-300',
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div
            className={cn(
              'text-base font-semibold',
              !option.disabled && active ? 'text-indigo-600' : 'text-slate-800',
              option.disabled && 'text-slate-500',
            )}
          >
            {option.label}
          </div>
          {onInfo && !option.disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onInfo();
              }}
              className="rounded-full p-0.5 text-slate-400 transition hover:bg-indigo-100 hover:text-indigo-600"
              aria-label="P-1B group info"
            >
              <Info className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mt-0.5 text-xs text-slate-500">{option.description}</div>
        {option.recommended && (
          <span className="mt-2 inline-flex rounded bg-indigo-500 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Recommended for groups
          </span>
        )}
        {option.disabled && option.disabledReason && (
          <p className="mt-2 text-[11px] leading-snug text-slate-500">{option.disabledReason}</p>
        )}
      </button>
    </div>
  );
}

function IndividualVisaFields({
  form,
  update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-5">
      <Field label="Primary field" htmlFor="field" required>
        <select
          id="field"
          className={inputClass}
          value={form.field}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            update('field', e.target.value as IndividualField)
          }
        >
          {INDIVIDUAL_FIELD_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Target start date" htmlFor="startDate">
        <input
          id="startDate"
          type="date"
          className={inputClass}
          value={form.startDate}
          onChange={(e) => update('startDate', e.target.value)}
        />
      </Field>
      <div className="col-span-2">
        <Field label="Petitioner company" htmlFor="petitioner" required>
          <input
            id="petitioner"
            className={inputClass}
            value={form.petitioner}
            onChange={(e) => update('petitioner', e.target.value)}
            placeholder="Atlas Talent Group, LLC"
          />
        </Field>
      </div>
    </div>
  );
}

function GroupVisaFields({
  form,
  update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <div className="mt-6 space-y-5">
      <Field label="Petitioner company" htmlFor="petitioner" required>
        <input
          id="petitioner"
          className={inputClass}
          value={form.petitioner}
          onChange={(e) => update('petitioner', e.target.value)}
          placeholder="Atlas Talent Group, LLC"
        />
      </Field>
      <div className="grid grid-cols-2 gap-5">
        <Field label="Target US start date" htmlFor="startDate">
          <input
            id="startDate"
            type="date"
            className={inputClass}
            value={form.startDate}
            onChange={(e) => update('startDate', e.target.value)}
          />
        </Field>
        <Field label="Number of planned US performances" htmlFor="plannedPerformances">
          <input
            id="plannedPerformances"
            type="number"
            min={0}
            className={inputClass}
            value={form.plannedPerformances}
            onChange={(e) =>
              update('plannedPerformances', Math.max(0, Number(e.target.value) || 0))
            }
            placeholder="12"
          />
        </Field>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Tour / performance dates
        </label>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <input
              id="tourStartDate"
              type="date"
              aria-label="Tour start date"
              className={inputClass}
              value={form.tourStartDate}
              onChange={(e) => update('tourStartDate', e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-500">Start</p>
          </div>
          <div>
            <input
              id="tourEndDate"
              type="date"
              aria-label="Tour end date"
              className={inputClass}
              value={form.tourEndDate}
              onChange={(e) => update('tourEndDate', e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-500">End</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function P1bInfoModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">P-1B for groups</h3>
              <p className="text-xs text-slate-500">
                Internationally recognized entertainment groups
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 p-5 text-sm text-slate-700">
          <section>
            <h4 className="mb-1 font-semibold text-slate-800">What counts as "internationally recognized"</h4>
            <p className="text-slate-600">
              The group must have a high level of achievement evidenced by a degree of skill and recognition substantially above that ordinarily encountered — recognized in more than one country.
            </p>
          </section>
          <section>
            <h4 className="mb-1 font-semibold text-slate-800">The 75% / 1-year rule</h4>
            <p className="text-slate-600">
              Per <span className="font-mono text-xs">8 CFR 214.2(p)(4)</span>, at least 75% of the group's members must have had a sustained and substantial relationship with the group for at least 1 year. SpinVisa verifies this from member tenure on Step 1.
            </p>
          </section>
          <section>
            <h4 className="mb-1 font-semibold text-slate-800">Evidence needed</h4>
            <ul className="list-disc space-y-1 pl-5 text-slate-600">
              <li>International awards, chart positions, or festival headlining</li>
              <li>Critical reviews and press (group-level acclaim)</li>
              <li>Contracts naming the group</li>
              <li>Proof of sustained group relationship (tenure affidavits, band agreements)</li>
              <li>High group compensation (booking fees)</li>
              <li>Itinerary of US performances</li>
            </ul>
          </section>
          <section>
            <h4 className="mb-1 font-semibold text-slate-800">Support personnel (O-2)</h4>
            <p className="text-slate-600">
              Sound engineers, road managers, and other essential support staff travel on a separate <span className="font-semibold">O-2</span> petition tied to the principal P-1B group filing — not on the P-1B itself.
            </p>
          </section>
        </div>
        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

function StepEvidence({
  form,
  toggleEvidence,
}: {
  form: FormState;
  toggleEvidence: (id: string) => void;
}) {
  const isGroup = form.applicantType === 'group';
  const items = isGroup ? GROUP_EVIDENCE_ITEMS : INDIVIDUAL_EVIDENCE_ITEMS;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Evidence checklist</h2>
          <p className="text-sm text-slate-500">
            Auto-suggested for {form.visaType}
            {isGroup ? ' (group)' : ''}. Adjust to match what you'll attach.
          </p>
        </div>
      </div>

      {isGroup && form.visaType === 'P-1B' && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-indigo-100 bg-indigo-50/60 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
          <p className="text-sm text-indigo-900">
            P-1B petitions require proof that 75% of members have been with the group for 1+ year. We'll verify this during the evidence scan.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          const checked = form.evidence.includes(item.id);
          return (
            <label
              key={item.id}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition',
                checked
                  ? 'border-indigo-500 bg-indigo-50/60'
                  : 'border-slate-200 bg-white hover:border-slate-300',
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleEvidence(item.id)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-300"
              />
              <Icon className={cn('h-5 w-5', checked ? 'text-indigo-500' : 'text-slate-400')} />
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
    </div>
  );
}

interface ScanStep {
  pending: string;
  done: string;
  warning?: boolean;
}

function buildIndividualScanSteps(form: FormState): ScanStep[] {
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

function buildGroupScanSteps(form: FormState): ScanStep[] {
  const handle = form.groupInstagram || form.groupName.replace(/\s+/g, '').toLowerCase() || 'group';
  const tenure = computeTenure(form.groupMembers);
  const total = tenure.total || form.groupMemberCount;
  const qualifying = tenure.total > 0 ? tenure.qualifying : Math.round(total * 0.84);
  const percent = tenure.total > 0 ? tenure.percent : Math.round((qualifying / total) * 100);
  const meets75 = percent >= 75;

  const tenureDone = meets75
    ? `${qualifying} of ${total} members meet 1-year requirement (${percent}%) ✓ Meets 75% threshold`
    : `Warning: Only ${percent}% of members meet tenure requirement. Attorney review recommended.`;

  return [
    {
      pending: `Scanning @${handle} Instagram…`,
      done: 'Found 2,847 posts · 84.3K followers · 47 tagged venues',
    },
    {
      pending: 'Verifying group member tenure…',
      done: tenureDone,
      warning: !meets75,
    },
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

function StepEvidenceScan({
  form,
  onComplete,
}: {
  form: FormState;
  onComplete: () => void;
}) {
  const isGroup = form.applicantType === 'group';
  const steps = useMemo(
    () => (isGroup ? buildGroupScanSteps(form) : buildIndividualScanSteps(form)),
    [form, isGroup],
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
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">AI evidence gathering</h2>
          <p className="text-sm text-slate-500">
            SpinVisa AI is collecting and packaging evidence in real time.
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
  step: ScanStep;
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
