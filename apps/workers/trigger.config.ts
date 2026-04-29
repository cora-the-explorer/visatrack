import { defineConfig } from '@trigger.dev/sdk/v3';

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_ID ?? 'spinvisa',
  runtime: 'node',
  logLevel: 'info',
  maxDuration: 3600,
  retries: { enabledInDev: false, default: { maxAttempts: 3 } },
  dirs: ['./src/tasks'],
});
