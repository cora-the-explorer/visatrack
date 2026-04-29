// Voyage AI embeddings + pgvector retrieval. Stubbed.

export const VOYAGE_MODEL = 'voyage-3-large';
export const EMBED_DIMS = 1024;

export interface EmbedOptions {
  inputType?: 'document' | 'query';
}

export async function embedTexts(_texts: string[], _opts: EmbedOptions = {}): Promise<number[][]> {
  // TODO: call Voyage AI API
  throw new Error('embedTexts not implemented');
}

export interface RetrieveOptions {
  tenantId: string;
  caseId?: string;
  query: string;
  topK?: number;
}

export interface RetrievedChunk {
  documentId: string;
  chunkId: string;
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export async function retrieve(_opts: RetrieveOptions): Promise<RetrievedChunk[]> {
  // TODO: embed query, run pgvector cosine search scoped by tenantId
  return [];
}
