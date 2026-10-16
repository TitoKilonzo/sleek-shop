import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Supports both repo-root .env and apps/api/.env for npm-workspace workflows.
for (const candidate of [resolve(process.cwd(), '.env'), resolve(process.cwd(), '../../.env')]) {
  if (existsSync(candidate)) dotenv.config({ path: candidate, override: false });
}
