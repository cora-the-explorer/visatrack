'use client';

import { useRef, useState } from 'react';
import { CheckCircle2, FileText, Loader2, Upload } from 'lucide-react';
import { Badge, useToast } from '@spinvisa/ui';
import { trpc } from '@/lib/trpc';

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const SUGGESTED_REQUESTS = [
  { title: 'Passport (photo page)', kind: 'other' as const, required: true },
  { title: 'CV / Resume', kind: 'other' as const, required: true },
  { title: 'Award certificates', kind: 'exhibit' as const, required: false },
  { title: 'Press articles or screenshots', kind: 'exhibit' as const, required: false },
];

export function ArtistDocuments() {
  const toast = useToast();
  const utils = trpc.useUtils();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: cases } = trpc.cases.list.useQuery();
  const myCase = cases?.[0];
  const caseId = myCase?.id;

  const { data: docs } = trpc.documents.listByCase.useQuery(caseId ?? '', {
    enabled: !!caseId,
  });

  const getUploadUrl = trpc.documents.getUploadUrl.useMutation();
  const confirmUpload = trpc.documents.confirmUpload.useMutation({
    onSuccess: () => {
      utils.documents.listByCase.invalidate(caseId);
    },
  });

  async function handleFile(file: File) {
    if (!caseId) return;
    setUploading(true);
    try {
      const signed = await getUploadUrl.mutateAsync({
        caseId,
        filename: file.name,
        contentType: file.type,
      });
      const res = await fetch(signed.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: file.type ? { 'content-type': file.type } : undefined,
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      await confirmUpload.mutateAsync({
        caseId,
        storageKey: signed.key,
        title: file.name,
        kind: 'other',
        mimeType: file.type || undefined,
        sizeBytes: file.size,
      });
      toast.show({ variant: 'success', title: 'Uploaded', description: file.name });
    } catch (err) {
      toast.show({
        variant: 'error',
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Documents</h1>
        <p className="mt-2 text-base text-slate-600">
          Send your attorney the files we need to build your petition. We accept PDFs, images,
          and Word docs up to 50MB.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-base font-semibold text-slate-700">What we still need</h2>
        <ul className="space-y-2">
          {SUGGESTED_REQUESTS.map((req) => {
            const matched = docs?.some((d) =>
              d.title.toLowerCase().includes(req.title.split(' ')[0]?.toLowerCase() ?? ''),
            );
            return (
              <li
                key={req.title}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  {matched ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
                  )}
                  <div>
                    <div className="text-base font-medium text-slate-900">{req.title}</div>
                    {req.required && !matched && (
                      <div className="mt-0.5 text-xs text-rose-500">Required</div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-base font-semibold text-slate-700">Upload a file</h2>
        <div
          className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center transition hover:border-indigo-300 hover:bg-indigo-50/30"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          role="button"
          tabIndex={0}
        >
          {uploading ? (
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          ) : (
            <Upload className="h-10 w-10 text-indigo-400" />
          )}
          <div>
            <div className="text-base font-semibold text-slate-900">
              {uploading ? 'Uploading…' : 'Drop a file here or click to browse'}
            </div>
            <div className="mt-1 text-sm text-slate-500">
              PDF, JPG, PNG, DOCX · up to 50MB
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            disabled={uploading || !caseId}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-base font-semibold text-slate-700">Files you've sent</h2>
        {!docs || docs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Nothing uploaded yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {docs.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  <div>
                    <div className="font-medium text-slate-900">{d.title}</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {fmtDate(d.createdAt)}
                    </div>
                  </div>
                </div>
                <Badge variant="success">Received</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
