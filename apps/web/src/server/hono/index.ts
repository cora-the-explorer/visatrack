import { Hono } from 'hono';

const app = new Hono().basePath('/api/hono');

app.get('/health', (c) => c.json({ ok: true, ts: Date.now() }));

// Trigger.dev callback — agent run progress updates
app.post('/agents/callback', async (c) => {
  // TODO: verify signature, update agent_runs row
  return c.json({ ok: true });
});

// Pre-signed upload completion webhook
app.post('/uploads/complete', async (c) => {
  // TODO: persist documents row + kick off ingestion
  return c.json({ ok: true });
});

export { app as honoApp };
