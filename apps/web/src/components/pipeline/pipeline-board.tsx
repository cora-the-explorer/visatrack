'use client';

import Link from 'next/link';
import { useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { Briefcase } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { KanbanCard } from '@visa-track/ui';
import { trpc } from '@/lib/trpc';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import type { CaseStatus } from '@visa-track/api-types';

type StageId = 'intake' | 'docs' | 'draft' | 'rfe' | 'approved' | 'denied';

const COLUMNS: { id: StageId; title: string }[] = [
  { id: 'intake', title: 'Intake' },
  { id: 'docs', title: 'Docs Gathering' },
  { id: 'draft', title: 'Petition Draft' },
  { id: 'rfe', title: 'RFE Response' },
  { id: 'approved', title: 'Approved' },
  { id: 'denied', title: 'Denied' },
];

const STATUS_TO_STAGE: Record<CaseStatus, StageId> = {
  intake: 'intake',
  evidence: 'docs',
  drafting: 'draft',
  review: 'draft',
  filed: 'approved',
  approved: 'approved',
  denied: 'denied',
  rfe: 'rfe',
  withdrawn: 'denied',
};

const STAGE_TO_STATUS: Record<StageId, CaseStatus> = {
  intake: 'intake',
  docs: 'evidence',
  draft: 'drafting',
  rfe: 'rfe',
  approved: 'approved',
  denied: 'denied',
};

interface PipelineRow {
  id: string;
  name: string;
  type: string;
  attorney: string;
  days: number;
  score: number;
  stage: StageId;
}

function daysSince(d: Date | null | undefined): number {
  if (!d) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000));
}

function DraggableCard({ row }: { row: PipelineRow }) {
  const router = useRouter();
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({ id: row.id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onPointerDown={(e) => {
        pointerStart.current = { x: e.clientX, y: e.clientY };
      }}
      onClick={(e) => {
        if (!pointerStart.current) return;
        const dx = e.clientX - pointerStart.current.x;
        const dy = e.clientY - pointerStart.current.y;
        if (Math.sqrt(dx * dx + dy * dy) < 5) {
          router.push(`/cases/${row.id}`);
        }
        pointerStart.current = null;
      }}
    >
      <KanbanCard
        name={row.name}
        visa={row.type}
        attorney={row.attorney}
        days={row.days}
        score={row.score}
        dragging={isDragging}
      />
    </div>
  );
}

function DroppableColumn({
  id,
  title,
  count,
  children,
}: {
  id: StageId;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`flex w-[300px] min-w-[300px] flex-col rounded-xl bg-slate-100 p-4 transition ${
        isOver ? 'ring-2 ring-indigo-300' : ''
      }`}
    >
      <div className="mb-4 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
        <span>{title}</span>
        <span>{count}</span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto">{children}</div>
    </div>
  );
}

export function PipelineBoard() {
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.cases.list.useQuery();
  const updateCase = trpc.cases.update.useMutation({
    onSuccess: () => utils.cases.list.invalidate(),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const rows: PipelineRow[] = useMemo(() => {
    if (!data) return [];
    return data.map((c) => ({
      id: c.id,
      name: c.artistName ?? c.title,
      type: c.visaType,
      attorney: c.leadAttorneyName ?? 'Unassigned',
      days: daysSince(c.createdAt),
      score: 0,
      stage: STATUS_TO_STAGE[c.status],
    }));
  }, [data]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const channel = supabase
      .channel('cases-pipeline')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cases' },
        () => {
          utils.cases.list.invalidate();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [utils, queryClient]);

  const grouped = useMemo(() => {
    const map: Record<StageId, PipelineRow[]> = {
      intake: [],
      docs: [],
      draft: [],
      rfe: [],
      approved: [],
      denied: [],
    };
    for (const row of rows) map[row.stage].push(row);
    return map;
  }, [rows]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const id = String(active.id);
    const stage = over.id as StageId;
    const row = rows.find((r) => r.id === id);
    if (!row || row.stage === stage) return;
    updateCase.mutate({ id, patch: { status: STAGE_TO_STATUS[stage] } });
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
        Loading pipeline…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto mt-16 max-w-md rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
            <Briefcase className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">No cases yet</h2>
          <p className="mt-1.5 text-sm text-slate-500">Create your first case to get started.</p>
          <Link
            href="/cases/new"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
          >
            + New Case
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex h-[calc(100vh-180px)] gap-6 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <DroppableColumn
              key={col.id}
              id={col.id}
              title={col.title}
              count={grouped[col.id].length}
            >
              {grouped[col.id].map((row) => (
                <DraggableCard key={row.id} row={row} />
              ))}
            </DroppableColumn>
          ))}
        </div>
      </DndContext>
    </div>
  );
}
