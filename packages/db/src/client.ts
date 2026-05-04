import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres, { type Sql } from 'postgres';
import * as schema from './schema';

let _client: Sql | null = null;
let _db: PostgresJsDatabase<typeof schema> | null = null;

function getConnectionUrl(): string {
  const url = process.env.DATABASE_URL;
  if (url) return url;
  if (process.env.NODE_ENV === 'production' && !process.env.SKIP_DB_CHECK) {
    throw new Error('DATABASE_URL is required in production');
  }
  return 'postgresql://localhost:5432/visa_track_dev';
}

function getDb(): PostgresJsDatabase<typeof schema> {
  if (_db) return _db;
  _client = postgres(getConnectionUrl(), { prepare: false, max: 1 });
  _db = drizzle(_client, { schema });
  return _db;
}

export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb() as object, prop, receiver);
  },
});

export type DB = PostgresJsDatabase<typeof schema>;
export { schema };
