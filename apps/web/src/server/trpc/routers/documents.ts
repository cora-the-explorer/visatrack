import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  and,
  desc,
  eq,
  schema,
  createSignedUploadUrl,
  getDocumentUrl,
} from '@spinvisa/db';
import { protectedProcedure, router } from '../init';

const { documents, auditLog } = schema;

const documentKindSchema = z.enum([
  'petition_letter',
  'expert_letter',
  'form_i129',
  'exhibit',
  'cover',
  'other',
]);

export const documentsRouter = router({
  listByCase: protectedProcedure.input(z.string().uuid()).query(async ({ ctx, input }) => {
    const tenantId = ctx.session.tenantId;
    const rows = await ctx.db
      .select()
      .from(documents)
      .where(and(eq(documents.tenantId, tenantId), eq(documents.caseId, input)))
      .orderBy(desc(documents.createdAt));
    return rows;
  }),

  byId: protectedProcedure.input(z.string().uuid()).query(async ({ ctx, input }) => {
    const tenantId = ctx.session.tenantId;
    const rows = await ctx.db
      .select()
      .from(documents)
      .where(and(eq(documents.id, input), eq(documents.tenantId, tenantId)))
      .limit(1);
    return rows[0] ?? null;
  }),

  listByKind: protectedProcedure
    .input(z.object({ kind: documentKindSchema }))
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.tenantId;
      const rows = await ctx.db
        .select()
        .from(documents)
        .where(and(eq(documents.tenantId, tenantId), eq(documents.kind, input.kind)))
        .orderBy(desc(documents.createdAt));
      return rows;
    }),

  getDownloadUrl: protectedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.tenantId;
      const [doc] = await ctx.db
        .select({ storageKey: documents.storageKey })
        .from(documents)
        .where(and(eq(documents.id, input.documentId), eq(documents.tenantId, tenantId)))
        .limit(1);
      if (!doc) throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
      const url = await getDocumentUrl(doc.storageKey);
      return { url };
    }),

  getUploadUrl: protectedProcedure
    .input(
      z.object({
        caseId: z.string().uuid(),
        filename: z.string().min(1),
        contentType: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.tenantId;
      const signed = await createSignedUploadUrl(tenantId, input.caseId, input.filename);
      return signed;
    }),

  confirmUpload: protectedProcedure
    .input(
      z.object({
        caseId: z.string().uuid(),
        storageKey: z.string().min(1),
        title: z.string().min(1),
        kind: documentKindSchema,
        mimeType: z.string().optional(),
        sizeBytes: z.number().int().nonnegative().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.tenantId;
      const userId = ctx.session.userId;

      const [created] = await ctx.db
        .insert(documents)
        .values({
          tenantId,
          caseId: input.caseId,
          kind: input.kind,
          title: input.title,
          storageKey: input.storageKey,
          mimeType: input.mimeType,
          sizeBytes: input.sizeBytes,
          createdByUserId: userId,
        })
        .returning({ id: documents.id });

      if (!created) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create document record',
        });
      }

      await ctx.db.insert(auditLog).values({
        tenantId,
        actorUserId: userId,
        action: 'document.create',
        resourceType: 'document',
        resourceId: created.id,
        diff: { kind: input.kind, title: input.title },
      });

      return { id: created.id };
    }),
});
