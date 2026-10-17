import { app } from './app.js';
import { config, usingLocalFile } from './config.js';
import { migrate } from './db/client.js';

await migrate();
if (config.production && usingLocalFile) console.warn('[sleek-api] WARNING: production is running on a local database file. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.');

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`[sleek-api] listening on 0.0.0.0:${config.port} (${usingLocalFile ? 'local file database' : 'Turso'})`);
});

function shutdown(signal: string) {
  console.log(`[sleek-api] received ${signal}; closing server`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
