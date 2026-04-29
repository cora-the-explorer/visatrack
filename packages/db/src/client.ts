import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const url = process.env.DATABASE_URL;

if (!url && process.env.NODE_ENV === 'production') {
  throw new Error('DATABASE_URL is required in production');
}

const sql = neon(url ?? 'postgresql://localhost:5432/spinvisa_dev');

export const db = drizzle(sql, { schema });
export type DB = typeof db;
export { schema };
