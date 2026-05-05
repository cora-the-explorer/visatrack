// Seed script for the marketplace MVP. Writes 3 approved firms + 5 in-flight cases.
// In demo mode (no DATABASE_URL), this writes to apps/web/.data/marketplace.json so the
// Next.js app picks it up on first request. With DATABASE_URL set, runs Drizzle inserts.
//
// Usage:
//   pnpm --filter @visa-track/db tsx src/seed-marketplace.ts
//
// You can also call this idempotently from the Next.js app — the JSON store auto-seeds
// on first read if the file doesn't exist.

import path from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');
const DATA_DIR = path.join(REPO_ROOT, 'apps/web/.data');
const STORE_PATH = path.join(DATA_DIR, 'marketplace.json');

async function main() {
  // We import the seed-data builder dynamically so this script can run even when the
  // web app isn't built. The seed-data file is also imported by the web runtime.
  const seedModulePath = path.join(REPO_ROOT, 'apps/web/src/lib/seed-data.ts');
  const fileUrl = new URL(`file://${seedModulePath}`).href;
  // Use jiti / tsx implicit transform — script is run via tsx.
  const mod = (await import(fileUrl)) as { buildSeed: () => unknown };
  const seed = mod.buildSeed();

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(seed, null, 2), 'utf8');
  console.log(`✓ wrote seed → ${STORE_PATH}`);

  if (process.env.DATABASE_URL) {
    console.log('NOTE: DATABASE_URL is set, but this seed only writes the file-backed store.');
    console.log('      Ad-hoc inserts into Postgres are not yet wired up — run drizzle-kit push first.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
