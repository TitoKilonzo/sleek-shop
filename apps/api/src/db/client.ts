import { createClient } from '@libsql/client';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from '../config.js';
import { schema } from './schema.js';

if (config.databaseUrl.startsWith('file:') && !config.databaseUrl.includes(':memory:')) {
  mkdirSync(dirname(config.databaseUrl.replace(/^file:/, '')), { recursive: true });
}

export const db = createClient({ url: config.databaseUrl, authToken: config.databaseToken });

export async function migrate() {
  await db.batch(schema.map((sql) => ({ sql, args: [] })), 'write');
}
