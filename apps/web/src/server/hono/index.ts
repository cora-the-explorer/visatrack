import { Hono } from 'hono';

const app = new Hono().basePath('/api/hono');

app.get('/health', (c) => c.json({ ok: true, ts: Date.now() }));

// Trigger.dev callback — agent run progress updates
app.post('/agents/callback', async (c) => {
  return c.json({ ok: true });
});

// Pre-signed upload completion webhook
app.post('/uploads/complete', async (c) => {
  return c.json({ ok: true });
});

export { app as honoApp };
