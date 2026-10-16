import { app } from './app.js';

const port = Number(process.env.PORT ?? 4000);
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`[sleek-api] listening on 0.0.0.0:${port}`);
});

function shutdown(signal: string) {
  console.log(`[sleek-api] received ${signal}; closing server`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
