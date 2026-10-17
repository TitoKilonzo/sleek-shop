import { app } from './app.js';
import { config, usingLocalFile } from './config.js';
import { migrate } from './db/client.js';

/** Local development server. In production the same app runs as a serverless function (see api/index.ts). */
await migrate();
app.listen(config.port, '0.0.0.0', () => {
  console.log(`[sleek-api] http://localhost:${config.port} (${usingLocalFile ? 'local file database' : 'Turso'})`);
});
