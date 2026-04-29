import { trace, type Span, type Tracer } from '@opentelemetry/api';

export const tracer: Tracer = trace.getTracer('spinvisa', '0.1.0');

export async function withSpan<T>(
  name: string,
  attributes: Record<string, string | number | boolean | undefined>,
  fn: (span: Span) => Promise<T>,
): Promise<T> {
  const span = tracer.startSpan(name);
  for (const [k, v] of Object.entries(attributes)) {
    if (v !== undefined) span.setAttribute(k, v);
  }
  try {
    return await fn(span);
  } catch (err) {
    span.recordException(err as Error);
    span.setStatus({ code: 2, message: (err as Error).message });
    throw err;
  } finally {
    span.end();
  }
}

export function logEvent(name: string, payload: Record<string, unknown> = {}): void {
  // Axiom drop-in. For now: structured stdout.
  console.log(JSON.stringify({ event: name, ts: new Date().toISOString(), ...payload }));
}

export function captureError(err: unknown, context?: Record<string, unknown>): void {
  // Sentry drop-in.
  console.error('[error]', err, context);
}
